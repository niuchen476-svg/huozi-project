import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_API_BASE = "https://aihubmix.com/v1";
const DEFAULT_MODEL = "qwen-image-2.0";
export const AIHUBMIX_IMAGE_TIMEOUT_MS = 120000;
const usageFile = fileURLToPath(new URL("../../storage/image-usage.json", import.meta.url));

function enabled(value) {
  return String(value || "").toLowerCase() === "true";
}

function cleanBaseUrl(value) {
  return String(value || DEFAULT_API_BASE).replace(/\/$/, "");
}

export async function reserveDailyImageCall({
  limit = Number(process.env.AIHUBMIX_IMAGE_DAILY_LIMIT || 1),
  filePath = usageFile,
  now = new Date(),
} = {}) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 1, 20));
  const day = now.toISOString().slice(0, 10);
  let usage = {};
  try {
    usage = JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  const count = usage.day === day ? Number(usage.count || 0) : 0;
  if (count >= safeLimit) {
    throw Object.assign(new Error(`今日 AI 生图额度已用完（上限 ${safeLimit} 张）`), { statusCode: 429 });
  }
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify({ day, count: count + 1 }, null, 2), "utf8");
  return { day, count: count + 1, limit: safeLimit };
}

export function getImageGenerationUrl(apiBase = DEFAULT_API_BASE) {
  return `${cleanBaseUrl(apiBase)}/images/generations`;
}

export function getImagePredictionUrl(apiBase = DEFAULT_API_BASE, model = DEFAULT_MODEL) {
  const rawModel = String(model || DEFAULT_MODEL).replace(/^\/+|\/+$/g, "");
  const modelPath = rawModel.includes("/") ? rawModel : `qianfan/${rawModel}`;
  return `${cleanBaseUrl(apiBase)}/models/${modelPath}/predictions`;
}

function normalizeModel(model = DEFAULT_MODEL) {
  // 兼容早期配置中的 qianfan/qwen-image-2.0；OpenAI 兼容接口要求只传模型 ID。
  return String(model || DEFAULT_MODEL).split("/").filter(Boolean).at(-1) || DEFAULT_MODEL;
}

function firstImageCandidate(payload) {
  const values = [
    ...(Array.isArray(payload?.output) ? payload.output : [payload?.output]),
    ...(Array.isArray(payload?.data) ? payload.data : []),
    ...(Array.isArray(payload?.images) ? payload.images : []),
  ].filter(Boolean);

  for (const value of values) {
    if (typeof value === "string") {
      if (/^https?:\/\//i.test(value)) return { url: value };
      if (/^(data:image\/|[A-Za-z0-9+/]{80,}={0,2}$)/.test(value)) return { b64Json: value };
    }
    if (typeof value === "object") {
      const url = value.url || value.image_url || value.imageUrl;
      const b64Json = value.b64_json || value.base64 || value.image_base64;
      if (typeof url === "string" && /^https?:\/\//i.test(url)) return { url };
      if (typeof b64Json === "string" && b64Json) return { b64Json };
    }
  }
  throw new Error("生图服务未返回可用图片");
}

export async function callAihubmixImage({
  prompt,
  size = "1024*576",
  referenceImages = [],
  apiBase = process.env.AIHUBMIX_API_BASE,
  apiKey = process.env.AIHUBMIX_API_KEY,
  model = process.env.AIHUBMIX_IMAGE_MODEL,
  imageEnabled = process.env.AIHUBMIX_IMAGE_ENABLED,
  timeoutMs = AIHUBMIX_IMAGE_TIMEOUT_MS,
  fetchImpl = fetch,
  reserveBudget = reserveDailyImageCall,
} = {}) {
  if (!enabled(imageEnabled)) {
    throw Object.assign(new Error("在线生图尚未启用，未产生任何费用"), { statusCode: 503 });
  }
  if (!apiKey) {
    throw Object.assign(new Error("缺少 AIHUBMIX_API_KEY，请检查 backend/.env"), { statusCode: 503 });
  }

  // 在发出付费请求前先占用当日额度。即使上游超时也不自动归还，避免刷新重试产生连续费用。
  await reserveBudget();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const images = Array.isArray(referenceImages)
      ? referenceImages.filter((value) => typeof value === "string" && /^(https?:|data:image\/)/i.test(value)).slice(0, 3)
      : [];
    const response = await fetchImpl(getImagePredictionUrl(apiBase, model), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ input: {
        prompt,
        ...(images.length ? { images } : {}),
        n: 1,
        size,
        watermark: false,
        prompt_extend: false,
        negative_prompt: "任何文字、汉字、字母、数字、日期、标题、标语、题字、署名、水印、二维码、边框，现代建筑，现代武器，错误年代信息",
      } }),
      signal: controller.signal,
    });
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 500);
      throw Object.assign(new Error(`生图服务请求失败（${response.status}）${detail ? `：${detail}` : ""}`), {
        statusCode: response.status === 429 ? 429 : 502,
        providerStatus: response.status,
      });
    }
    return firstImageCandidate(await response.json());
  } catch (error) {
    if (error?.name === "AbortError") {
      throw Object.assign(new Error("生图等待超时，本次不自动重试"), { statusCode: 504 });
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
