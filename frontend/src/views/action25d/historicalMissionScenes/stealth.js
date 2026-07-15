import {
  numberKey,
  randomBetween,
  renderKeyCommand,
  renderRisk,
  renderTaskHeader,
  updateTaskProgress,
} from "../historicalMissionUi.js";

export function createStealthController(scene, context) {
  const { nodes, report, setStatus, complete, fail } = context;
  const maxMistakes = scene.maxMistakes || 3;
  let progress = 0;
  let mistakes = 0;
  let danger = false;
  let ended = false;
  let started = false;
  let advanceLocked = false;
  let dangerTimer = null;
  let hazardTimer = null;
  let lockTimer = null;

  nodes.task.innerHTML = `
    ${renderTaskHeader(scene, "转移进度 0%")}
    <div class="historical-mission__risk" data-risk>隐蔽 ${renderRisk(maxMistakes, mistakes)}</div>
    <div class="historical-mission__controls historical-mission__controls--two">
      ${renderKeyCommand("Space", "跟队前进", "", "data-stealth-move")}
      ${renderKeyCommand("↓", "熄灯隐蔽", "secondary", "data-stealth-conceal")}
    </div>
    <div class="historical-mission__alert" data-stealth-alert hidden>
      <b>侦察光正在扫过</b>
      <span>立即熄灯，队伍贴近山影</span>
    </div>
  `;

  const alert = nodes.task.querySelector("[data-stealth-alert]");
  const risk = nodes.task.querySelector("[data-risk]");
  const moveCommand = nodes.task.querySelector("[data-stealth-move]");
  const concealCommand = nodes.task.querySelector("[data-stealth-conceal]");

  function scheduleHazard(delay = randomBetween(scene.minHazardGap || 1500, scene.maxHazardGap || 2600)) {
    clearTimeout(hazardTimer);
    if (ended) return;
    hazardTimer = setTimeout(beginDanger, delay);
  }

  function beginDanger() {
    if (ended || danger) return;
    danger = true;
    nodes.stage.classList.add("historical-mission__stage--danger");
    alert.hidden = false;
    setStatus("立即隐蔽");
    dangerTimer = setTimeout(registerMistake, scene.responseWindow || 1300);
  }

  function clearDanger() {
    danger = false;
    clearTimeout(dangerTimer);
    nodes.stage.classList.remove("historical-mission__stage--danger");
    alert.hidden = true;
  }

  function registerMistake() {
    if (ended) return;
    clearDanger();
    started = false;
    mistakes += 1;
    risk.innerHTML = `隐蔽 ${renderRisk(maxMistakes, mistakes)}`;
    report(scene.mistakeText || "灯光暴露了队尾，队伍必须停下重新隐蔽", "danger", 2100);
    setStatus(`暴露 ${mistakes} / ${maxMistakes}`);
    nodes.stage.classList.add("historical-mission__stage--impact");
    setTimeout(() => nodes.stage.classList.remove("historical-mission__stage--impact"), 480);
    if (mistakes >= maxMistakes) {
      ended = true;
      fail(scene.failText || "侦察已经锁定队伍，请重新组织这段隐蔽转移。 ");
      return;
    }
  }

  function move() {
    if (ended || advanceLocked) return;
    if (danger) {
      report("侦察光正在扫过，先熄灯隐蔽再继续前进", "danger");
      return;
    }
    advanceLocked = true;
    if (!started) {
      started = true;
      scheduleHazard(1500);
    }
    progress = Math.min(100, progress + (scene.advanceStep || 12));
    updateTaskProgress(nodes.task, progress, 100, `转移进度 ${progress}%`);
    setStatus(`转移 ${progress}%`);
    nodes.stage.classList.remove("historical-mission__stage--step");
    void nodes.stage.offsetWidth;
    nodes.stage.classList.add("historical-mission__stage--step");
    lockTimer = setTimeout(() => {
      advanceLocked = false;
    }, 420);
    if (progress >= 100) {
      ended = true;
      clearDanger();
      clearTimeout(hazardTimer);
      clearTimeout(lockTimer);
      setTimeout(() => complete(scene.completeText), 650);
    }
  }

  function conceal() {
    if (ended) return;
    if (!danger) {
      report("侦察光尚未出现，继续保持队列前进", "neutral");
      return;
    }
    clearDanger();
    started = false;
    report(scene.successText || "灯火及时熄灭，队伍藏进山影", "success");
    setStatus(`转移 ${progress}%`);
  }

  function onKeyDown(event) {
    if (event.code === "Space") {
      event.preventDefault();
      move();
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      conceal();
    }
  }

  window.addEventListener("keydown", onKeyDown);
  moveCommand.addEventListener("click", move);
  concealCommand.addEventListener("click", conceal);

  return {
    cleanup() {
      ended = true;
      clearTimeout(dangerTimer);
      clearTimeout(hazardTimer);
      clearTimeout(lockTimer);
      window.removeEventListener("keydown", onKeyDown);
      moveCommand.removeEventListener("click", move);
      concealCommand.removeEventListener("click", conceal);
    },
  };
}

