import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const backendDataDir = path.join(rootDir, "backend/src/data");
const frontendDataDir = path.join(rootDir, "frontend/public/data");
const supabaseDataFile = path.join(rootDir, "supabase/functions/reflect/data/levels-data.ts");

function readJSON(filePath) {
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

function stable(value) {
  return JSON.stringify(sortKeys(value), null, 2);
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, sortKeys(value[key])])
  );
}

function readLevelSet(baseDir) {
  const levels = {};
  const experiences = {};
  const index = readJSON(path.join(baseDir, "levels.json"));
  for (const level of index) {
    levels[level.id] = readJSON(path.join(baseDir, "levels", level.id, "cards.json"));
    if (level.experienceConfig) {
      const experiencePath = path.join(baseDir, level.experienceConfig);
      experiences[level.id] = existsSync(experiencePath) ? readJSON(experiencePath) : null;
    }
  }
  const exhibitionPath = path.join(baseDir, "exhibition.json");
  const exhibition = existsSync(exhibitionPath) ? readJSON(exhibitionPath) : null;
  return { index, levels, experiences, exhibition };
}

function readSupabaseLevels() {
  const source = readFileSync(supabaseDataFile, "utf-8");
  const match = source.match(/=\s*([\s\S]*);\s*$/);
  if (!match) throw new Error(`无法解析 ${supabaseDataFile}`);
  return JSON.parse(match[1]);
}

const backend = readLevelSet(backendDataDir);
const frontend = readLevelSet(frontendDataDir);
const supabase = readSupabaseLevels();
const issues = [];
const requiredPhases = ["briefing", "gameplay", "sources", "expression", "completion"];

function addIssue(message) {
  issues.push(message);
}

function isNumberInRange(value, min, max) {
  return Number.isFinite(value) && value >= min && value <= max;
}

function hasUniqueIds(items) {
  const ids = items.map((item) => item?.id).filter(Boolean);
  return ids.length === items.length && new Set(ids).size === ids.length;
}

function validateLevelIndex(index) {
  if (!hasUniqueIds(index)) addIssue("levels.json 中存在缺失或重复的关卡 id");

  for (const level of index) {
    const prefix = `levels.json 的 ${level.id}`;
    if (level.access !== "free") addIssue(`${prefix} 必须设置 access: free`);
    if (!["experience", "showcase"].includes(level.role)) {
      addIssue(`${prefix} 的 role 必须是 experience 或 showcase`);
    }
    if (!isNumberInRange(level.minDurationSeconds, 60, 180)) {
      addIssue(`${prefix} 的 minDurationSeconds 必须在 60～180 秒之间`);
    }
    if (!isNumberInRange(level.targetDurationSeconds, level.minDurationSeconds, 180)) {
      addIssue(`${prefix} 的 targetDurationSeconds 必须处于允许时长内`);
    }
    if (!isNumberInRange(level.maxDurationSeconds, level.targetDurationSeconds, 180)) {
      addIssue(`${prefix} 的 maxDurationSeconds 必须处于目标时长到 180 秒之间`);
    }
  }
}

