import {
  numberKey,
  randomBetween,
  renderKeyCommand,
  renderRisk,
  renderTaskHeader,
  updateTaskProgress,
} from "../historicalMissionUi.js";

export function createRescueController(scene, context) {
  const { nodes, report, setStatus, complete, fail } = context;
  const targets = scene.targets || [];
  const maxMistakes = scene.maxMistakes || 3;
  let current = 0;
  let mistakes = 0;
  let active = false;
  let ended = false;
  let started = false;
  let targetTimer = null;
  let nextTimer = null;

  nodes.task.innerHTML = `
    ${renderTaskHeader(scene, `转移伤员 0 / ${targets.length}`)}
    <div class="historical-mission__risk" data-risk>担架队 ${renderRisk(maxMistakes, mistakes)}</div>
    <div class="historical-mission__rescue-call" data-rescue-call>观察江滩，等待担架队呼叫</div>
    <div class="historical-mission__controls">
      ${renderKeyCommand("Space", "开始江滩救护", "", "data-rescue-command")}
    </div>
  `;
  const risk = nodes.task.querySelector("[data-risk]");
  const call = nodes.task.querySelector("[data-rescue-call]");
  const start = nodes.task.querySelector("[data-rescue-command]");
  const startLabel = start.querySelector("span");

  function startRescue() {
    if (started || ended) return;
    started = true;
    start.classList.add("historical-key-command--muted");
    call.textContent = "担架队正在确认第一处呼叫";
    setStatus("观察江滩");
    nextTimer = setTimeout(showTarget, 500);
  }

  function showTarget() {
    if (ended) return;
    const target = targets[current];
    active = true;
    call.textContent = `${target.label}需要接应`;
    setStatus("立即救护");
    nodes.hotspots.innerHTML = `
      <div class="historical-hotspot historical-hotspot--rescue"
        style="--x:${target.x}%;--y:${target.y}%" data-rescue-target>
        <i>+</i><span><b>空格抬上担架</b><small>${target.label}</small></span>
      </div>
    `;
    targetTimer = setTimeout(missTarget, scene.responseWindow || 3000);
  }

  function rescue() {
    if (!active || ended) return;
    active = false;
    clearTimeout(targetTimer);
    nodes.hotspots.replaceChildren();
    report(`${targets[current].label}已由担架队转移到遮蔽处`, "success");
    current += 1;
    updateTaskProgress(nodes.task, current, targets.length, `转移伤员 ${current} / ${targets.length}`);
    setStatus(`救护 ${current} / ${targets.length}`);
    if (current >= targets.length) {
      ended = true;
      setTimeout(() => complete(scene.completeText), 750);
      return;
    }
    call.textContent = "担架队正在转向下一处呼叫";
    started = false;
    start.classList.remove("historical-key-command--muted");
    startLabel.textContent = "确认下一处救护呼叫";
  }

  function missTarget() {
    if (!active || ended) return;
    active = false;
    mistakes += 1;
    nodes.hotspots.replaceChildren();
    risk.innerHTML = `担架队 ${renderRisk(maxMistakes, mistakes)}`;
    report("炮火逼近，担架队未能及时到达，重新选择遮蔽路线", "danger", 2200);
    if (mistakes >= maxMistakes) {
      ended = true;
      fail(scene.failText || "担架队连续失去接应窗口，请重新组织救护路线。 ");
      return;
    }
    started = false;
    start.classList.remove("historical-key-command--muted");
    startLabel.textContent = "重新接应当前呼叫";
    call.textContent = "担架队已退回遮蔽处，等待重新选择路线";
  }

  function onKeyDown(event) {
    if (event.code !== "Space") return;
    event.preventDefault();
    if (active) rescue();
    else startRescue();
  }

  window.addEventListener("keydown", onKeyDown);
  setStatus("等待开始救护");

  return {
    cleanup() {
      ended = true;
      clearTimeout(targetTimer);
      clearTimeout(nextTimer);
      window.removeEventListener("keydown", onKeyDown);
    },
  };
}

