import * as THREE from "three";
import {
  animateBursts,
  animateCollectibles,
  createBurst,
  createCollectibleArtifacts,
  createFirstPersonRig,
  createGroundWarning,
  createMarchColumn,
  createRiverColumn,
  createRiverGate,
  createSearchlight,
  createTorch,
  makePlane,
} from "./campaignObjects.js";
export {
  animateBursts,
  createBurst,
  createGroundWarning,
  createMarchColumn,
  createRiverColumn,
  createRiverGate,
  createSearchlight,
  createTorch,
  makePlane,
} from "./campaignObjects.js";


export function renderCampaignAction3d(root, level, config) {
  if (!config) return Promise.resolve();

  return new Promise((resolve) => {
    root.innerHTML = `
      <div class="view view-campaign-3d">
        <div class="campaign-3d campaign-3d--${config.theme}" id="campaign-3d">
          <canvas class="campaign-3d__canvas" id="campaign-canvas" aria-label="${level.title} 3D行动场景"></canvas>
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

          <div class="history-intro history-intro--3d" id="campaign-intro">
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
      canvas: root.querySelector("#campaign-canvas"),
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

    const stage = createCampaignStage(nodes.canvas, config);
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
      letterTimeout = setTimeout(() => {
        closeLetter(item);
      }, 5000);
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
      setTimeout(() => {
        showCaption(config.winLines[1], "victory", 2500);
      }, 2100);
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

function createCampaignStage(canvas, config) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(54, 1, 0.1, 80);
  camera.position.set(0, 1.08, 2.35);
  camera.lookAt(0, 0.84, -1.85);
  scene.add(camera);

  const nearFill = new THREE.PointLight(0xffd6a0, 0.72, 4.2);
  nearFill.position.set(0, 0.74, 0.18);
  camera.add(nearFill);

  const objects = {
    animated: [],
    threats: {},
    progress: 0,
  };

  config.build(scene, objects);
  objects.firstPersonRig = createFirstPersonRig();
  camera.add(objects.firstPersonRig);
  objects.collectibles = createCollectibleArtifacts(config.collectibles || []);
  objects.collectibles.forEach((item) => scene.add(item));

  let active = false;
  let raf = null;
  let shake = 0;
  let elapsed = 0;
  const startedAt = performance.now();

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function animate() {
    raf = requestAnimationFrame(animate);
    resize();

    elapsed = (performance.now() - startedAt) / 1000;
    config.animate(objects, elapsed, active);
    animateCollectibles(objects, elapsed);

    const progressOffset = objects.progress / 100;
    const cameraZ = THREE.MathUtils.lerp(2.35, -7.05, progressOffset);
    const stride = active ? Math.sin(elapsed * 5.6) : Math.sin(elapsed * 1.2) * 0.25;
    camera.position.x = Math.sin(elapsed * 0.9) * 0.07 + (Math.random() - 0.5) * shake;
    camera.position.y = 1.08 + stride * 0.018 + Math.random() * shake * 0.22;
    camera.position.z = cameraZ + Math.sin(elapsed * 2.2) * 0.025;
    camera.lookAt(camera.position.x + Math.sin(elapsed * 0.5) * 0.05, 0.84 + stride * 0.01, cameraZ - 4.2);
    if (objects.firstPersonRig) {
      objects.firstPersonRig.position.y = -0.43 + Math.sin(elapsed * 5.6) * (active ? 0.018 : 0.006);
      objects.firstPersonRig.rotation.z = Math.sin(elapsed * 4.8) * (active ? 0.025 : 0.008);
    }
    shake *= 0.86;

    renderer.render(scene, camera);
  }

  resize();
  animate();
  window.addEventListener("resize", resize);

  return {
    setActive(value) {
      active = value;
    },
    setProgress(value) {
      objects.progress = value;
      const t = value / 100;
      if (objects.column) {
        objects.column.position.z = THREE.MathUtils.lerp(3.05, -6.2, t);
        objects.column.position.x = Math.sin(t * Math.PI * 1.4) * 0.22;
      }
      if (objects.goal) {
        objects.goal.scale.setScalar(1 + t * 0.08);
      }
    },
    step() {
      shake = Math.max(shake, 0.035);
      if (objects.column) objects.column.rotation.z = -0.03 + Math.random() * 0.06;
    },
    showThreat(side) {
      Object.values(objects.threats).forEach((threat) => {
        threat.visible = false;
      });
      if (objects.threats[side]) objects.threats[side].visible = true;
    },
    clearThreat() {
      Object.values(objects.threats).forEach((threat) => {
        threat.visible = false;
      });
    },
    hit(side) {
      shake = 0.25;
      const burst = objects.bursts?.[side] || objects.bursts?.center;
      if (burst) {
        burst.visible = true;
        burst.userData.startedAt = elapsed;
      }
    },
    collectItem(id) {
      const item = objects.collectibles?.find((entry) => entry.userData.id === id);
      if (!item) return;
      item.visible = false;
      item.userData.collected = true;
    },
    reset() {
      this.clearThreat();
      objects.progress = 0;
      if (objects.column) {
        objects.column.position.set(0, 0, 2.35);
        objects.column.rotation.set(0, 0, 0);
      }
      Object.values(objects.bursts || {}).forEach((burst) => {
        burst.visible = false;
      });
      objects.collectibles?.forEach((item) => {
        item.visible = true;
        item.userData.collected = false;
        item.position.y = item.userData.baseY;
      });
    },
    win() {
      if (objects.goalFlag) objects.goalFlag.visible = true;
      if (objects.column) objects.column.position.z = -7.8;
      shake = 0.02;
    },
    cleanup() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => {
            if (material.map) material.map.dispose();
            material.dispose();
          });
        } else if (object.material) {
          if (object.material.map) object.material.map.dispose();
          object.material.dispose();
        }
      });
      renderer.dispose();
    },
  };
}
