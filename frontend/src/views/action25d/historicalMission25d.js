export function renderHistoricalMission25d(root, level, config) {
  if (!config?.scenes?.length) return Promise.resolve();

  preloadSceneImages(config.scenes);

  return new Promise((resolve) => {
    root.innerHTML = `
      <div class="view view-historical-mission">
        <main class="historical-mission historical-mission--${config.theme}" id="historical-mission">
          <section class="historical-mission__stage" id="historical-stage">
            <div class="historical-mission__backdrop" id="historical-backdrop" role="img"></div>
            <div class="historical-mission__atmosphere" aria-hidden="true"></div>
            <div class="historical-mission__scrim" aria-hidden="true"></div>

            <header class="historical-mission__topbar" id="historical-topbar" hidden>
              <div class="historical-mission__identity">
                <span>${level.title}</span>
                <b id="historical-scene-counter">1 / ${config.scenes.length}</b>
              </div>
              <ol class="historical-mission__timeline" id="historical-timeline">
                ${config.scenes.map((scene, index) => `
                  <li data-timeline-step="${index}">
                    <i>${index + 1}</i>
                    <span>${scene.shortTitle || scene.title}</span>
                  </li>
                `).join("")}
              </ol>
              <span class="historical-mission__status" id="historical-status"></span>
            </header>

            <aside class="historical-mission__story" id="historical-story" hidden></aside>
            <div class="historical-mission__hotspots" id="historical-hotspots"></div>
            <section class="historical-mission__task" id="historical-task" hidden></section>
            <div class="historical-mission__feedback" id="historical-feedback" hidden></div>
            <div class="historical-mission__overlay" id="historical-overlay" hidden></div>

            <section class="historical-mission__intro" id="historical-intro">
              <p class="historical-mission__eyebrow">${level.date || ""}${level.location ? " · " + level.location : ""}</p>
              <h1>${level.title}</h1>
              <p>${level.scenario}</p>
              <div class="historical-mission__intro-actions">
                <button type="button" id="historical-start">${config.introButton || "进入历史现场"}</button>
                <button type="button" id="historical-skip">直接查看档案</button>
              </div>
            </section>
          </section>
        </main>
      </div>
    `;

    const nodes = {
      shell: root.querySelector("#historical-mission"),
      stage: root.querySelector("#historical-stage"),
      backdrop: root.querySelector("#historical-backdrop"),
      topbar: root.querySelector("#historical-topbar"),
      timeline: root.querySelector("#historical-timeline"),
      sceneCounter: root.querySelector("#historical-scene-counter"),
      status: root.querySelector("#historical-status"),
      story: root.querySelector("#historical-story"),
      hotspots: root.querySelector("#historical-hotspots"),
      task: root.querySelector("#historical-task"),
      feedback: root.querySelector("#historical-feedback"),
      overlay: root.querySelector("#historical-overlay"),
      intro: root.querySelector("#historical-intro"),
      start: root.querySelector("#historical-start"),
      skip: root.querySelector("#historical-skip"),
    };

    let sceneIndex = 0;
    let controller = null;
    let feedbackTimer = null;
    let settled = false;

    applySceneBackdrop(nodes, config.scenes[0]);

    function finish(value) {
      if (settled) return;
      settled = true;
      controller?.cleanup();
      clearTimeout(feedbackTimer);
      resolve(value);
    }

    function startMission() {
      nodes.intro.remove();
      window.scrollTo({ top: 0, behavior: "auto" });
      nodes.topbar.hidden = false;
      nodes.story.hidden = false;
      nodes.task.hidden = false;
      renderScene();
    }

    function renderScene() {
      controller?.cleanup();
      controller = null;
      nodes.overlay.hidden = true;
      nodes.hotspots.replaceChildren();
      nodes.task.replaceChildren();
      nodes.stage.className = "historical-mission__stage";

      const scene = config.scenes[sceneIndex];
      nodes.stage.classList.add(`historical-mission__stage--${scene.type}`, `historical-mission__stage--${scene.id}`);
      applySceneBackdrop(nodes, scene);
      renderTimeline(nodes, config.scenes, sceneIndex);
      nodes.sceneCounter.textContent = `${sceneIndex + 1} / ${config.scenes.length}`;
      nodes.status.textContent = scene.statusLabel || "任务进行中";
      nodes.story.innerHTML = renderStory(scene, sceneIndex, config.scenes.length);

      controller = createSceneController(scene, {
        nodes,
        report,
        setStatus(text) {
          nodes.status.textContent = text;
        },
        complete(summary) {
          completeScene(scene, summary);
        },
        fail(reason) {
          failScene(reason);
        },
      });
    }

    function completeScene(scene, summary) {
      controller?.cleanup();
      controller = null;
      nodes.stage.classList.remove("historical-mission__stage--danger", "historical-mission__stage--impact");
      const isLast = sceneIndex === config.scenes.length - 1;
      const nextLabel = isLast ? "完成本关行动" : "进入下一幕";

      showOverlay(`
        <div class="historical-mission__result historical-mission__result--success">
          <p>第 ${sceneIndex + 1} 幕完成</p>
          <h2>${scene.completeTitle || scene.title}</h2>
          <div class="historical-mission__result-summary">${summary || scene.completeText || "任务完成。"}</div>
          <div class="historical-mission__fact">
            <span>史实节点</span>
            <p>${scene.fact}</p>
          </div>
          ${renderSource(scene.source)}
          <button type="button" data-next-scene>${nextLabel}</button>
        </div>
      `);

      const next = nodes.overlay.querySelector("[data-next-scene]");
      next.addEventListener("click", () => {
        if (isLast) {
          showMissionComplete();
          return;
        }
        sceneIndex += 1;
        window.scrollTo({ top: 0, behavior: "auto" });
        renderScene();
      });
    }

    function failScene(reason) {
      controller?.cleanup();
      controller = null;
      showOverlay(`
        <div class="historical-mission__result historical-mission__result--retry">
          <p>本幕需要重新组织</p>
          <h2>任务没有完成</h2>
          <div class="historical-mission__result-summary">${reason}</div>
          <button type="button" data-retry-scene>重新执行本幕</button>
        </div>
      `);
      nodes.overlay.querySelector("[data-retry-scene]").addEventListener("click", renderScene);
    }

    function showMissionComplete() {
      nodes.stage.classList.add("historical-mission__stage--complete");
      showOverlay(`
        <div class="historical-mission__result historical-mission__result--mission-complete">
          <p>历史行动完成</p>
          <h2>${config.completionTitle}</h2>
          <div class="historical-mission__result-summary">${config.completionText}</div>
          <button type="button" data-finish-mission>进入本关档案任务</button>
        </div>
      `);
      nodes.overlay.querySelector("[data-finish-mission]").addEventListener("click", () => finish());
    }

    function showOverlay(markup) {
      nodes.overlay.innerHTML = markup;
      nodes.overlay.hidden = false;
    }

    function report(text, tone = "neutral", duration = 1700) {
      nodes.feedback.textContent = text;
      nodes.feedback.className = `historical-mission__feedback historical-mission__feedback--${tone}`;
      nodes.feedback.hidden = false;
      clearTimeout(feedbackTimer);
      feedbackTimer = setTimeout(() => {
        nodes.feedback.hidden = true;
      }, duration);
    }

    nodes.start.addEventListener("click", startMission);
    nodes.skip.addEventListener("click", () => finish("skipped"));
  });
}

