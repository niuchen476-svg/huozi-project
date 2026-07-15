import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")?.replace(/\/$/, "");
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const PUBLIC_APP_URL = (Deno.env.get("PUBLIC_APP_URL") ?? "https://niuchen476-svg.github.io/huozi-project/").replace(/\/$/, "");
const BUCKET = "souvenirs";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_SAVES_PER_WINDOW = 3;
const saveLog = new Map<string, number[]>();
const TOKEN_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SAFE_ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/;
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

function reserveSave(ip: string) {
  const now = Date.now();
  const recent = (saveLog.get(ip) || []).filter((time) => now - time < RATE_WINDOW_MS);
  if (recent.length >= MAX_SAVES_PER_WINDOW) {
    throw Object.assign(new Error("十分钟内最多保存三份作品，请稍后再试"), { status: 429 });
  }
  recent.push(now);
  saveLog.set(ip, recent);
}

async function cleanupExpired() {
  const query = new URLSearchParams({
    expires_at: `lt.${new Date().toISOString()}`,
    select: "token,image_path",
    limit: "20",
  });
  const response = await adminFetch(`/rest/v1/souvenir_works?${query}`);
  if (!response.ok) return;
  const records = await response.json();
  if (!Array.isArray(records) || !records.length) return;
  for (const record of records) {
    if (typeof record?.image_path === "string") {
      await adminFetch(`/storage/v1/object/${BUCKET}/${record.image_path}`, { method: "DELETE" }).catch(() => {});
    }
  }
  const tokens = records.map((record) => record?.token).filter(Boolean).join(",");
  if (tokens) await adminFetch(`/rest/v1/souvenir_works?token=in.(${tokens})`, { method: "DELETE" }).catch(() => {});
}

async function createSouvenir(body: Record<string, unknown>) {
  const playerName = cleanText(body.playerName, 20);
  const themeId = cleanText(body.themeId, 80);
  if (!playerName || !themeId) throw Object.assign(new Error("作品缺少署名或主题"), { status: 400 });
  const image = decodeImage(body.imageDataUrl);
  const token = crypto.randomUUID();
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);
  const imagePath = `${createdAt.toISOString().slice(0, 10)}/${token}.${image.extension}`;

  const upload = await adminFetch(`/storage/v1/object/${BUCKET}/${imagePath}`, {
    method: "POST",
    headers: { "content-type": image.contentType, "x-upsert": "false" },
    body: image.bytes,
  });
  if (!upload.ok) throw Object.assign(new Error("作品图片保存失败"), { status: 502 });

  const record = {
    token,
    image_path: imagePath,
    player_name: playerName,
    theme_id: themeId,
    fragment_ids: cleanIds(body.fragmentIds, 3),
    source_ids: cleanIds(body.sourceIds, 3),
    favorite_fragment_id: cleanText(body.favoriteFragmentId, 80) || null,
    expression_title: cleanText(body.expressionTitle, 40),
    expression_text: cleanText(body.expressionText, 240),
    generated_by_ai: body.generatedByAi === true,
    expires_at: expiresAt.toISOString(),
  };
  const insert = await adminFetch("/rest/v1/souvenir_works", {
    method: "POST",
    headers: { "content-type": "application/json", prefer: "return=minimal" },
    body: JSON.stringify(record),
  });
  if (!insert.ok) {
    await adminFetch(`/storage/v1/object/${BUCKET}/${imagePath}`, { method: "DELETE" }).catch(() => {});
    throw Object.assign(new Error("作品信息保存失败"), { status: 502 });
  }
  return {
    token,
    shareUrl: `${PUBLIC_APP_URL}/#/souvenir/${token}`,
    expiresAt: expiresAt.toISOString(),
  };
}

async function readSouvenir(token: string) {
  if (!TOKEN_PATTERN.test(token)) throw Object.assign(new Error("作品编号无效"), { status: 400 });
  const query = new URLSearchParams({
    token: `eq.${token}`,
    select: "token,image_path,player_name,theme_id,fragment_ids,source_ids,favorite_fragment_id,expression_title,expression_text,generated_by_ai,created_at,expires_at",
    limit: "1",
  });
  const response = await adminFetch(`/rest/v1/souvenir_works?${query}`);
  if (!response.ok) throw Object.assign(new Error("作品读取失败"), { status: 502 });
  const [record] = await response.json();
  if (!record) throw Object.assign(new Error("没有找到这份作品"), { status: 404 });
  if (new Date(record.expires_at).getTime() <= Date.now()) {
    throw Object.assign(new Error("这份作品已经超过保存期限"), { status: 410 });
  }
  const sign = await adminFetch(`/storage/v1/object/sign/${BUCKET}/${record.image_path}`, {
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
  return {
    token: record.token,
    imageUrl,
    playerName: record.player_name,
    themeId: record.theme_id,
    fragmentIds: record.fragment_ids,
    sourceIds: record.source_ids,
    favoriteFragmentId: record.favorite_fragment_id,
    expressionTitle: record.expression_title,
    expressionText: record.expression_text,
    generatedByAi: record.generated_by_ai,
    createdAt: record.created_at,
    expiresAt: record.expires_at,
  };
}

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
    try {
      if (req.method === "POST") {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        reserveSave(ip);
        await cleanupExpired().catch(() => {});
        return json(await createSouvenir(await req.json()));
      }
      if (req.method === "GET") {
        const token = new URL(req.url).searchParams.get("token") || "";
        return json(await readSouvenir(token));
      }
      return json({ error: "仅支持 GET 和 POST" }, 405);
    } catch (error) {
      const value = error as Error & { status?: number };
      return json({ error: value.message || "作品服务暂时不可用" }, value.status || 500);
    }
  }),
};
