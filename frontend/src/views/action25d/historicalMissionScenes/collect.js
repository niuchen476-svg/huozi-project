import {
  numberKey,
  randomBetween,
  renderKeyCommand,
  renderRisk,
  renderTaskHeader,
  updateTaskProgress,
} from "../historicalMissionUi.js";

export function createCollectController(scene, context) {
  const { nodes, report, setStatus, complete } = context;
  const collected = new Set();
  nodes.task.innerHTML = `
    ${renderTaskHeader(scene, `已编入 0 / ${scene.items.length}`)}
    <div class="historical-mission__controls historical-mission__controls--keys">
      ${scene.items.map((item, index) => renderKeyCommand(String(index + 1), item.label)).join("")}
    </div>
  `;
  nodes.hotspots.innerHTML = scene.items.map((item, index) => `
    <div
      class="historical-hotspot historical-hotspot--supply"
      data-collect-item="${item.id}"
      style="--x:${item.x}%;--y:${item.y}%"
    >
      <i>${index + 1}</i>
      <span><b>${item.label}</b><small>${item.detail}</small></span>
    </div>
  `).join("");

  const targets = [...nodes.hotspots.querySelectorAll("[data-collect-item]")];

  function collectAt(index) {
    const target = targets[index];
    if (!target) return;
    const id = target.dataset.collectItem;
    if (collected.has(id)) return;
    collected.add(id);
    target.classList.add("historical-hotspot--done");
    const item = scene.items.find((entry) => entry.id === id);
    report(`${item.label}已编入转移队列`, "success");
    updateTaskProgress(nodes.task, collected.size, scene.items.length, `已编入 ${collected.size} / ${scene.items.length}`);
    setStatus(`物资 ${collected.size} / ${scene.items.length}`);
    if (collected.size === scene.items.length) {
      setTimeout(() => complete(scene.completeText), 650);
    }
  }

  function onKeyDown(event) {
    const number = numberKey(event);
    if (!number) return;
    event.preventDefault();
    collectAt(number - 1);
  }

  window.addEventListener("keydown", onKeyDown);

  return {
    cleanup() {
      window.removeEventListener("keydown", onKeyDown);
    },
  };
}

