import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { callAihubmixImage } from "./aihubmixImageClient.js";
import { loadExhibition } from "./levelsData.js";

const MAX_PLAYER_TEXT = 160;
const MAX_EXPRESSION_TEXT = 240;
const MAX_PLAYER_NAME = 20;
const SAFE_ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/;
const IMAGE_MAX_BYTES = 15 * 1024 * 1024;
const storageDirectory = fileURLToPath(new URL("../../storage/images/", import.meta.url));

const FRAGMENT_MEANINGS = {
  "departure-map-fragment": "瑞金出发与于都渡口的路线地图碎片",
  "river-crossing-fragment": "湘江渡江路线与阻击阵地碎片",
  "direction-fragment": "遵义会议后战略方向重新确立的指针碎片",
  "chishui-maneuver-fragment": "四渡赤水机动路线的河流纹样碎片",
  "iron-chain-fragment": "飞夺泸定桥的铁索与桥板碎片",
  "snow-grass-fragment": "翻越雪山、走过草地的雪峰与草叶碎片",
};

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanIds(value, maxItems) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item) => typeof item === "string" && SAFE_ID.test(item)))].slice(0, maxItems);
}

export async function normalizeArtworkInput(body = {}) {
  const exhibition = await loadExhibition();
  const allowedThemes = new Map((exhibition.themes || []).map((theme) => [theme.id, theme]));
  const allowedFragments = new Set((exhibition.fragmentSlots || []).map((slot) => slot.fragmentId));
  const themeId = cleanText(body.themeId, 80);
  const theme = allowedThemes.get(themeId);
  if (!theme) throw Object.assign(new Error("请选择有效的数字展台主题"), { statusCode: 400 });

  const requestedFragmentIds = cleanIds(body.fragmentIds, 4);
  if (requestedFragmentIds.length > 3) {
    throw Object.assign(new Error("最多选择三块历史碎片"), { statusCode: 400 });
  }
  if (requestedFragmentIds.some((id) => !allowedFragments.has(id))) {
    throw Object.assign(new Error("存在未开放的历史碎片"), { statusCode: 400 });
  }

  return {
    theme,
    fragmentIds: requestedFragmentIds,
    playerText: cleanText(body.playerText, MAX_PLAYER_TEXT),
    expressionTitle: cleanText(body.expressionTitle, 40),
    expressionText: cleanText(body.expressionText, MAX_EXPRESSION_TEXT),
    playerName: cleanText(body.playerName, MAX_PLAYER_NAME),
  };
}

export function buildArtworkPrompt(input) {
  const fragments = input.fragmentIds.length
    ? input.fragmentIds.map((id) => `- ${FRAGMENT_MEANINGS[id]}`).join("\n")
    : "- 会宁会师路线、会师楼与三路队伍汇聚的意象";
  const expression = input.expressionText || input.playerText || "不同队伍经历艰难行程，最终在会合中形成新的力量。";

  return `创作一幅面向少年儿童博物馆数字展台的中国历史主题横幅画作，画面比例16:9。整张画面只能出现视觉场景，严禁出现任何文字、数字、日期、标题、标语或题字。
叙事内核（只通过人物、动作、空间和光影表达，绝不能写在画面上）：${input.theme.name}。
玩家表达：${expression}。
必须自然融入以下历史碎片意象，使其成为画面叙事的一部分，而不是贴在画面上的图标：
${fragments}

画面主体应出现1930年代中国工农红军队伍，以会宁会师为情感收束；人物服装、行军装备和环境符合时代背景，表现真实的人群互动、跋涉后的疲惫和会合时的克制喜悦。整体采用有历史质感的写实油画风格，暖红、土黄与远山灰蓝协调，电影感构图，层次清楚，适合展馆大屏。
不得出现现代武器、现代建筑或错误年代信息。不得出现商业标志、二维码、水印、边框、字幕、汉字、字母、数字、日期及任何可辨认文字。画面右下角只保留相对安静的深色无字区域，供系统后续准确叠加玩家署名。`;
}

function extensionFor(contentType = "") {
  if (contentType.includes("jpeg")) return "jpg";
  if (contentType.includes("webp")) return "webp";
  return "png";
}

async function persistImage(candidate, { fetchImpl = fetch } = {}) {
  let bytes;
  let contentType = "image/png";
  if (candidate.url) {
    const response = await fetchImpl(candidate.url);
    if (!response.ok) throw Object.assign(new Error("生成图片下载失败"), { statusCode: 502 });
    contentType = response.headers.get("content-type") || contentType;
    if (!contentType.startsWith("image/")) throw new Error("生图服务返回的文件不是图片");
    bytes = Buffer.from(await response.arrayBuffer());
  } else {
    const match = String(candidate.b64Json || "").match(/^data:(image\/[^;]+);base64,(.+)$/s);
    contentType = match?.[1] || contentType;
    bytes = Buffer.from(match?.[2] || candidate.b64Json || "", "base64");
  }
  if (!bytes.length || bytes.length > IMAGE_MAX_BYTES) throw new Error("生成图片大小异常");

  await mkdir(storageDirectory, { recursive: true });
  const digest = createHash("sha256").update(bytes).digest("hex").slice(0, 12);
  const filename = `${Date.now()}-${digest}-${randomUUID().slice(0, 8)}.${extensionFor(contentType)}`;
  await writeFile(path.join(storageDirectory, filename), bytes);
  return `/images/${filename}`;
}

export async function generateLevelArtwork(body, {
  callImage = callAihubmixImage,
  persist = persistImage,
} = {}) {
  const input = await normalizeArtworkInput(body);
  const prompt = buildArtworkPrompt(input);
  const candidate = await callImage({ prompt, size: "1024x576" });
  const imageUrl = await persist(candidate);
  return {
    imageUrl,
    themeId: input.theme.id,
    fragmentIds: input.fragmentIds,
    playerName: input.playerName,
    provider: "aihubmix",
    model: (process.env.AIHUBMIX_IMAGE_MODEL || "qwen-image-2.0").split("/").at(-1),
    generatedByAi: true,
  };
}
