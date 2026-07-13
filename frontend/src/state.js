const PROGRESS_KEY = "changzheng-progress";
const BRIDGE_KEY = "changzheng-bridge-progress";
const ARCHIVE_FRAGMENTS_KEY = "changzheng-archive-fragments";
const HUINING_SHOWCASE_KEY = "changzheng-huining-showcase";

function readJSON(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

export function getProgress() {
  return readJSON(PROGRESS_KEY) || {};
}

export function markCompleted(levelId) {
  const progress = getProgress();
  progress[levelId] = "completed";
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function resetLevelProgress(levelId) {
  const progress = getProgress();
  delete progress[levelId];
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));

  const bridgeProgress = readJSON(BRIDGE_KEY) || {};
  delete bridgeProgress[levelId];
  localStorage.setItem(BRIDGE_KEY, JSON.stringify(bridgeProgress));
}

export function hasCrossedBridge(levelId) {
  return !!(readJSON(BRIDGE_KEY) || {})[levelId];
}

export function markBridgeCrossed(levelId) {
  const data = readJSON(BRIDGE_KEY) || {};
  data[levelId] = true;
  localStorage.setItem(BRIDGE_KEY, JSON.stringify(data));
}

export function getArchiveFragments() {
  return readJSON(ARCHIVE_FRAGMENTS_KEY) || {};
}

export function collectArchiveFragment(fragmentId) {
  const fragments = getArchiveFragments();
  const alreadyCollected = Boolean(fragments[fragmentId]);
  fragments[fragmentId] = true;
  localStorage.setItem(ARCHIVE_FRAGMENTS_KEY, JSON.stringify(fragments));
  return !alreadyCollected;
}

export function getHuiningShowcase() {
  return readJSON(HUINING_SHOWCASE_KEY) || null;
}

export function saveHuiningShowcase(showcase) {
  const safeShowcase = {
    themeId: String(showcase?.themeId || ""),
    fragmentIds: Array.isArray(showcase?.fragmentIds)
      ? showcase.fragmentIds.slice(0, 3).map(String)
      : [],
    completedAt: new Date().toISOString(),
  };
  localStorage.setItem(HUINING_SHOWCASE_KEY, JSON.stringify(safeShowcase));
  return safeShowcase;
}
