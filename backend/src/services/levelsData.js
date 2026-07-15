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

export async function loadLevelExperience(levelId) {
  const raw = await readFile(
    path.join(dataDir, "levels", levelId, "experience.json"),
    "utf-8"
  );
  return JSON.parse(raw);
}

export async function loadExhibition() {
  const raw = await readFile(path.join(dataDir, "exhibition.json"), "utf-8");
  return JSON.parse(raw);
}

export async function loadAllLevelExperiences() {
  const levels = await loadLevelsIndex();
  return Promise.all(levels.map(async (level) => ({
    levelId: level.id,
    levelTitle: level.title,
    experience: await loadLevelExperience(level.id),
  })));
}
