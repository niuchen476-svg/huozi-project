import {
  numberKey,
  randomBetween,
  renderKeyCommand,
  renderRisk,
  renderTaskHeader,
  updateTaskProgress,
} from "../historicalMissionUi.js";

export function createDispatchController(scene, context) {
  const { nodes, report, setStatus, complete, fail } = context;
  const groups = scene.groups || [];
  const maxMistakes = scene.maxMistakes || 3;
  let current = 0;
  let mistakes = 0;
  let targetLane = null;
  let roundOpen = false;
  let ended = false;
  let started = false;
  let roundTimer = null;
  let nextTimer = null;

  nodes.task.innerHTML = `
    ${renderTaskHeader(scene, `通过 0 / ${groups.length}`)}
    <div class="historical-mission__dispatch-warning" data-dispatch-warning>观察两岸炮火</div>
    <ol class="historical-mission__queue historical-mission__queue--compact" data-queue>
      ${groups.map((group, index) => `<li data-group="${index}"><i>${index + 1}</i><span>${group}</span></li>`).join("")}
    </ol>
    <div class="historical-mission__controls historical-mission__controls--lanes">
      ${renderKeyCommand("Space", "开始组织渡江", "", "data-dispatch-command")}
      ${renderKeyCommand("←", "上游通道")}
      ${renderKeyCommand("→", "下游通道")}
    </div>
  `;
  nodes.hotspots.innerHTML = `
    <div class="historical-mission__fire-zone historical-mission__fire-zone--left" data-fire-zone="left"><i></i><span>炮火覆盖</span></div>
    <div class="historical-mission__fire-zone historical-mission__fire-zone--right" data-fire-zone="right"><i></i><span>炮火覆盖</span></div>
  `;

  const warning = nodes.task.querySelector("[data-dispatch-warning]");
  const queue = nodes.task.querySelector("[data-queue]");
  const start = nodes.task.querySelector("[data-dispatch-command]");
  const startLabel = start.querySelector("span");

  function startDispatch() {
    if (started || ended) return;
    started = true;
    start.classList.add("historical-key-command--muted");
    warning.textContent = "第一支队列正在接近渡口";
    setStatus("观察炮火");
    nextTimer = setTimeout(openRound, 650);
  }

  function openRound() {
    if (ended) return;
    targetLane = Math.random() < 0.5 ? "left" : "right";
    roundOpen = true;
    const targetLabel = targetLane === "left" ? "上游" : "下游";
    warning.textContent = `${targetLabel}通道遭炮火覆盖，立即改走另一侧`;
    nodes.hotspots.querySelector(`[data-fire-zone="${targetLane}"]`).classList.add("historical-mission__fire-zone--active");
    nodes.stage.classList.add(`historical-mission__stage--fire-${targetLane}`);
    setStatus("选择安全通道");
    roundTimer = setTimeout(() => closeRound(false), scene.responseWindow || 2300);
  }

  function clearRound() {
    clearTimeout(roundTimer);
    roundOpen = false;
    nodes.hotspots.querySelectorAll("[data-fire-zone]").forEach((zone) => {
      zone.classList.remove("historical-mission__fire-zone--active");
    });
    nodes.stage.classList.remove("historical-mission__stage--fire-left", "historical-mission__stage--fire-right");
  }

  function closeRound(success, chosenLane) {
    if (ended) return;
    clearRound();
    if (success) {
      queue.querySelector(`[data-group="${current}"]`).classList.add("historical-mission__queue-item--done");
      report(`${groups[current]}抓住火力间隙通过江面`, "success");
      current += 1;
      updateTaskProgress(nodes.task, current, groups.length, `通过 ${current} / ${groups.length}`);
      if (current >= groups.length) {
        ended = true;
        setTimeout(() => complete(scene.completeText), 700);
        return;
      }
    } else {
      mistakes += 1;
      const chosenText = chosenLane ? "通道判断错误" : "错过了通过窗口";
      report(`${chosenText}，队列退回堤岸重新集结`, "danger", 2100);
      if (mistakes >= maxMistakes) {
        ended = true;
        fail(scene.failText || "渡江队列连续暴露在炮火中，请重新组织通过次序。 ");
        return;
      }
    }
    started = false;
    start.classList.remove("historical-key-command--muted");
    startLabel.textContent = success ? "观察下一轮炮火" : "重新观察炮火窗口";
    setStatus(`通过 ${current} / ${groups.length}`);
    warning.textContent = "下一支队列留在堤岸遮蔽处待命";
  }

  function chooseLane(lane) {
    if (!roundOpen || ended) return;
    closeRound(lane !== targetLane, lane);
  }

  function onKeyDown(event) {
    if (event.code === "Space") {
      event.preventDefault();
      startDispatch();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      chooseLane("left");
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      chooseLane("right");
    }
  }

  window.addEventListener("keydown", onKeyDown);
  setStatus("等待开始渡江");

  return {
    cleanup() {
      ended = true;
      clearTimeout(roundTimer);
      clearTimeout(nextTimer);
      clearRound();
      window.removeEventListener("keydown", onKeyDown);
    },
  };
}