function createSceneController(scene, context) {
  if (scene.type === "collect") return createCollectController(scene, context);
  if (scene.type === "stealth") return createStealthController(scene, context);
  if (scene.type === "signal") return createSignalController(scene, context);
  if (scene.type === "repair") return createRepairController(scene, context);
  if (scene.type === "dispatch") return createDispatchController(scene, context);
  if (scene.type === "rescue") return createRescueController(scene, context);
  return { cleanup() {} };
}

function createCollectController(scene, context) {
  const { nodes, report, setStatus, complete } = context;
  const collected = new Set();
  nodes.task.innerHTML = renderTaskHeader(scene, `已编入 0 / ${scene.items.length}`);
  nodes.hotspots.innerHTML = scene.items.map((item, index) => `
    <button
      class="historical-hotspot historical-hotspot--supply"
      type="button"
      data-collect-item="${item.id}"
      style="--x:${item.x}%;--y:${item.y}%"
      aria-label="编入${item.label}"
    >
      <i>${index + 1}</i>
      <span><b>${item.label}</b><small>${item.detail}</small></span>
    </button>
  `).join("");

  const buttons = [...nodes.hotspots.querySelectorAll("[data-collect-item]")];
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.collectItem;
      if (collected.has(id)) return;
      collected.add(id);
      button.classList.add("historical-hotspot--done");
      button.disabled = true;
      const item = scene.items.find((entry) => entry.id === id);
      report(`${item.label}已编入转移队列`, "success");
      updateTaskProgress(nodes.task, collected.size, scene.items.length, `已编入 ${collected.size} / ${scene.items.length}`);
      setStatus(`物资 ${collected.size} / ${scene.items.length}`);
      if (collected.size === scene.items.length) {
        setTimeout(() => complete(scene.completeText), 650);
      }
    });
  });

  return { cleanup() {} };
}

