// 把 backend/src/data 作为关卡数据的唯一源头，同步到另外两处消费方：
// frontend/public/data（GitHub Pages 静态构建读取）
// supabase/functions/reflect/data/levels-data.ts（Edge Function 打包读取，Deno 不能读运行时文件系统外的路径，所以生成静态 TS 模块）
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, cpSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const sourceDir = path.join(rootDir, "backend/src/data");
const frontendDataDir = path.join(rootDir, "frontend/public/data");
const supabaseDataFile = path.join(rootDir, "supabase/functions/reflect/data/levels-data.ts");

rmSync(frontendDataDir, { recursive: true, force: true });
mkdirSync(frontendDataDir, { recursive: true });
cpSync(sourceDir, frontendDataDir, { recursive: true });

const levelIds = readdirSync(path.join(sourceDir, "levels"));
const levels = {};
for (const id of levelIds) {
  const raw = readFileSync(path.join(sourceDir, "levels", id, "cards.json"), "utf-8");
  levels[id] = JSON.parse(raw);
}

const tsSource =
  "export const LEVELS: Record<string, { scenario: string; significance?: string }> = " +
  JSON.stringify(levels, null, 2) +
  ";\n";
mkdirSync(path.dirname(supabaseDataFile), { recursive: true });
writeFileSync(supabaseDataFile, tsSource, "utf-8");

console.log(`已同步 ${levelIds.length} 个关卡到 frontend/public/data 和 ${path.relative(rootDir, supabaseDataFile)}`);
console.log("如果关卡内容改动会影响 AI 点评（scenario/significance），别忘了重新部署 Edge Function：");
console.log("  supabase functions deploy reflect --project-ref pfkamgzktfwfotirlocd");
