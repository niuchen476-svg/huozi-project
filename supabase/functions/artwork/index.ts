import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const API_BASE = (Deno.env.get("AIHUBMIX_API_BASE") ?? "https://aihubmix.com/v1").replace(/\/$/, "");
const API_KEY = Deno.env.get("AIHUBMIX_API_KEY");
const MODEL = (Deno.env.get("AIHUBMIX_IMAGE_MODEL") ?? "qwen-image-2.0").split("/").at(-1);
const IMAGE_ENABLED = Deno.env.get("AIHUBMIX_IMAGE_ENABLED") === "true";
const DAILY_LIMIT = Math.max(1, Math.min(Number(Deno.env.get("AIHUBMIX_IMAGE_DAILY_LIMIT") ?? 20), 100));
const TIMEOUT_MS = 120000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const rateLog = new Map<string, number[]>();
let usageDay = "";
let usageCount = 0;

const THEMES: Record<string, string> = {
  unity: "力量在会合中汇聚",
  arrival: "每一次抵达都有代价",
  "new-start": "会师之后走向新的任务",
};

const FRAGMENTS: Record<string, string> = {
  "departure-map-fragment": "瑞金出发与于都渡口的路线地图碎片",
  "river-crossing-fragment": "湘江渡江路线与阻击阵地碎片",
  "direction-fragment": "遵义会议后战略方向重新确立的指针碎片",
  "chishui-maneuver-fragment": "四渡赤水机动路线的河流纹样碎片",
  "iron-chain-fragment": "飞夺泸定桥的铁索与桥板碎片",
  "snow-grass-fragment": "翻越雪山、走过草地的雪峰与草叶碎片",
};

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

function cleanText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id) => typeof id === "string" && Object.hasOwn(FRAGMENTS, id)))].slice(0, 3) as string[];
}

function buildPrompt(body: Record<string, unknown>) {
  const themeId = cleanText(body.themeId, 80);
  const theme = THEMES[themeId];
  if (!theme) throw new Error("请选择有效的数字展台主题");
  const fragmentIds = cleanIds(body.fragmentIds);
  const expression = cleanText(body.expressionText, 240)
    || cleanText(body.playerText, 160)
    || "不同队伍经历艰难行程，最终在会合中形成新的力量。";
  const fragments = fragmentIds.length
    ? fragmentIds.map((id) => `- ${FRAGMENTS[id]}`).join("\n")
    : "- 会宁会师路线、会师楼与三路队伍汇聚的意象";

  return {
    themeId,
    fragmentIds,
    playerName: cleanText(body.playerName, 20),
    prompt: `创作一幅面向少年儿童博物馆数字展台的中国历史主题横幅画作，画面比例16:9。整张画面只能出现视觉场景，严禁出现任何文字、数字、日期、标题、标语或题字。
叙事内核（只通过人物、动作、空间和光影表达，绝不能写在画面上）：${theme}。
玩家表达：${expression}。
必须自然融入以下历史碎片意象，使其成为画面叙事的一部分，而不是贴在画面上的图标：
${fragments}

画面主体应出现1930年代中国工农红军队伍，以会宁会师为情感收束；人物服装、行军装备和环境符合时代背景，表现真实的人群互动、跋涉后的疲惫和会合时的克制喜悦。整体采用有历史质感的写实油画风格，暖红、土黄与远山灰蓝协调，电影感构图，层次清楚，适合展馆大屏。
不得出现现代武器、现代建筑或错误年代信息。不得出现商业标志、二维码、水印、边框、字幕、汉字、字母、数字、日期及任何可辨认文字。画面右下角只保留相对安静的深色无字区域，供系统后续准确叠加玩家署名。`,
  };
}

function reserveBudget(ip: string) {
  const now = Date.now();
  const recent = (rateLog.get(ip) ?? []).filter((time) => now - time < RATE_WINDOW_MS);
  if (recent.length >= 1) throw Object.assign(new Error("十分钟内只能生成一张画作"), { status: 429 });

  const day = new Date().toISOString().slice(0, 10);
  if (usageDay !== day) {
    usageDay = day;
    usageCount = 0;
  }
  if (usageCount >= DAILY_LIMIT) throw Object.assign(new Error("今日 AI 生图额度已用完"), { status: 429 });
  recent.push(now);
  rateLog.set(ip, recent);
  usageCount += 1;
}

function extractImage(payload: any) {
  const values = [
    ...(Array.isArray(payload?.output) ? payload.output : [payload?.output]),
    ...(Array.isArray(payload?.data) ? payload.data : []),
    ...(Array.isArray(payload?.images) ? payload.images : []),
  ].filter(Boolean);
  for (const value of values) {
    if (typeof value === "string" && /^https?:\/\//i.test(value)) return { url: value };
    if (typeof value === "object") {
      if (typeof value.url === "string") return { url: value.url };
      if (typeof value.b64_json === "string") return { b64: value.b64_json };
    }
  }
  throw new Error("生图服务未返回可用图片");
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

async function generate(prompt: string) {
  if (!IMAGE_ENABLED) throw Object.assign(new Error("在线生图尚未启用"), { status: 503 });
  if (!API_KEY) throw Object.assign(new Error("生图服务尚未配置"), { status: 503 });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE}/images/generations`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        n: 1,
        size: "1024x576",
        response_format: "url",
        watermark: false,
        prompt_extend: false,
        negative_prompt: "任何文字、汉字、字母、数字、日期、标题、标语、题字、署名、水印、二维码、边框，现代建筑，现代武器，错误年代信息",
      }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`生图服务请求失败（${response.status}）`);
    const candidate = extractImage(await response.json());
    if (candidate.b64) return `data:image/png;base64,${candidate.b64.replace(/^data:image\/[^;]+;base64,/, "")}`;
    const imageResponse = await fetch(candidate.url);
    if (!imageResponse.ok) throw new Error("生成图片下载失败");
    const contentType = imageResponse.headers.get("content-type") || "image/png";
    if (!contentType.startsWith("image/")) throw new Error("生图服务返回的文件不是图片");
    const bytes = new Uint8Array(await imageResponse.arrayBuffer());
    if (!bytes.length || bytes.length > 15 * 1024 * 1024) throw new Error("生成图片大小异常");
    return `data:${contentType};base64,${bytesToBase64(bytes)}`;
  } finally {
    clearTimeout(timer);
  }
}

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
    if (req.method !== "POST") return json({ error: "仅支持 POST" }, 405);
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json({ error: "请求内容不是合法 JSON" }, 400);
    }
    if (body.levelId !== "huining-join") return json({ error: "AI 画作目前仅在会宁数字展台开放" }, 409);
    try {
      const input = buildPrompt(body);
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
      reserveBudget(ip);
      const imageDataUrl = await generate(input.prompt);
      return json({
        imageDataUrl,
        themeId: input.themeId,
        fragmentIds: input.fragmentIds,
        playerName: input.playerName,
        provider: "aihubmix",
        model: MODEL,
        generatedByAi: true,
      });
    } catch (error) {
      const value = error as Error & { status?: number };
      return json({ error: value.message || "画作生成失败" }, value.status || 502);
    }
  }),
};