function createStealthController(scene, context) {
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
      <button type="button" data-stealth-advance>跟队前进</button>
      <button type="button" data-stealth-hide>熄灯隐蔽</button>
    </div>
    <div class="historical-mission__alert" data-stealth-alert hidden>
      <b>侦察光正在扫过</b>
      <span>立即熄灯，队伍贴近山影</span>
    </div>
  `;

  const advance = nodes.task.querySelector("[data-stealth-advance]");
  const hide = nodes.task.querySelector("[data-stealth-hide]");
  const alert = nodes.task.querySelector("[data-stealth-alert]");
  const risk = nodes.task.querySelector("[data-risk]");

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
    advance.disabled = true;
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
      advance.disabled = false;
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
    if (event.key.toLowerCase() === "h") conceal();
  }

  advance.addEventListener("click", move);
  hide.addEventListener("click", conceal);
  window.addEventListener("keydown", onKeyDown);

  return {
    cleanup() {
      ended = true;
      clearTimeout(dangerTimer);
      clearTimeout(hazardTimer);
      clearTimeout(lockTimer);
      window.removeEventListener("keydown", onKeyDown);
    },
  };
}

function createSignalController(scene, context) {
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
      <button type="button" data-signal-action>按号令接应下一队</button>
    </div>
  `;

  const signal = nodes.task.querySelector("[data-signal]");
  const action = nodes.task.querySelector("[data-signal-action]");
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

  action.addEventListener("click", receiveGroup);
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

function createRepairController(scene, context) {
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
      <button type="button" data-repair-action>固定当前桥段</button>
      <button type="button" data-repair-hide>卧倒隐蔽</button>
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

  const repair = nodes.task.querySelector("[data-repair-action]");
  const hide = nodes.task.querySelector("[data-repair-hide]");
  const alert = nodes.task.querySelector("[data-repair-alert]");
  const risk = nodes.task.querySelector("[data-risk]");

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
    repair.disabled = true;
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
      repair.disabled = false;
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
    if (event.key.toLowerCase() === "h") takeCover();
  }

  repair.addEventListener("click", repairCurrent);
  hide.addEventListener("click", takeCover);
  window.addEventListener("keydown", onKeyDown);

  return {
    cleanup() {
      ended = true;
      clearTimeout(hazardTimer);
      clearTimeout(dangerTimer);
      clearTimeout(repairTimer);
      window.removeEventListener("keydown", onKeyDown);
    },
  };
}

