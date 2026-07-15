import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { EXPERIENCES } from "../_shared/experience-data.ts";

const API_BASE = (Deno.env.get("AIHUBMIX_API_BASE") ?? "https://aihubmix.com/v1").replace(/\/$/, "");
const API_KEY = Deno.env.get("AIHUBMIX_API_KEY");
const CONFIGURED_MODEL = Deno.env.get("AIHUBMIX_IMAGE_MODEL") ?? "qwen-image-2.0";
const MODEL_PATH = CONFIGURED_MODEL.includes("/") ? CONFIGURED_MODEL : `qianfan/${CONFIGURED_MODEL}`;
const MODEL = CONFIGURED_MODEL.split("/").at(-1);
const IMAGE_ENABLED = Deno.env.get("AIHUBMIX_IMAGE_ENABLED") === "true";
const DAILY_LIMIT = Math.max(1, Math.min(Number(Deno.env.get("AIHUBMIX_IMAGE_DAILY_LIMIT") ?? 20), 100));
const TIMEOUT_MS = 120000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const rateLog = new Map<string, number[]>();
let usageDay = "";
let usageCount = 0;

const THEMES: Record<string, string> = {
  unity: "力量在会合中汇聚",
  // 保留上一版静态页面的主题 ID，避免 Edge Function 先部署时旧页面突然失效。
  arrival: "每一次抵达都有代价",
  choice: "在一次次选择中寻找方向",
  sacrifice: "记住牺牲，也看见坚持",
  people: "人与人相互托举着前行",
  initiative: "在变化中重新争取主动",
  faith: "在艰难中守住共同信念",
  "new-start": "会师之后走向新的任务",
};

const FRAGMENTS: Record<string, string> = {
  "departure-map-fragment": "瑞金出发关获得的夜行马灯",
  "river-crossing-fragment": "湘江血战关获得的渡江军号",
  "direction-fragment": "遵义转折关获得的会议钢笔",
  "chishui-maneuver-fragment": "四渡赤水关获得的行军罗盘",
  "iron-chain-fragment": "飞夺泸定桥关获得的铁索碎片",
  "snow-grass-fragment": "雪山草地关获得的信念红星",
};

const FRAGMENT_IMAGES: Record<string, string> = {
  "departure-map-fragment": "https://niuchen476-svg.github.io/huozi-project/assets/fragments/fallbacks/ruijin-lantern.webp",
  "river-crossing-fragment": "https://niuchen476-svg.github.io/huozi-project/assets/fragments/fallbacks/xiangjiang-bugle.webp",
  "direction-fragment": "https://niuchen476-svg.github.io/huozi-project/assets/fragments/fallbacks/zunyi-pen.webp",
  "chishui-maneuver-fragment": "https://niuchen476-svg.github.io/huozi-project/assets/fragments/fallbacks/sidu-compass.webp",
  "iron-chain-fragment": "https://niuchen476-svg.github.io/huozi-project/assets/fragments/fallbacks/luding-chain.webp",
  "snow-grass-fragment": "https://niuchen476-svg.github.io/huozi-project/assets/fragments/fallbacks/snow-star.webp",
};

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
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id) => typeof id === "string" && Object.hasOwn(FRAGMENTS, id)))].slice(0, 3) as string[];
}

function buildSourceCatalog() {
  const catalog = new Map<string, any>();
  for (const [levelId, experience] of Object.entries(EXPERIENCES)) {
    for (const source of experience.phases?.sources?.items || []) {
      if (source.availableForAiExpression === true) catalog.set(source.id, { ...source, levelId });
    }
  }
  return catalog;
}

function classifyFailure(error: any) {
  const message = String(error?.message || "").toLowerCase();
  const status = Number(error?.providerStatus || error?.status || 0);
  if (status === 429 || /额度|限额|quota|rate limit/.test(message)) return "quota";
  if (status === 401 || status === 403 || /认证|api[_ -]?key|unauthorized|forbidden/.test(message)) return "auth";
  if (/超时|timeout|abort/.test(message)) return "timeout";
  if (status === 503 || /尚未启用|尚未配置|缺少/.test(message)) return "config";
  if (/返回|图片大小|不是图片/.test(message)) return "response";
  if (status === 400 || /请选择|未开放/.test(message)) return "validation";
  return "upstream";
}

