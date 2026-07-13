import {
  numberKey,
  randomBetween,
  renderKeyCommand,
  renderRisk,
  renderTaskHeader,
  updateTaskProgress,
} from "../historicalMissionUi.js";

export function createSignalController(scene, context) {
  const { nodes, report, setStatus, complete, fail } = context;
  const groups = scene.groups || [];
  const maxMistakes = scene.maxMistakes || 3;
  let current = 0;
  let mistakes = 0;
  let ready = false;
  let ended = false;
  let started = false;
  let signalTimer = null;

  nodes.task.innerHTML = `
    ${renderTaskHeader(scene, `已接应 0 / ${groups.length}`)}
    <div class="historical-mission__signal" data-signal>
      <i></i>
      <span>等待渡口联络号</span>
    </div>
    <ol class="historical-mission__queue" data-queue>
      ${groups.map((group, index) => `<li data-group="${index}"><i>${index + 1}</i><span>${group}</span></li>`).join("")}
    </ol>
    <div class="historical-mission__controls">
      ${renderKeyCommand("Space", "开始监听渡口号令", "", "data-signal-command")}
    </div>
  `;

  const signal = nodes.task.querySelector("[data-signal]");
  const action = nodes.task.querySelector("[data-signal-command] span");
  const queue = nodes.task.querySelector("[data-queue]");

  function waitForSignal(delay = 1100) {
    clearTimeout(signalTimer);
    ready = false;
    signal.classList.remove("historical-mission__signal--ready");
    signal.querySelector("span").textContent = "等待渡口联络号";
    setStatus(`接应 ${current} / ${groups.length}`);
    signalTimer = setTimeout(openSignal, delay);
  }

  function openSignal() {
    if (ended) return;
    ready = true;
    signal.classList.add("historical-mission__signal--ready");
    signal.querySelector("span").textContent = "联络号已到，河面通道开放";
    setStatus("立即接应");
    signalTimer = setTimeout(missSignal, scene.signalWindow || 1800);
  }

  function missSignal() {
    if (ended || !ready) return;
    ready = false;
    mistakes += 1;
    report("错过了这一轮接应时机，队伍退回遮蔽处等待", "danger");
    if (mistakes >= maxMistakes) {
      ended = true;
      fail(scene.failText || "渡口接应连续失去时机，请重新组织联络。 ");
      return;
    }
    started = false;
    signal.classList.remove("historical-mission__signal--ready");
    signal.querySelector("span").textContent = "队伍已退回遮蔽处";
    action.textContent = "重新监听渡口号令";
    setStatus("等待重新监听");
  }

  function receiveGroup() {
    if (ended) return;
    if (!started) {
      started = true;
      action.textContent = "按号令接应下一队";
      signal.querySelector("span").textContent = "正在监听渡口联络号";
      setStatus("等待联络号");
      waitForSignal(500);
      return;
    }
    if (!ready) {
      report("联络号尚未确认，队伍继续留在遮蔽处", "neutral");
      return;
    }

    ready = false;
    clearTimeout(signalTimer);
    queue.querySelector(`[data-group="${current}"]`).classList.add("historical-mission__queue-item--done");
    report(`${groups[current]}已安全接入渡口队列`, "success");
    current += 1;
    updateTaskProgress(nodes.task, current, groups.length, `已接应 ${current} / ${groups.length}`);
    if (current >= groups.length) {
      ended = true;
      setTimeout(() => complete(scene.completeText), 700);
      return;
    }
    started = false;
    signal.classList.remove("historical-mission__signal--ready");
    signal.querySelector("span").textContent = "下一支队伍正在遮蔽处待命";
    action.textContent = "监听下一次渡口号令";
    setStatus(`接应 ${current} / ${groups.length}`);
  }

  function onKeyDown(event) {
    if (event.code !== "Space") return;
    event.preventDefault();
    receiveGroup();
  }

  window.addEventListener("keydown", onKeyDown);
  action.textContent = "开始监听渡口号令";
  setStatus("等待开始接应");

  return {
    cleanup() {
      ended = true;
      clearTimeout(signalTimer);
      window.removeEventListener("keydown", onKeyDown);
    },
  };
}

