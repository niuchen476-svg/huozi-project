import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")?.replace(/\/$/, "");
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const PUBLIC_APP_URL = (Deno.env.get("PUBLIC_APP_URL") ?? "https://niuchen476-svg.github.io/huozi-project/").replace(/\/$/, "");
const BUCKET = "souvenirs";
const IMAGE_PREFIX = "images";
const METADATA_PREFIX = "metadata";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_SAVES_PER_WINDOW = 3;
const TOKEN_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SAFE_ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/;
const saveLog = new Map<string, number[]>();
let bucketReady: Promise<void> | null = null;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "content-type": "application/json" },
  });
}

function cleanText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "";
}

function cleanIds(value: unknown, max: number) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id) => typeof id === "string" && SAFE_ID.test(id)))].slice(0, max) as string[];
}

function decodeImage(value: unknown) {
  const match = String(value || "").match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw Object.assign(new Error("作品图片格式不正确"), { status: 400 });
  const binary = atob(match[2]);
  if (!binary.length || binary.length > MAX_IMAGE_BYTES) {
    throw Object.assign(new Error("作品图片大小异常"), { status: 413 });
  }
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return { bytes, contentType: match[1], extension: match[1].split("/")[1].replace("jpeg", "jpg") };
}

function requireAdminConfig() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw Object.assign(new Error("作品存储服务尚未配置"), { status: 503 });
  }
}

async function adminFetch(path: string, init: RequestInit = {}) {
  requireAdminConfig();
  return fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY!,
      authorization: `Bearer ${SERVICE_KEY}`,
      ...(init.headers || {}),
    },
  });
}

async function ensureBucket() {
  if (!bucketReady) {
    bucketReady = (async () => {
      const existing = await adminFetch(`/storage/v1/bucket/${BUCKET}`);
      if (existing.ok) return;
      // Storage API 对“不存在的 bucket”在不同版本中可能返回 400 或 404；
      // 直接尝试幂等创建，再以 409 作为“已经存在”的成功结果。
      if (existing.status === 401 || existing.status === 403) {
        throw new Error(`作品存储服务认证失败（${existing.status}）`);
      }
      const created = await adminFetch("/storage/v1/bucket", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: BUCKET,
          name: BUCKET,
          public: false,
          file_size_limit: MAX_IMAGE_BYTES,
          allowed_mime_types: ["image/jpeg", "image/png", "image/webp", "application/json"],
        }),
      });
      if (!created.ok && created.status !== 409) {
        const detail = (await created.text()).slice(0, 180);
        throw new Error(`作品存储桶创建失败（${created.status}）${detail ? `：${detail}` : ""}`);
      }
    })();
  }
  try {
    await bucketReady;
  } catch (error) {
    bucketReady = null;
    throw error;
  }
}

function reserveSave(ip: string) {
  const now = Date.now();
  const recent = (saveLog.get(ip) || []).filter((time) => now - time < RATE_WINDOW_MS);
  if (recent.length >= MAX_SAVES_PER_WINDOW) {
    throw Object.assign(new Error("十分钟内最多保存三份作品，请稍后再试"), { status: 429 });
  }
  recent.push(now);
  saveLog.set(ip, recent);
}

async function uploadObject(path: string, body: BodyInit, contentType: string) {
  const response = await adminFetch(`/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: { "content-type": contentType, "x-upsert": "false" },
    body,
  });
  if (!response.ok) throw new Error(`作品文件保存失败（${response.status}）`);
}

async function deleteObject(path: string) {
  await adminFetch(`/storage/v1/object/${BUCKET}/${path}`, { method: "DELETE" }).catch(() => {});
}

async function readMetadata(token: string) {
  const path = `${METADATA_PREFIX}/${token}.json`;
  const response = await adminFetch(`/storage/v1/object/authenticated/${BUCKET}/${path}`);
  if (response.status === 404) throw Object.assign(new Error("没有找到这份作品"), { status: 404 });
  if (!response.ok) throw Object.assign(new Error("作品信息读取失败"), { status: 502 });
  return response.json();
}

async function cleanupExpired() {
  const response = await adminFetch(`/storage/v1/object/list/${BUCKET}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      prefix: METADATA_PREFIX,
      limit: 20,
      sortBy: { column: "created_at", order: "asc" },
    }),
  });
  if (!response.ok) return;
  const entries = await response.json();
  if (!Array.isArray(entries)) return;
  for (const entry of entries) {
    const filename = typeof entry?.name === "string" ? entry.name : "";
    const match = filename.match(/^([0-9a-f-]{36})\.json$/i);
    if (!match || !TOKEN_PATTERN.test(match[1])) continue;
    try {
      const metadata = await readMetadata(match[1]);
      if (new Date(metadata.expiresAt).getTime() > Date.now()) continue;
      await Promise.all([
        deleteObject(`${METADATA_PREFIX}/${filename}`),
        typeof metadata.imagePath === "string" ? deleteObject(metadata.imagePath) : Promise.resolve(),
      ]);
    } catch {
      // 单份历史作品损坏不阻断本次保存。
    }
  }
}

