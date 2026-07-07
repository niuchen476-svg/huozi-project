import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { LEVELS } from "./data/levels-data.ts";

const MIMO_API_BASE = Deno.env.get("MIMO_API_BASE");
const MIMO_API_KEY = Deno.env.get("MIMO_API_KEY");
const MIMO_MODEL = Deno.env.get("MIMO_MODEL") ?? "mimo-v2.5";

const MAX_REFLECTION_LENGTH = 2000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 12;
const rateLog = new Map<string, number[]>();

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT =
  "你是一位精通中国古典诗词创作与近代史的文学顾问。你要点评玩家对历史情境的感悟，并据此创作一首贴合玩家感悟和真实历史背景的古典诗词。你的输出必须是合法 JSON，不能包含 JSON 之外的任何文字。";

const FORM_GUIDE: Record<string, string> = {
  七律: "七言律诗，共八句，每句七字，中间颔联、颈联要对仗",
  绝句: "七言绝句，共四句，每句七字，讲究起承转合",
  词: "词，选择一个适合悲壮/激昂历史题材的词牌（如《满江红》《念奴娇》），按词牌本身的字数与句读格式创作",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "content-type": "application/json" },
  });
}

function loadLevel(levelId: string) {
  const level = LEVELS[levelId];
  if (!level) {
    throw new Error(`关卡不存在：${levelId}`);
  }
  return level;
}

function buildPrompt(level: { scenario: string; significance?: string }, reflection: string, form: string) {
  const guide = FORM_GUIDE[form] || FORM_GUIDE["绝句"];

  return `【历史背景】
${level.scenario}

【历史意义】
${level.significance || ""}

【玩家的感悟】
${reflection}

【任务】
1. 用两到三句话点评玩家这段感悟里体现出的历史理解或情感共鸣，语气真诚自然，不要说教。
2. 创作一首${form}（${guide}），题材围绕这段真实历史，尽量呼应玩家感悟里提到的具体意象或情绪。

只返回如下 JSON，不要任何多余文字：
{
  "commentary": "点评文字",
  "poemForm": "${form}",
  "poemTitle": "诗词标题",
  "poemBody": "诗词正文，每句之间用换行符分隔"
}`;
}

async function callMimo({ system, prompt, maxTokens = 4096 }: { system: string; prompt: string; maxTokens?: number }) {
  if (!MIMO_API_BASE || !MIMO_API_KEY) {
    throw new Error("缺少 MIMO_API_BASE 或 MIMO_API_KEY，请检查 Supabase 项目的 secrets");
  }

  const res = await fetch(`${MIMO_API_BASE}/v1/messages`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": MIMO_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MIMO_MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MiMo API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const textBlock = data.content?.find((block: { type: string }) => block.type === "text");
  if (!textBlock) {
    throw new Error("MiMo API 返回内容中没有可解析的文本块");
  }
  return textBlock.text as string;
}

async function generateReflection(levelId: string, reflection: string, form: string) {
  const level = loadLevel(levelId);
  const prompt = buildPrompt(level, reflection, form);
  const raw = await callMimo({ system: SYSTEM_PROMPT, prompt });

  const jsonStart = raw.indexOf("{");
  const jsonEnd = raw.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error(`AI 返回内容无法解析为 JSON：${raw}`);
  }

  try {
    return JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
  } catch {
    throw new Error(`AI 返回内容无法解析为 JSON：${raw}`);
  }
}

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req) => {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const now = Date.now();
    const recent = (rateLog.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (recent.length >= RATE_LIMIT_MAX) {
      return json({ error: "请求过于频繁，请稍后再试" }, 429);
    }
    recent.push(now);
    rateLog.set(ip, recent);

    const { levelId, reflection, form } = await req.json();

    if (!levelId || typeof levelId !== "string") {
      return json({ error: "缺少 levelId 字段" }, 400);
    }
    if (!reflection || typeof reflection !== "string") {
      return json({ error: "缺少 reflection 字段" }, 400);
    }
    if (reflection.length > MAX_REFLECTION_LENGTH) {
      return json({ error: `感悟内容过长，请控制在 ${MAX_REFLECTION_LENGTH} 字以内` }, 400);
    }
    if (!["七律", "绝句", "词"].includes(form)) {
      return json({ error: "诗词形式必须是 七律 / 绝句 / 词 之一" }, 400);
    }

    try {
      const result = await generateReflection(levelId, reflection, form);
      return json(result);
    } catch (err) {
      return json({ error: (err as Error).message }, 500);
    }
  }),
};