function buildPrompt(body: Record<string, unknown>) {
  const themeId = cleanText(body.themeId, 80);
  const theme = THEMES[themeId];
  if (!theme) throw new Error("请选择有效的数字展台主题");
  const fragmentIds = cleanIds(body.fragmentIds);
  const sourceCatalog = buildSourceCatalog();
  const sourceIds = [...new Set(Array.isArray(body.sourceIds)
    ? body.sourceIds.filter((id) => typeof id === "string")
    : [])].slice(0, 3) as string[];
  if (sourceIds.some((id) => !sourceCatalog.has(id))) throw new Error("存在未开放用于最终画作的史料");
  const expression = cleanText(body.expressionText, 240)
    || cleanText(body.playerText, 160)
    || "不同队伍经历艰难行程，最终在会合中形成新的力量。";
  const fragments = fragmentIds.length
    ? fragmentIds.map((id) => `- ${FRAGMENTS[id]}`).join("\n")
    : "- 会宁会师路线、会师楼与三路队伍汇聚的意象";
  const sources = sourceIds.length
    ? sourceIds.map((id) => {
        const source = sourceCatalog.get(id);
        return `- ${source.levelId}《${source.title}》：${source.summary}`;
      }).join("\n")
    : "- 玩家未选择史料，只使用已审核的会师背景";

  return {
    themeId,
    fragmentIds,
    sourceIds,
    referenceImages: fragmentIds.map((id) => FRAGMENT_IMAGES[id]).filter(Boolean),
    playerName: cleanText(body.playerName, 20),
    prompt: `创作一幅面向少年儿童博物馆数字展台的中国历史主题横幅画作，画面比例16:9。整张画面只能出现视觉场景，严禁出现任何文字、数字、日期、标题、标语或题字。
叙事内核（只通过人物、动作、空间和光影表达，绝不能写在画面上）：${theme}。
玩家表达：${expression}。
作为画面叙事依据的已审核史料摘要：
${sources}
必须自然融入以下历史碎片意象，使其成为画面叙事的一部分，而不是贴在画面上的图标：
${fragments}

输入参考图按上述碎片顺序提供。保留每件碎片可辨认的基本轮廓和材质，把它们自然安排在人物手中、行军装备、道路前景或展台式视觉焦点中；不要把碎片复制成悬浮贴纸，也不要凭空替换成其他物件。

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

async function generate(prompt: string, referenceImages: string[]) {
  if (!IMAGE_ENABLED) throw Object.assign(new Error("在线生图尚未启用"), { status: 503 });
  if (!API_KEY) throw Object.assign(new Error("生图服务尚未配置"), { status: 503 });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE}/models/${MODEL_PATH}/predictions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({ input: {
        prompt,
        ...(referenceImages.length ? { images: referenceImages.slice(0, 3) } : {}),
        n: 1,
        size: "1024*576",
        watermark: false,
        prompt_extend: false,
        negative_prompt: "任何文字、汉字、字母、数字、日期、标题、标语、题字、署名、水印、二维码、边框，现代建筑，现代武器，错误年代信息",
      } }),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw Object.assign(new Error(`生图服务请求失败（${response.status}）`), {
        providerStatus: response.status,
      });
    }
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
    if (req.method === "GET") {
      return json({
        status: "ok",
        service: "artwork",
        configured: Boolean(API_KEY),
        enabled: IMAGE_ENABLED,
        model: MODEL,
        dailyUsed: usageCount,
        dailyLimit: DAILY_LIMIT,
      });
    }
    if (req.method !== "POST") return json({ error: "仅支持 POST" }, 405);
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json({ error: "请求内容不是合法 JSON" }, 400);
    }
    if (body.levelId !== "huining-join") return json({ error: "AI 画作目前仅在会宁数字展台开放" }, 409);
    const requestId = `artwork-${crypto.randomUUID()}`;
    try {
      const input = buildPrompt(body);
      if (!IMAGE_ENABLED) throw Object.assign(new Error("在线生图尚未启用"), { status: 503 });
      if (!API_KEY) throw Object.assign(new Error("生图服务尚未配置"), { status: 503 });
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
      reserveBudget(ip);
      const imageDataUrl = await generate(input.prompt, input.referenceImages);
      return json({
        imageDataUrl,
        themeId: input.themeId,
        fragmentIds: input.fragmentIds,
        sourceIds: input.sourceIds,
        playerName: input.playerName,
        provider: "aihubmix",
        model: MODEL,
        generatedByAi: true,
        mode: "online",
        requestId,
      });
    } catch (error) {
      const value = error as Error & { status?: number };
      const code = classifyFailure(error);
      console.warn("[artwork] 在线生成失败", JSON.stringify({
        requestId,
        code,
        providerStatus: (error as any)?.providerStatus ?? null,
        message: value.message,
      }));
      return json({ error: value.message || "画作生成失败", code, requestId }, value.status || 502);
    }
  }),
};
