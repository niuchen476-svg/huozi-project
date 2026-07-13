import { renderLevelDossier } from "./levelDossier.js";
import { LevelHost } from "./levelRuntime/LevelHost.js";
export { preloadLevelResources } from "./levelRuntime/registry.js";

const levelHost = new LevelHost({ renderDossier: renderLevelDossier });

export function renderLevelView(root, levelId) {
  return levelHost.render(root, levelId);
}

export function disposeLevelView() {
  levelHost.dispose();
}
