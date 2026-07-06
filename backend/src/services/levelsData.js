import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");

export async function loadLevelsIndex() {
  const raw = await readFile(path.join(dataDir, "levels.json"), "utf-8");
  return JSON.parse(raw);
}

export async function loadLevelCards(levelId) {
  const raw = await readFile(
    path.join(dataDir, "levels", levelId, "cards.json"),
    "utf-8"
  );
  return JSON.parse(raw);
}
