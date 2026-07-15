import { randomUUID } from "node:crypto";

export function createAiRequestId(prefix = "ai") {
  return `${prefix}-${randomUUID()}`;
}

export function classifyAiFailure(error) {
  const message = String(error?.message || "").toLowerCase();
  const status = Number(error?.providerStatus || error?.statusCode || error?.status || 0);
  if (status === 429 || /额度|限额|quota|rate limit|too many/.test(message)) return "quota";
  if (status === 401 || status === 403 || /api[_ -]?key|密钥|认证|unauthorized|forbidden/.test(message)) return "auth";
  if (status === 400 || /校验|参数|invalid|未开放/.test(message)) return "validation";
  if (status === 408 || status === 504 || /超时|timeout|abort/.test(message)) return "timeout";
  if (status === 503 || /尚未启用|尚未配置|缺少/.test(message)) return "config";
  if (/返回内容|不是合法|没有可解析|未返回可用/.test(message)) return "response";
  return "upstream";
}

export function getLocalAiStatus() {
  const imageEnabled = String(process.env.AIHUBMIX_IMAGE_ENABLED || "").toLowerCase() === "true";
  return {
    text: {
      configured: Boolean(process.env.MIMO_API_BASE && process.env.MIMO_API_KEY),
      model: process.env.MIMO_MODEL || "mimo-v2.5",
    },
    image: {
      configured: Boolean(process.env.AIHUBMIX_API_KEY),
      enabled: imageEnabled,
      model: (process.env.AIHUBMIX_IMAGE_MODEL || "qwen-image-2.0").split("/").at(-1),
      dailyLimit: Math.max(1, Math.min(Number(process.env.AIHUBMIX_IMAGE_DAILY_LIMIT || 1), 20)),
    },
  };
}
