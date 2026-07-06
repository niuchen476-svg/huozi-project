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

export function hasCrossedBridge(levelId) {
  return !!readJSON(BRIDGE_KEY)[levelId];
}

export function markBridgeCrossed(levelId) {
  const data = readJSON(BRIDGE_KEY);
  data[levelId] = true;
  localStorage.setItem(BRIDGE_KEY, JSON.stringify(data));
}
