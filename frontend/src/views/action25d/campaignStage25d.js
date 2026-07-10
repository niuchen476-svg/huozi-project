export function renderCampaignAction25d(root, level, config) {
  if (!config) return Promise.resolve();

  return new Promise((resolve) => {
    root.innerHTML = `
      <div class="view view-campaign-25d">
        <div class="campaign-25d campaign-25d--${config.theme}" id="campaign-25d">
          <div class="campaign-25d__world" id="campaign-world" aria-label="${level.title} 2.5D行动场景">
            <div class="campaign-25d__sky"></div>
            <div class="campaign-25d__far">
              ${renderFarScene(config.theme)}
            </div>
            <div class="campaign-25d__terrain">
              <div class="campaign-25d__route" id="campaign-route">
                ${renderRouteDetails(config.theme)}
                <div class="campaign-25d__goal" id="campaign-goal">
                  <span class="campaign-25d__goal-flag" id="campaign-goal-flag"></span>
                  <b>${config.goalLabel}</b>
                </div>
                <div class="campaign-25d__artifact-layer" id="campaign-artifact-layer">
                  ${(config.collectibles || []).map(renderArtifact).join("")}
                </div>
                <div class="campaign-25d__column" id="campaign-column">
                  ${renderMarchColumn()}
                </div>
                <div class="campaign-25d__threat campaign-25d__threat--left" id="campaign-threat-left"></div>
                <div class="campaign-25d__threat campaign-25d__threat--right" id="campaign-threat-right"></div>
                <div class="campaign-25d__burst" id="campaign-burst"></div>
              </div>
            </div>
            <div class="campaign-25d__foreground" aria-hidden="true">
              <span class="campaign-25d__forearm campaign-25d__forearm--left">${renderArmDetails()}</span>
              <span class="campaign-25d__forearm campaign-25d__forearm--right">${renderArmDetails()}</span>
            </div>
          </div>
          <div class="campaign-3d__shade"></div>

          <div class="campaign-3d__hud" id="campaign-hud" hidden>
            <div class="campaign-3d__meter">
              <span>${config.progressLabel}</span>
              <div class="campaign-3d__meter-track">
                <div class="campaign-3d__meter-fill" id="campaign-progress"></div>
              </div>
            </div>
            <div class="campaign-3d__integrity" id="campaign-integrity"></div>
            <div class="campaign-3d__inventory" id="campaign-inventory"></div>
          </div>

          <div class="campaign-3d__warning" id="campaign-warning" hidden></div>
          <div class="campaign-3d__caption" id="campaign-caption" hidden></div>
          <div class="campaign-3d__hint" id="campaign-hint" hidden></div>
          <div class="campaign-3d__letter" id="campaign-letter" hidden>
            <div class="campaign-3d__letter-paper">
              <p class="campaign-3d__letter-eyebrow">拾取书信</p>
              <h3 id="campaign-letter-title"></h3>
              <div class="campaign-3d__letter-lines" id="campaign-letter-lines"></div>
              <p class="campaign-3d__letter-source" id="campaign-letter-source"></p>
              <p class="campaign-3d__letter-timer" id="campaign-letter-timer"></p>
              <button class="campaign-3d__letter-continue" type="button" id="campaign-letter-continue">收好继续</button>
            </div>
          </div>

          <div class="campaign-3d__controls" id="campaign-controls" hidden>
            <button type="button" data-command="left" aria-label="向左闪避">←</button>
            <button type="button" data-command="advance">${config.advanceLabel}</button>
            <button type="button" data-command="right" aria-label="向右闪避">→</button>
          </div>

          <div class="history-intro history-intro--3d history-intro--25d" id="campaign-intro">
            <p class="history-intro__eyebrow">${level.date || ""}${level.location ? " · " + level.location : ""}</p>
            <h2 class="history-intro__title">${level.title}</h2>
            <p class="history-intro__text">${level.scenario}</p>
            <div class="campaign-3d__intro-actions">
              <button type="button" id="campaign-start">${config.introButton}</button>
              <button type="button" id="campaign-skip">直接查看档案</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const nodes = {
      shell: root.querySelector("#campaign-25d"),
      world: root.querySelector("#campaign-world"),
      column: root.querySelector("#campaign-column"),
      goal: root.querySelector("#campaign-goal"),
      goalFlag: root.querySelector("#campaign-goal-flag"),
      threatLeft: root.querySelector("#campaign-threat-left"),
      threatRight: root.querySelector("#campaign-threat-right"),
      burst: root.querySelector("#campaign-burst"),
      hud: root.querySelector("#campaign-hud"),
      progress: root.querySelector("#campaign-progress"),
      integrity: root.querySelector("#campaign-integrity"),
      inventory: root.querySelector("#campaign-inventory"),
      warning: root.querySelector("#campaign-warning"),
      caption: root.querySelector("#campaign-caption"),
      hint: root.querySelector("#campaign-hint"),
      letter: root.querySelector("#campaign-letter"),
      letterTitle: root.querySelector("#campaign-letter-title"),
      letterLines: root.querySelector("#campaign-letter-lines"),
      letterSource: root.querySelector("#campaign-letter-source"),
      letterTimer: root.querySelector("#campaign-letter-timer"),
      letterContinue: root.querySelector("#campaign-letter-continue"),
      controls: root.querySelector("#campaign-controls"),
      intro: root.querySelector("#campaign-intro"),
      start: root.querySelector("#campaign-start"),
      skip: root.querySelector("#campaign-skip"),
    };

    const stage = createCampaignStage25d(nodes, config);
    let progress = 0;
    let hits = 0;
    let finished = false;
    let active = false;
    let pausedForLetter = false;
    let awaitingDodge = null;
    let dodgeTimeout = null;
    let hazardTimeout = null;
    let letterTimeout = null;
    let letterInterval = null;
    const shownBeats = new Set();
    const collectibles = config.collectibles || [];
    const collectedArtifacts = new Set();

    function startMission() {
      nodes.intro.remove();
      nodes.hud.hidden = false;
      nodes.controls.hidden = false;
      active = true;
      stage.setActive(true);
      setControlsDisabled(false);
      updateHud();
      showHint("沿路收齐物品后再冲向终点；方向警示出现时及时闪避");
      scheduleHazard();
      window.addEventListener("keydown", onKeyDown);
    }

    function skipMission() {
      finished = true;
      active = false;
      clearTimeout(hazardTimeout);
      clearTimeout(letterTimeout);
      clearInterval(letterInterval);
      clearHazard();
      window.removeEventListener("keydown", onKeyDown);
      stage.cleanup();
      resolve("skipped");
    }

    function updateHud() {
      nodes.progress.style.width = `${progress}%`;
      nodes.integrity.textContent = `${config.integrityLabel} ${"●".repeat(config.hitLimit - hits)}${"○".repeat(hits)}`;
      stage.setProgress(progress);
      collectDueArtifacts();
      updateInventory();

      const beat = config.beats.find((item) => progress >= item.at && !shownBeats.has(item.at));
      if (beat) {
        shownBeats.add(beat.at);
        showCaption(beat.text, "narrative");
      }
    }

    function showCaption(text, type, duration = 2600) {
      nodes.caption.textContent = text;
      nodes.caption.className = `campaign-3d__caption campaign-3d__caption--${type}`;
      nodes.caption.hidden = false;
      clearTimeout(showCaption._timer);
      showCaption._timer = setTimeout(() => {
        nodes.caption.hidden = true;
      }, duration);
    }

    function showHint(text) {
      nodes.hint.textContent = text;
      nodes.hint.hidden = false;
      clearTimeout(showHint._timer);
      showHint._timer = setTimeout(() => {
        nodes.hint.hidden = true;
      }, 2600);
    }

    function updateInventory() {
      if (!collectibles.length) {
        nodes.inventory.hidden = true;
        return;
      }
      nodes.inventory.hidden = false;
      nodes.inventory.innerHTML = collectibles
        .map((item) => {
          const done = collectedArtifacts.has(item.id);
          return `<span class="campaign-3d__artifact ${done ? "campaign-3d__artifact--collected" : ""}">${done ? "✓" : "○"} ${item.name}</span>`;
        })
        .join("");
    }

    function setControlsDisabled(disabled) {
      nodes.controls.querySelectorAll("button").forEach((button) => {
        button.disabled = disabled;
      });
    }

    function collectDueArtifacts() {
      collectibles.forEach((item) => {
        if (progress < item.at || collectedArtifacts.has(item.id)) return;
        collectedArtifacts.add(item.id);
        stage.collectItem(item.id);
        if (item.kind === "letter" && item.letter) {
          showLetter(item);
        } else {
          showCaption(`拾取：${item.name}`, "collect", 1600);
        }
      });
    }

    function showLetter(item) {
      pausedForLetter = true;
      stage.setActive(false);
      setControlsDisabled(true);
      clearTimeout(hazardTimeout);
      clearHazard();
      clearTimeout(letterTimeout);
      clearInterval(letterInterval);

      nodes.letterTitle.textContent = item.letter.title || item.name;
      nodes.letterLines.replaceChildren();
      item.letter.lines.forEach((line) => {
        const p = document.createElement("p");
        p.textContent = line;
        nodes.letterLines.appendChild(p);
      });
      nodes.letterSource.textContent = item.letter.sourceName ? `资料来源：${item.letter.sourceName}` : "";
      nodes.letter.hidden = false;

      const startedAt = performance.now();
      const updateTimer = () => {
        const remaining = Math.max(0, Math.ceil((5000 - (performance.now() - startedAt)) / 1000));
        nodes.letterTimer.textContent = `${remaining} 秒后继续前进`;
      };
      updateTimer();
      letterInterval = setInterval(updateTimer, 200);
      letterTimeout = setTimeout(() => closeLetter(item), 5000);
    }

    function closeLetter(item) {
      clearTimeout(letterTimeout);
      clearInterval(letterInterval);
      nodes.letter.hidden = true;
      pausedForLetter = false;
      stage.setActive(true);
      setControlsDisabled(false);
      showCaption(`收好：${item.name}`, "collect", 1300);
      showHint("继续向桥头前进");
      scheduleHazard();
    }

    function hasAllArtifacts() {
      return collectedArtifacts.size >= collectibles.length;
    }

    function missingArtifactNames() {
      return collectibles
        .filter((item) => !collectedArtifacts.has(item.id))
        .map((item) => item.name)
        .join("、");
    }

    function advance() {
      if (!active || finished || pausedForLetter) return;
      progress = Math.min(100, progress + config.advanceStep);
      stage.step();
      updateHud();
      if (progress >= 100) {
        if (hasAllArtifacts()) {
          winMission();
        } else {
          progress = 96;
          updateHud();
          showHint(`还缺：${missingArtifactNames()}。收齐后才能完成最后任务`);
        }
      }
    }

    function scheduleHazard() {
      clearTimeout(hazardTimeout);
      if (!active || finished || pausedForLetter) return;
      const gap = config.minHazardGapMs + Math.random() * (config.maxHazardGapMs - config.minHazardGapMs);
      hazardTimeout = setTimeout(fireHazard, gap);
    }

    function fireHazard() {
      if (!active || finished || pausedForLetter) return;
      const side = Math.random() < 0.5 ? "left" : "right";
      awaitingDodge = side;
      nodes.warning.hidden = false;
      nodes.warning.className = `campaign-3d__warning campaign-3d__warning--${side}`;
      nodes.warning.textContent = config.warning(side);
      stage.showThreat(side);

      dodgeTimeout = setTimeout(() => {
        if (awaitingDodge) registerHit();
        clearHazard();
        scheduleHazard();
      }, config.dodgeWindowMs);
    }

    function clearHazard() {
      nodes.warning.hidden = true;
      stage.clearThreat();
      awaitingDodge = null;
      clearTimeout(dodgeTimeout);
    }

    function dodge(side) {
      if (!active || finished || pausedForLetter || !awaitingDodge) return;
      if (side === awaitingDodge) {
        clearHazard();
        showCaption(config.dodgeLine, "success", 1300);
        scheduleHazard();
      }
    }

    function registerHit() {
      hits += 1;
      stage.hit(awaitingDodge);
      showCaption(config.hitLines[Math.floor(Math.random() * config.hitLines.length)], "hit", 1700);
      updateHud();
      if (hits >= config.hitLimit) failMission();
    }

    function failMission() {
      finished = true;
      clearTimeout(hazardTimeout);
      clearHazard();
      showCaption(config.failLine, "fail", 2300);
      setTimeout(() => {
        progress = 0;
        hits = 0;
        finished = false;
        pausedForLetter = false;
        clearTimeout(letterTimeout);
        clearInterval(letterInterval);
        nodes.letter.hidden = true;
        setControlsDisabled(false);
        shownBeats.clear();
        collectedArtifacts.clear();
        stage.reset();
        updateHud();
        showHint("重新组织队形：收齐物品，避开危险，再向终点推进");
        scheduleHazard();
      }, 2500);
    }

    function winMission() {
      finished = true;
      active = false;
      clearTimeout(hazardTimeout);
      clearTimeout(letterTimeout);
      clearInterval(letterInterval);
      clearHazard();
      nodes.controls.hidden = true;
      window.removeEventListener("keydown", onKeyDown);
      stage.win();
      showCaption(config.winLines[0], "victory", 2600);
      setTimeout(() => showCaption(config.winLines[1], "victory", 2500), 2100);
      setTimeout(() => {
        stage.cleanup();
        resolve();
      }, 4700);
    }

    function onKeyDown(event) {
      if (pausedForLetter) return;
      if (event.code === "Space" || event.key === " ") {
        event.preventDefault();
        advance();
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        dodge(event.key === "ArrowLeft" ? "left" : "right");
      }
    }

    nodes.start.addEventListener("click", startMission);
    nodes.skip.addEventListener("click", skipMission);
    nodes.letterContinue.addEventListener("click", () => {
      const item = collectibles.find((entry) => entry.kind === "letter" && collectedArtifacts.has(entry.id));
      if (item && pausedForLetter) closeLetter(item);
    });
    nodes.controls.querySelectorAll("[data-command]").forEach((button) => {
      button.addEventListener("click", () => {
        const command = button.dataset.command;
        if (command === "advance") advance();
        if (command === "left" || command === "right") dodge(command);
      });
    });
  });
}

function createCampaignStage25d(nodes, config) {
  const artifacts = new Map(
    [...nodes.world.querySelectorAll("[data-artifact-id]")].map((element) => [element.dataset.artifactId, element])
  );
  let active = false;
  let stepTimer = null;
  let hitTimer = null;

  function setProgress(value) {
    const t = value / 100;
    const top = 78 - t * 43;
    const scale = 0.78 + t * 0.58;
    const lane = Math.sin(t * Math.PI * 1.35) * 4;
    nodes.world.style.setProperty("--progress", t.toFixed(3));
    nodes.world.style.setProperty("--column-top", `${top.toFixed(2)}%`);
    nodes.world.style.setProperty("--column-scale", scale.toFixed(3));
    nodes.world.style.setProperty("--column-x", `${lane.toFixed(2)}%`);
    nodes.goal.classList.toggle("campaign-25d__goal--near", value > 78);
  }

  setProgress(0);

  return {
    setActive(value) {
      active = value;
      nodes.world.classList.toggle("campaign-25d__world--active", value);
    },
    setProgress,
    step() {
      if (!active) return;
      nodes.column.classList.remove("campaign-25d__column--step");
      void nodes.column.offsetWidth;
      nodes.column.classList.add("campaign-25d__column--step");
      clearTimeout(stepTimer);
      stepTimer = setTimeout(() => nodes.column.classList.remove("campaign-25d__column--step"), 260);
    },
    showThreat(side) {
      this.clearThreat();
      const threat = side === "left" ? nodes.threatLeft : nodes.threatRight;
      threat.classList.add("campaign-25d__threat--active");
      nodes.world.classList.add(`campaign-25d__world--threat-${side}`);
    },
    clearThreat() {
      nodes.threatLeft.classList.remove("campaign-25d__threat--active");
      nodes.threatRight.classList.remove("campaign-25d__threat--active");
      nodes.world.classList.remove("campaign-25d__world--threat-left", "campaign-25d__world--threat-right");
    },
    hit(side) {
      nodes.world.classList.add("campaign-25d__world--hit");
      nodes.burst.className = `campaign-25d__burst campaign-25d__burst--${side} campaign-25d__burst--active`;
      clearTimeout(hitTimer);
      hitTimer = setTimeout(() => {
        nodes.world.classList.remove("campaign-25d__world--hit");
        nodes.burst.className = "campaign-25d__burst";
      }, 620);
    },
    collectItem(id) {
      const item = artifacts.get(id);
      if (!item) return;
      item.classList.add("campaign-25d__collectible--collected");
    },
    reset() {
      this.clearThreat();
      setProgress(0);
      nodes.world.classList.remove("campaign-25d__world--hit", "campaign-25d__world--win");
      nodes.goalFlag.classList.remove("campaign-25d__goal-flag--shown");
      artifacts.forEach((item) => item.classList.remove("campaign-25d__collectible--collected"));
    },
    win() {
      nodes.world.classList.add("campaign-25d__world--win");
      nodes.goalFlag.classList.add("campaign-25d__goal-flag--shown");
      setProgress(100);
    },
    cleanup() {
      clearTimeout(stepTimer);
      clearTimeout(hitTimer);
    },
  };
}

function renderFarScene(theme) {
  if (theme === "xiangjiang") {
    return `
      <span class="campaign-25d__ridge campaign-25d__ridge--one"></span>
      <span class="campaign-25d__ridge campaign-25d__ridge--two"></span>
      <span class="campaign-25d__river"></span>
      <span class="campaign-25d__smoke campaign-25d__smoke--one"></span>
      <span class="campaign-25d__smoke campaign-25d__smoke--two"></span>
    `;
  }
  return `
    <span class="campaign-25d__moon"></span>
    <span class="campaign-25d__ridge campaign-25d__ridge--one"></span>
    <span class="campaign-25d__ridge campaign-25d__ridge--two"></span>
    <span class="campaign-25d__watchlight campaign-25d__watchlight--one"></span>
    <span class="campaign-25d__watchlight campaign-25d__watchlight--two"></span>
  `;
}

function renderRouteDetails(theme) {
  const boards = Array.from({ length: theme === "xiangjiang" ? 14 : 10 }, (_, index) => {
    const top = 24 + index * 4.7;
    const width = Math.max(24, 55 - index * 1.8);
    const tilt = index % 2 === 0 ? -1.8 : 1.6;
    return `<span class="campaign-25d__plank" style="--top:${top.toFixed(1)}%;--width:${width.toFixed(1)}%;--tilt:${tilt}deg"></span>`;
  }).join("");
  const grass = Array.from({ length: 20 }, (_, index) => {
    const side = index % 2 === 0 ? -1 : 1;
    const left = 50 + side * (26 + (index % 5) * 5);
    const top = 23 + index * 3.2;
    const scale = 0.7 + (index % 4) * 0.12;
    return `<span class="campaign-25d__grass" style="--left:${left.toFixed(1)}%;--top:${top.toFixed(1)}%;--scale:${scale.toFixed(2)}"></span>`;
  }).join("");
  return `${boards}${grass}`;
}

function renderMarchColumn() {
  const positions = [
    [-4, 4, 1],
    [2, 12, 0.92],
    [7, 20, 0.84],
    [-1, 28, 0.8],
    [-7, 36, 0.74],
    [4, 44, 0.7],
    [-3, 52, 0.66],
  ];
  return positions
    .map(([x, y, scale], index) => {
      return `
        <span class="campaign-25d__soldier" style="--x:${x}px;--y:${y}px;--s:${scale};--d:${index * 0.13}s">
          <i class="campaign-25d__soldier-shadow"></i>
          <i class="campaign-25d__soldier-leg campaign-25d__soldier-leg--left"></i>
          <i class="campaign-25d__soldier-leg campaign-25d__soldier-leg--right"></i>
          <i class="campaign-25d__soldier-body"></i>
          <i class="campaign-25d__soldier-strap"></i>
          <i class="campaign-25d__soldier-pack"></i>
          <i class="campaign-25d__soldier-head"></i>
          <i class="campaign-25d__soldier-cap"></i>
          <i class="campaign-25d__soldier-star"></i>
        </span>
      `;
    })
    .join("");
}

function renderArtifact(item) {
  const left = 50 + (item.x ?? 0) * 24;
  const top = 78 - item.at * 0.45;
  const scale = 0.72 + item.at * 0.004;
  return `
    <span
      class="campaign-25d__collectible campaign-25d__collectible--${item.kind}"
      data-artifact-id="${item.id}"
      style="--left:${left.toFixed(2)}%;--top:${top.toFixed(2)}%;--scale:${scale.toFixed(2)}"
    >
      <i>${renderArtifactIcon(item.kind)}</i>
      <b>${item.name}</b>
    </span>
  `;
}

function renderArtifactIcon(kind) {
  if (kind === "letter") return '<span class="campaign-25d__icon-letter"></span>';
  if (kind === "map") return '<span class="campaign-25d__icon-map"></span>';
  if (kind === "medical") return '<span class="campaign-25d__icon-medical"></span>';
  return '<span class="campaign-25d__icon-pack"></span>';
}

function renderArmDetails() {
  return `
    <i class="campaign-25d__armor-row campaign-25d__armor-row--one"></i>
    <i class="campaign-25d__armor-row campaign-25d__armor-row--two"></i>
    <i class="campaign-25d__armor-wrap"></i>
    <i class="campaign-25d__hand"></i>
  `;
}
