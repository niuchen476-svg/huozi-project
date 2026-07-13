export function renderKeyCommand(key, label, tone = "", dataAttribute = "") {
  const toneClass = tone ? ` historical-key-command--${tone}` : "";
  const attr = dataAttribute ? ` ${dataAttribute}` : "";
  return `
    <div class="historical-key-command${toneClass}"${attr}>
      <kbd>${key}</kbd>
      <span>${label}</span>
    </div>
  `;
}

export function numberKey(event) {
  if (/^Digit[1-9]$/.test(event.code)) return Number(event.code.replace("Digit", ""));
  if (/^Numpad[1-9]$/.test(event.code)) return Number(event.code.replace("Numpad", ""));
  return null;
}

export function renderTaskHeader(scene, progressText) {
  return `
    <div class="historical-mission__objective">
      <span>当前行动</span>
      <b>${scene.objective}</b>
    </div>
    <div class="historical-mission__progress">
      <span data-task-progress-label>${progressText}</span>
      <i><b data-task-progress-fill></b></i>
    </div>
  `;
}

export function updateTaskProgress(task, value, total, label) {
  const ratio = total ? Math.min(1, value / total) : 0;
  const fill = task.querySelector("[data-task-progress-fill]");
  const text = task.querySelector("[data-task-progress-label]");
  if (fill) fill.style.width = `${ratio * 100}%`;
  if (text) text.textContent = label;
}

export function renderStory(scene, index, total) {
  return `
    <p class="historical-mission__story-kicker">第 ${index + 1} 幕 / 共 ${total} 幕 · ${scene.date}</p>
    <h2>${scene.title}</h2>
    <p class="historical-mission__story-text">${scene.narrative}</p>
    <div class="historical-mission__story-fact">
      <span>史实节点</span>
      <p>${scene.fact}</p>
    </div>
    ${renderSource(scene.source)}
  `;
}

export function renderSource(source) {
  if (!source?.url) return "";
  return `<a class="historical-mission__source" href="${source.url}" target="_blank" rel="noreferrer">史料依据：${source.label}</a>`;
}

export function renderTimeline(nodes, scenes, activeIndex) {
  nodes.timeline.querySelectorAll("[data-timeline-step]").forEach((step, index) => {
    step.classList.toggle("historical-mission__timeline-step--active", index === activeIndex);
    step.classList.toggle("historical-mission__timeline-step--done", index < activeIndex);
    step.querySelector("span").textContent = scenes[index].shortTitle || scenes[index].title;
  });
}

export function applySceneBackdrop(nodes, scene) {
  nodes.backdrop.style.backgroundImage = `url("${scene.image}")`;
  nodes.backdrop.setAttribute("aria-label", scene.imageAlt || scene.title);
  nodes.backdrop.style.setProperty("--scene-position", scene.imagePosition || "center");
}

export function preloadSceneImages(scenes) {
  const load = (scene, priority = "auto") => {
    const image = new Image();
    image.decoding = "async";
    image.fetchPriority = priority;
    image.src = scene.image;
  };

  load(scenes[0], "high");
  const rest = () => scenes.slice(1).forEach((scene) => load(scene, "low"));
  if ("requestIdleCallback" in window) window.requestIdleCallback(rest, { timeout: 1200 });
  else window.setTimeout(rest, 250);
}

export function renderRisk(total, used) {
  return `<span aria-label="剩余 ${Math.max(0, total - used)} 次机会">${"●".repeat(Math.max(0, total - used))}${"○".repeat(used)}</span>`;
}

export function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}