function createDispatchController(scene, context) {
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
      <button type="button" data-dispatch-start>开始组织渡江</button>
      <button type="button" data-lane="left" disabled>上游通道</button>
      <button type="button" data-lane="right" disabled>下游通道</button>
    </div>
  `;
  nodes.hotspots.innerHTML = `
    <div class="historical-mission__fire-zone historical-mission__fire-zone--left" data-fire-zone="left"><i></i><span>炮火覆盖</span></div>
    <div class="historical-mission__fire-zone historical-mission__fire-zone--right" data-fire-zone="right"><i></i><span>炮火覆盖</span></div>
  `;

  const warning = nodes.task.querySelector("[data-dispatch-warning]");
  const queue = nodes.task.querySelector("[data-queue]");
  const start = nodes.task.querySelector("[data-dispatch-start]");
  const laneButtons = [...nodes.task.querySelectorAll("[data-lane]")];

  function startDispatch() {
    if (started || ended) return;
    started = true;
    start.hidden = true;
    laneButtons.forEach((button) => {
      button.disabled = false;
    });
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
    laneButtons.forEach((button) => {
      button.disabled = true;
    });
    start.hidden = false;
    start.textContent = success ? "观察下一轮炮火" : "重新观察炮火窗口";
    setStatus(`通过 ${current} / ${groups.length}`);
    warning.textContent = "下一支队列留在堤岸遮蔽处待命";
  }

  function chooseLane(lane) {
    if (!roundOpen || ended) return;
    closeRound(lane !== targetLane, lane);
  }

  function onKeyDown(event) {
    if (event.key === "ArrowLeft") chooseLane("left");
    if (event.key === "ArrowRight") chooseLane("right");
  }

  start.addEventListener("click", startDispatch);
  laneButtons.forEach((button) => button.addEventListener("click", () => chooseLane(button.dataset.lane)));
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

function createRescueController(scene, context) {
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
      <button type="button" data-rescue-start>开始江滩救护</button>
    </div>
  `;
  const risk = nodes.task.querySelector("[data-risk]");
  const call = nodes.task.querySelector("[data-rescue-call]");
  const start = nodes.task.querySelector("[data-rescue-start]");

  function startRescue() {
    if (started || ended) return;
    started = true;
    start.hidden = true;
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
      <button class="historical-hotspot historical-hotspot--rescue" type="button"
        style="--x:${target.x}%;--y:${target.y}%" data-rescue-target>
        <i>+</i><span><b>抬上担架</b><small>${target.label}</small></span>
      </button>
    `;
    nodes.hotspots.querySelector("[data-rescue-target]").addEventListener("click", rescue);
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
    start.hidden = false;
    start.textContent = "确认下一处救护呼叫";
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
    start.hidden = false;
    start.textContent = "重新接应当前呼叫";
    call.textContent = "担架队已退回遮蔽处，等待重新选择路线";
  }

  function onKeyDown(event) {
    if (event.code !== "Space" || !active) return;
    event.preventDefault();
    rescue();
  }

  start.addEventListener("click", startRescue);
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

function renderTaskHeader(scene, progressText) {
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

function updateTaskProgress(task, value, total, label) {
  const ratio = total ? Math.min(1, value / total) : 0;
  const fill = task.querySelector("[data-task-progress-fill]");
  const text = task.querySelector("[data-task-progress-label]");
  if (fill) fill.style.width = `${ratio * 100}%`;
  if (text) text.textContent = label;
}

function renderStory(scene, index, total) {
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

function renderSource(source) {
  if (!source?.url) return "";
  return `<a class="historical-mission__source" href="${source.url}" target="_blank" rel="noreferrer">史料依据：${source.label}</a>`;
}

function renderTimeline(nodes, scenes, activeIndex) {
  nodes.timeline.querySelectorAll("[data-timeline-step]").forEach((step, index) => {
    step.classList.toggle("historical-mission__timeline-step--active", index === activeIndex);
    step.classList.toggle("historical-mission__timeline-step--done", index < activeIndex);
    step.querySelector("span").textContent = scenes[index].shortTitle || scenes[index].title;
  });
}

function applySceneBackdrop(nodes, scene) {
  nodes.backdrop.style.backgroundImage = `url("${scene.image}")`;
  nodes.backdrop.setAttribute("aria-label", scene.imageAlt || scene.title);
  nodes.backdrop.style.setProperty("--scene-position", scene.imagePosition || "center");
}

function preloadSceneImages(scenes) {
  scenes.forEach((scene) => {
    const image = new Image();
    image.decoding = "async";
    image.src = scene.image;
  });
}

function renderRisk(total, used) {
  return `<span aria-label="剩余 ${Math.max(0, total - used)} 次机会">${"●".repeat(Math.max(0, total - used))}${"○".repeat(used)}</span>`;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}