async function createSouvenir(body: Record<string, unknown>) {
  const playerName = cleanText(body.playerName, 20);
  const themeId = cleanText(body.themeId, 80);
  if (!playerName || !themeId) throw Object.assign(new Error("作品缺少署名或主题"), { status: 400 });
  const image = decodeImage(body.imageDataUrl);
  const token = crypto.randomUUID();
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);
  const imagePath = `${IMAGE_PREFIX}/${token}.${image.extension}`;
  const metadataPath = `${METADATA_PREFIX}/${token}.json`;
  const metadata = {
    token,
    imagePath,
    playerName,
    themeId,
    fragmentIds: cleanIds(body.fragmentIds, 3),
    sourceIds: cleanIds(body.sourceIds, 3),
    favoriteFragmentId: cleanText(body.favoriteFragmentId, 80) || null,
    expressionTitle: cleanText(body.expressionTitle, 40),
    expressionText: cleanText(body.expressionText, 240),
    generatedByAi: body.generatedByAi === true,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  await ensureBucket();
  await uploadObject(imagePath, image.bytes, image.contentType);
  try {
    await uploadObject(metadataPath, JSON.stringify(metadata), "application/json");
  } catch (error) {
    await deleteObject(imagePath);
    throw error;
  }
  return {
    token,
    shareUrl: `${PUBLIC_APP_URL}/#/souvenir/${token}`,
    expiresAt: metadata.expiresAt,
  };
}

async function readSouvenir(token: string) {
  if (!TOKEN_PATTERN.test(token)) throw Object.assign(new Error("作品编号无效"), { status: 400 });
  await ensureBucket();
  const metadata = await readMetadata(token);
  if (new Date(metadata.expiresAt).getTime() <= Date.now()) {
    await Promise.all([
      deleteObject(`${METADATA_PREFIX}/${token}.json`),
      typeof metadata.imagePath === "string" ? deleteObject(metadata.imagePath) : Promise.resolve(),
    ]);
    throw Object.assign(new Error("这份作品已经超过保存期限"), { status: 410 });
  }
  const sign = await adminFetch(`/storage/v1/object/sign/${BUCKET}/${metadata.imagePath}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ expiresIn: 600 }),
  });
  if (!sign.ok) throw Object.assign(new Error("作品图片暂时无法打开"), { status: 502 });
  const signed = await sign.json();
  const signedPath = signed.signedURL || signed.signedUrl;
  const imageUrl = /^https?:/i.test(signedPath)
    ? signedPath
    : `${SUPABASE_URL}/storage/v1${signedPath}`;
  return { ...metadata, imageUrl, imagePath: undefined };
}

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
    const requestId = `souvenir-${crypto.randomUUID()}`;
    try {
      if (req.method === "POST") {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        reserveSave(ip);
        await ensureBucket();
        await cleanupExpired().catch(() => {});
        return json({ ...(await createSouvenir(await req.json())), requestId });
      }
      if (req.method === "GET") {
        const token = new URL(req.url).searchParams.get("token") || "";
        return json({ ...(await readSouvenir(token)), requestId });
      }
      return json({ error: "仅支持 GET 和 POST", requestId }, 405);
    } catch (error) {
      const value = error as Error & { status?: number };
      return json({ error: value.message || "作品服务暂时不可用", requestId }, value.status || 500);
    }
  }),
};
