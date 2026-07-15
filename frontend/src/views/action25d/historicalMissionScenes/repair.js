import {
  numberKey,
  randomBetween,
  renderKeyCommand,
  renderRisk,
  renderTaskHeader,
  updateTaskProgress,
} from "../historicalMissionUi.js";

export function createRepairController(scene, context) {
  const { nodes, report, setStatus, complete, fail } = context;
  const points = scene.points || [];
  const maxMistakes = scene.maxMistakes || 3;
  let repaired = 0;
  let mistakes = 0;
  let danger = false;
  let ended = false;
  let started = false;
  let locked = false;
  let hazardTimer = null;
  let dangerTimer = null;
  let repairTimer = null;

  nodes.task.innerHTML = `
    ${renderTaskHeader(scene, `桥段 0 / ${points.length}`)}
    <div class="historical-mission__risk" data-risk>掩护 ${renderRisk(maxMistakes, mistakes)}</div>
    <div class="historical-mission__controls historical-mission__controls--repair">
      ${renderKeyCommand("Space", "固定当前桥段", "", "data-repair-command")}
      ${renderKeyCommand("↓", "卧倒隐蔽", "secondary", "data-cover-command")}
    </div>
    <div class="historical-mission__alert" data-repair-alert hidden>
      <b>敌机正在俯冲</b>
      <span>停止作业，立即卧倒</span>
    </div>
  `;
  nodes.hotspots.innerHTML = points.map((point, index) => `
    <span class="historical-hotspot historical-hotspot--repair ${index === 0 ? "historical-hotspot--current" : ""}"
      data-repair-point="${index}" style="--x:${point.x}%;--y:${point.y}%">
      <i>${index + 1}</i><span>${point.label || `桥段 ${index + 1}`}</span>
    </span>
  `).join("");

  const alert = nodes.task.querySelector("[data-repair-alert]");
  const risk = nodes.task.querySelector("[data-risk]");
  const repairCommand = nodes.task.querySelector("[data-repair-command]");
  const coverCommand = nodes.task.querySelector("[data-cover-command]");

  function updatePoints() {
    nodes.hotspots.querySelectorAll("[data-repair-point]").forEach((point, index) => {
      point.classList.toggle("historical-hotspot--done", index < repaired);
      point.classList.toggle("historical-hotspot--current", index === repaired);
    });
  }

  function scheduleHazard(delay = randomBetween(scene.minHazardGap || 1700, scene.maxHazardGap || 2700)) {
    clearTimeout(hazardTimer);
    if (ended) return;
    hazardTimer = setTimeout(beginDanger, delay);
  }

  function beginDanger() {
    if (ended || danger) return;
    danger = true;
    nodes.stage.classList.add("historical-mission__stage--danger");
    alert.hidden = false;
    setStatus("敌机来袭");
    dangerTimer = setTimeout(registerHit, scene.responseWindow || 1250);
  }

  function clearDanger() {
    danger = false;
    clearTimeout(dangerTimer);
    nodes.stage.classList.remove("historical-mission__stage--danger");
    alert.hidden = true;
  }

  function registerHit() {
    if (ended) return;
    clearDanger();
    started = false;
    mistakes += 1;
    if (repaired > 0) repaired -= 1;
    updatePoints();
    updateTaskProgress(nodes.task, repaired, points.length, `桥段 ${repaired} / ${points.length}`);
    risk.innerHTML = `掩护 ${renderRisk(maxMistakes, mistakes)}`;
    nodes.stage.classList.add("historical-mission__stage--impact");
    setTimeout(() => nodes.stage.classList.remove("historical-mission__stage--impact"), 500);
    report("轰炸震松了刚固定的桥段，工兵必须重新接上", "danger", 2100);
    if (mistakes >= maxMistakes) {
      ended = true;
      fail(scene.failText || "浮桥连续被炸断，请重新组织工兵与掩护。 ");
      return;
    }
  }

  function repairCurrent() {
    if (ended || locked) return;
    if (danger) {
      report("敌机正在俯冲，先卧倒隐蔽再继续抢修", "danger");
      return;
    }
    locked = true;
    if (!started) {
      started = true;
      scheduleHazard(950);
    }
    repaired += 1;
    updatePoints();
    updateTaskProgress(nodes.task, repaired, points.length, `桥段 ${repaired} / ${points.length}`);
    setStatus(`抢修 ${repaired} / ${points.length}`);
    report(`第 ${repaired} 段木排已经重新固定`, "success");
    if (repaired >= points.length) {
      ended = true;
      clearTimeout(hazardTimer);
      clearDanger();
      setTimeout(() => complete(scene.completeText), 700);
      return;
    }
    repairTimer = setTimeout(() => {
      locked = false;
    }, 520);
  }

  function takeCover() {
    if (ended) return;
    if (!danger) {
      report("敌机尚未进入俯冲，继续抢修当前桥段", "neutral");
      return;
    }
    clearDanger();
    started = false;
    report("工兵及时离开桥面，轰炸过后继续抢修", "success");
    setStatus(`抢修 ${repaired} / ${points.length}`);
  }

  function onKeyDown(event) {
    if (event.code === "Space") {
      event.preventDefault();
      repairCurrent();
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      takeCover();
    }
  }

  window.addEventListener("keydown", onKeyDown);
  repairCommand.addEventListener("click", repairCurrent);
  coverCommand.addEventListener("click", takeCover);

  return {
    cleanup() {
      ended = true;
      clearTimeout(hazardTimer);
      clearTimeout(dangerTimer);
      clearTimeout(repairTimer);
      window.removeEventListener("keydown", onKeyDown);
      repairCommand.removeEventListener("click", repairCurrent);
      coverCommand.removeEventListener("click", takeCover);
    },
  };
}

