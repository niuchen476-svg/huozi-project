import { readFileSync, readdirSync } from "node:fs";
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
  const index = readJSON(path.join(baseDir, "levels.json"));
  for (const level of index) {
    levels[level.id] = readJSON(path.join(baseDir, "levels", level.id, "cards.json"));
  }
  return { index, levels };
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

if (stable(backend.index) !== stable(frontend.index)) {
  issues.push("frontend/public/data/levels.json 与 backend/src/data/levels.json 不一致");
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
