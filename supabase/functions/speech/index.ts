import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const MIMO_API_BASE = Deno.env.get("MIMO_API_BASE");
const MIMO_API_KEY = Deno.env.get("MIMO_API_KEY");
const MAX_SPEECH_CHARACTERS = 220;
const MAX_SPEECH_CHUNK_CHARACTERS = 32;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 20;
const rateLog = new Map<string, number[]>();

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "content-type": "application/json" },
  });
}

function getEndpoint(apiBase: string) {
  const normalized = apiBase.replace(/\/$/, "").replace(/\/anthropic$/, "");
  return normalized.endsWith("/v1")
    ? `${normalized}/chat/completions`
    : `${normalized}/v1/chat/completions`;
}

function splitSpeechText(text: string) {
  const sentences = text.match(/[^。！？；!?;]+[。！？；!?;]?/g) ?? [];
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (sentence.length > MAX_SPEECH_CHUNK_CHARACTERS) {
      if (current) chunks.push(current);
      current = "";
      for (let index = 0; index < sentence.length; index += MAX_SPEECH_CHUNK_CHARACTERS) {
        chunks.push(sentence.slice(index, index + MAX_SPEECH_CHUNK_CHARACTERS));
      }
    } else if (!current || current.length + sentence.length <= MAX_SPEECH_CHUNK_CHARACTERS) {
      current += sentence;
    } else {
      chunks.push(current);
      current = sentence;
    }
  }
  if (current) chunks.push(current);
  return chunks.filter(Boolean);
}

async function synthesize(text: string) {
  if (!MIMO_API_BASE || !MIMO_API_KEY) throw new Error("MiMo TTS 服务尚未配置");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(getEndpoint(MIMO_API_BASE), {
      method: "POST",
      headers: { "content-type": "application/json", "api-key": MIMO_API_KEY },
      body: JSON.stringify({
        model: "mimo-v2.5-tts",
        messages: [
          { role: "user", content: "沉稳、温暖、清晰的中文博物馆讲解语气，语速稍慢。" },
          { role: "assistant", content: text },
        ],
        audio: { format: "mp3", voice: "白桦" },
      }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`MiMo TTS API error ${response.status}`);
    const data = await response.json();
    const audio = data.choices?.[0]?.message?.audio;
    if (!audio?.data) throw new Error("MiMo TTS 返回内容中没有音频");
    return {
      audioDataUrl: `data:audio/mpeg;base64,${audio.data}`,
      mimeType: "audio/mpeg",
      voice: "白桦",
      usedFallback: false,
    };
  } finally {
    clearTimeout(timer);
  }
}

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
    if (req.method !== "POST") return json({ error: "仅支持 POST" }, 405);

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const now = Date.now();
    const recent = (rateLog.get(ip) ?? []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
    if (recent.length >= RATE_LIMIT_MAX) return json({ error: "朗读请求过于频繁，请稍后再试" }, 429);
    recent.push(now);
    rateLog.set(ip, recent);

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json({ error: "请求内容不是合法 JSON" }, 400);
    }
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) return json({ error: "缺少需要朗读的文字" }, 400);
    if (text.length > MAX_SPEECH_CHARACTERS) {
      return json({ error: `朗读文字不能超过 ${MAX_SPEECH_CHARACTERS} 字` }, 400);
    }

    try {
      const chunks = splitSpeechText(text);
      const audioParts = await Promise.all(chunks.map((chunk) => synthesize(chunk)));
      const audioDataUrls = audioParts.map((part) => part.audioDataUrl);
      return json({
        audioDataUrl: audioDataUrls[0],
        audioDataUrls,
        mimeType: "audio/mpeg",
        voice: "白桦",
        segmentCount: audioDataUrls.length,
        usedFallback: false,
      });
    } catch (err) {
      console.error(`[speech] ${(err as Error).message}`);
      return json({ error: "语音生成失败，请稍后重试" }, 502);
    }
  }),
};
