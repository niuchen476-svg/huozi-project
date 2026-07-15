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
export const MAX_ARTWORK_PROMPT_CHARACTERS = 600;
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
    ? input.fragmentIds.map((id) => FRAGMENT_MEANINGS[id]).join("、")
    : "会宁会师路线、会师楼与三路队伍汇聚";
  const expression = cleanText(
    input.expressionText || input.playerText || "不同队伍经历艰难行程，最终在会合中形成新的力量。",
    100
  );
  const sources = input.sources.length
    ? input.sources.map((source) => `${source.levelTitle}《${source.title}》：${cleanText(source.summary, 42)}`).join("；")
    : "会宁会师的已审核历史背景";

  return cleanText(`博物馆数字展台用16:9写实历史油画。画面主体是1930年代中国工农红军队伍在会宁会师，表现跋涉后的疲惫、克制的喜悦和人与人的真实互动。
主题：${input.theme.name}。
玩家表达：${expression}。
史料线索：${sources}。
历史碎片：${fragments}。请按上述碎片名称和材质还原可辨认的物件，把它们自然放在人物手中、行军装备或道路前景，不能做成悬浮贴纸。
服装、装备和建筑符合1930年代；写实油画质感，暖红、土黄和远山灰蓝，电影感构图。画面不得出现任何文字、数字、日期、标题、标语、题字、水印、二维码、边框、现代武器或现代建筑。右下角保留安静的深色无字区域，供系统叠加玩家署名。`, MAX_ARTWORK_PROMPT_CHARACTERS);
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
