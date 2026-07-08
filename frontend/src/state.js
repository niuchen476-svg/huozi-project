const PROGRESS_KEY = "changzheng-progress";
const BRIDGE_KEY = "changzheng-bridge-progress";

function readJSON(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
}

export function getProgress() {
  return readJSON(PROGRESS_KEY);
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

  const bridgeProgress = readJSON(BRIDGE_KEY);
  delete bridgeProgress[levelId];
  localStorage.setItem(BRIDGE_KEY, JSON.stringify(bridgeProgress));
}

export function hasCrossedBridge(levelId) {
  return !!readJSON(BRIDGE_KEY)[levelId];
}

export function markBridgeCrossed(levelId) {
  const data = readJSON(BRIDGE_KEY);
  data[levelId] = true;
  localStorage.setItem(BRIDGE_KEY, JSON.stringify(data));
}