function validateExperience(level, experience) {
  const prefix = `${level.experienceConfig}`;
  if (!experience) {
    addIssue(`${prefix} 不存在或不是合法 JSON`);
    return;
  }
  if (experience.schemaVersion !== 2) addIssue(`${prefix} 的 schemaVersion 必须为 2`);
  if (experience.levelId !== level.id) addIssue(`${prefix} 的 levelId 必须为 ${level.id}`);

  const duration = experience.duration || {};
  if (duration.minSeconds !== level.minDurationSeconds
    || duration.targetSeconds !== level.targetDurationSeconds
    || duration.maxSeconds !== level.maxDurationSeconds) {
    addIssue(`${prefix} 的 duration 必须与 levels.json 保持一致`);
  }

  for (const phaseName of requiredPhases) {
    const phase = experience.phases?.[phaseName];
    if (!phase || typeof phase.enabled !== "boolean") {
      addIssue(`${prefix} 缺少合法的 phases.${phaseName}`);
    }
  }

  const sources = experience.phases?.sources?.items;
  if (!Array.isArray(sources) || !hasUniqueIds(sources)) {
    addIssue(`${prefix} 的史料必须是带唯一 id 的数组`);
  }

  const audio = experience.audio || {};
  for (const channel of ["ambience", "narration", "effects"]) {
    if (!Array.isArray(audio[channel]) || !hasUniqueIds(audio[channel])) {
      addIssue(`${prefix} 的 audio.${channel} 必须是带唯一 id 的数组`);
    }
  }
  for (const narration of audio.narration || []) {
    if (!narration.transcript?.trim()) {
      addIssue(`${prefix} 的旁白 ${narration.id} 必须提供 transcript`);
    }
  }

  const fragment = experience.fragment;
  if (!fragment?.id) addIssue(`${prefix} 必须提供 fragment.id`);
  if (fragment && !fragment.model && !fragment.fallbackImage && !fragment.legacyVisualId) {
    addIssue(`${prefix} 的碎片必须提供 model、fallbackImage 或 legacyVisualId`);
  }
  const sourceIds = new Set((sources || []).map((source) => source.id));
  for (const sourceId of fragment?.sourceIds || []) {
    if (!sourceIds.has(sourceId)) addIssue(`${prefix} 的碎片引用了不存在的史料 ${sourceId}`);
  }
}

function validateExhibition(exhibition, levelIds) {
  if (!exhibition) {
    addIssue("backend/src/data/exhibition.json 不存在");
    return;
  }
  if (exhibition.schemaVersion !== 1) addIssue("exhibition.json 的 schemaVersion 必须为 1");
  if (exhibition.allowPartialAssembly !== true) {
    addIssue("exhibition.json 必须允许部分碎片组成展台");
  }
  if (!Array.isArray(exhibition.fragmentSlots) || !hasUniqueIds(
    exhibition.fragmentSlots.map((slot) => ({ id: slot.fragmentId }))
  )) {
    addIssue("exhibition.json 的 fragmentSlots 必须包含唯一 fragmentId");
    return;
  }
  if (exhibition.fullAssemblyFragments !== exhibition.fragmentSlots.length) {
    addIssue("exhibition.json 的 fullAssemblyFragments 必须等于碎片槽数量");
  }
  for (const slot of exhibition.fragmentSlots) {
    if (!levelIds.has(slot.levelId)) addIssue(`数字展台引用了不存在的关卡 ${slot.levelId}`);
    for (const field of ["position", "rotation", "scale"]) {
      if (!Array.isArray(slot[field]) || slot[field].length !== 3
        || slot[field].some((value) => !Number.isFinite(value))) {
        addIssue(`数字展台碎片 ${slot.fragmentId} 的 ${field} 必须是三个数字`);
      }
    }
  }
}

validateLevelIndex(backend.index);
for (const level of backend.index) {
  if (level.experienceConfig) validateExperience(level, backend.experiences[level.id]);
}
validateExhibition(backend.exhibition, new Set(backend.index.map((level) => level.id)));

if (stable(backend.index) !== stable(frontend.index)) {
  issues.push("frontend/public/data/levels.json 与 backend/src/data/levels.json 不一致");
}

if (stable(backend.exhibition) !== stable(frontend.exhibition)) {
  issues.push("frontend/public/data/exhibition.json 与 backend 源数据不一致");
}

for (const level of backend.index) {
  if (level.experienceConfig
    && stable(backend.experiences[level.id]) !== stable(frontend.experiences[level.id])) {
    issues.push(`frontend/public/data/${level.experienceConfig} 与 backend 源数据不一致`);
  }
}

for (const id of readdirSync(path.join(backendDataDir, "levels"))) {
  if (stable(backend.levels[id]) !== stable(frontend.levels[id])) {
    issues.push(`frontend/public/data/levels/${id}/cards.json 与 backend 源数据不一致`);
  }
  if (stable(backend.levels[id]) !== stable(supabase[id])) {
    issues.push(`supabase/functions/reflect/data/levels-data.ts 中的 ${id} 与 backend 源数据不一致`);
  }
}

if (issues.length) {
  console.error("关卡数据副本未同步：");
  for (const issue of issues) console.error(`- ${issue}`);
  console.error("\n请运行：npm run sync-data");
  process.exit(1);
}

console.log("关卡数据副本已和 backend/src/data 保持同步。");
