import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { callAihubmixImage } from "./aihubmixImageClient.js";
import { loadAllLevelExperiences, loadExhibition } from "./levelsData.js";
import { classifyAiFailure, createAiRequestId } from "./aiDiagnostics.js";

const MAX_PLAYER_TEXT = 160;
const MAX_EXPRESSION_TEXT = 240;
const MAX_PLAYER_NAME = 20;
const SAFE_ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/;
const IMAGE_MAX_BYTES = 15 * 1024 * 1024;
const storageDirectory = fileURLToPath(new URL("../../storage/images/", import.meta.url));

const FRAGMENT_MEANINGS = {
  "departure-map-fragment": "瑞金出发关获得的夜行马灯",
  "river-crossing-fragment": "湘江血战关获得的渡江军号",
  "direction-fragment": "遵义转折关获得的会议钢笔",
  "chishui-maneuver-fragment": "四渡赤水关获得的行军罗盘",
  "iron-chain-fragment": "飞夺泸定桥关获得的铁索碎片",
  "snow-grass-fragment": "雪山草地关获得的信念红星",
};

const FRAGMENT_REFERENCE_IMAGES = {
  "departure-map-fragment": "https://niuchen476-svg.github.io/huozi-project/assets/fragments/fallbacks/ruijin-lantern.webp",
  "river-crossing-fragment": "https://niuchen476-svg.github.io/huozi-project/assets/fragments/fallbacks/xiangjiang-bugle.webp",
  "direction-fragment": "https://niuchen476-svg.github.io/huozi-project/assets/fragments/fallbacks/zunyi-pen.webp",
  "chishui-maneuver-fragment": "https://niuchen476-svg.github.io/huozi-project/assets/fragments/fallbacks/sidu-compass.webp",
  "iron-chain-fragment": "https://niuchen476-svg.github.io/huozi-project/assets/fragments/fallbacks/luding-chain.webp",
  "snow-grass-fragment": "https://niuchen476-svg.github.io/huozi-project/assets/fragments/fallbacks/snow-star.webp",
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

  const allExperiences = await loadAllLevelExperiences();
  const allowedSources = new Map(allExperiences.flatMap(({ levelId, levelTitle, experience }) =>
    (experience.phases?.sources?.items || [])
      .filter((source) => source.availableForAiExpression === true)
      .map((source) => [source.id, { ...source, levelId, levelTitle }])));
  const sourceIds = cleanIds(body.sourceIds, 3);
  if (sourceIds.some((id) => !allowedSources.has(id))) {
    throw Object.assign(new Error("存在未开放用于最终画作的史料"), { statusCode: 400 });
  }

  return {
    theme,
    fragmentIds: requestedFragmentIds,
    fragmentReferenceImages: requestedFragmentIds.map((id) => FRAGMENT_REFERENCE_IMAGES[id]).filter(Boolean),
    sourceIds,
    sources: sourceIds.map((id) => allowedSources.get(id)),
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
  const sources = input.sources.length
    ? input.sources.map((source) => `- ${source.levelTitle}《${source.title}》：${source.summary}`).join("\n")
    : "- 玩家未选择史料，只使用已审核的会师背景";

  return `创作一幅面向少年儿童博物馆数字展台的中国历史主题横幅画作，画面比例16:9。整张画面只能出现视觉场景，严禁出现任何文字、数字、日期、标题、标语或题字。
叙事内核（只通过人物、动作、空间和光影表达，绝不能写在画面上）：${input.theme.name}。
玩家表达：${expression}。
作为画面叙事依据的已审核史料摘要：
${sources}
必须自然融入以下历史碎片意象，使其成为画面叙事的一部分，而不是贴在画面上的图标：
${fragments}

输入参考图按上述碎片顺序提供。保留每件碎片可辨认的基本轮廓和材质，把它们自然安排在人物手中、行军装备、道路前景或展台式视觉焦点中；不要把碎片复制成悬浮贴纸，也不要凭空替换成其他物件。

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
  const requestId = createAiRequestId("artwork");
  try {
    const input = await normalizeArtworkInput(body);
    const prompt = buildArtworkPrompt(input);
    const candidate = await callImage({
      prompt,
      size: "1024*576",
      referenceImages: input.fragmentReferenceImages,
    });
    const imageUrl = await persist(candidate);
    return {
      imageUrl,
      themeId: input.theme.id,
      fragmentIds: input.fragmentIds,
      sourceIds: input.sourceIds,
      playerName: input.playerName,
      provider: "aihubmix",
      model: (process.env.AIHUBMIX_IMAGE_MODEL || "qwen-image-2.0").split("/").at(-1),
      generatedByAi: true,
      mode: "online",
      requestId,
    };
  } catch (error) {
    error.requestId = requestId;
    error.failureReason = classifyAiFailure(error);
    console.warn("[artwork] 在线生成失败", {
      requestId,
      fallbackReason: error.failureReason,
      providerStatus: error?.providerStatus || error?.statusCode || null,
      message: error?.message,
    });
    throw error;
  }
}
