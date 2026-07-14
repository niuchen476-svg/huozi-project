import "dotenv/config";

const MIMO_API_BASE = process.env.MIMO_API_BASE;
const MIMO_API_KEY = process.env.MIMO_API_KEY;
const MIMO_MODEL = process.env.MIMO_MODEL || "mimo-v2.5";

export function getMimoChatCompletionsUrl(apiBase) {
  const normalized = String(apiBase || "").trim().replace(/\/$/, "").replace(/\/anthropic$/, "");
  return normalized.endsWith("/v1")
    ? `${normalized}/chat/completions`
    : `${normalized}/v1/chat/completions`;
}

export async function callMimo({
  system,
  prompt,
  maxTokens = 4096,
  timeoutMs = 60000,
  fetchImpl = fetch,
  apiBase = MIMO_API_BASE,
  apiKey = MIMO_API_KEY,
  model = MIMO_MODEL,
}) {
  if (!apiBase || !apiKey) {
    throw new Error("缺少 MIMO_API_BASE 或 MIMO_API_KEY，请检查 backend/.env");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let res;
  try {
    res = await fetchImpl(getMimoChatCompletionsUrl(apiBase), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        thinking: { type: "disabled" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err?.name === "AbortError") throw new Error("MiMo API 请求超时");
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MiMo API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("MiMo API 返回内容中没有可解析的正文");
  }
  return text;
}

export async function callMimoTts({
  text,
  style = "沉稳、温暖、清晰的中文博物馆讲解语气，语速稍慢。",
  voice = "白桦",
  format = "mp3",
  timeoutMs = 60000,
  fetchImpl = fetch,
  apiBase = MIMO_API_BASE,
  apiKey = MIMO_API_KEY,
  model = "mimo-v2.5-tts",
}) {
  if (!apiBase || !apiKey) {
    throw new Error("缺少 MIMO_API_BASE 或 MIMO_API_KEY，请检查 backend/.env");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let res;
  try {
    res = await fetchImpl(getMimoChatCompletionsUrl(apiBase), {
      method: "POST",
      headers: { "content-type": "application/json", "api-key": apiKey },
      body: JSON.stringify({
        model,
        messages: [
          { role: "user", content: style },
          { role: "assistant", content: text },
        ],
        audio: { format, voice },
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err?.name === "AbortError") throw new Error("MiMo TTS 请求超时");
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const responseText = await res.text();
    throw new Error(`MiMo TTS API error ${res.status}: ${responseText}`);
  }

  const data = await res.json();
  const audio = data.choices?.[0]?.message?.audio;
  if (typeof audio?.data !== "string" || !audio.data) {
    throw new Error("MiMo TTS 返回内容中没有音频");
  }
  return { data: audio.data, id: audio.id, expiresAt: audio.expires_at, format, voice };
}
