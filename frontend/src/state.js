const PROGRESS_KEY = "changzheng-progress";

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
