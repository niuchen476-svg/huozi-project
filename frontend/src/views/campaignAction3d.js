import * as THREE from "three";

const SIDE_LABEL = {
  left: "左",
  right: "右",
};

const MISSIONS = {
  "ruijin-departure": {
    theme: "ruijin",
    progressLabel: "突围进度",
    integrityLabel: "隐蔽",
    introButton: "夜色出发",
    advanceLabel: "压低队形前进",
    dodgeLine: "队伍贴着山影绕开了灯束",
    failLine: "探照灯扫到队伍，必须退回林线重新隐蔽",
    winLines: ["于都河方向的薄雾亮了，队伍没有回头。", "长征的第一夜，就这样从沉默里开始。"],
    hitLines: ["灯束擦过队尾，行军速度被迫放慢", "封锁线枪声逼近，队伍短暂散开", "物资车陷进泥地，后队停下了脚步"],
    warning: (side) => `探照灯扫向${SIDE_LABEL[side]}侧，按 ${side === "left" ? "←" : "→"} 绕行`,
    beats: [
      { at: 8, text: "身后的瑞金渐渐看不见，只剩草鞋踩过湿土的声音" },
      { at: 38, text: "机关、后勤、电台、伤员都在队列里，速度不能只按冲锋来算" },
      { at: 70, text: "前方是于都河，过了河，就没有轻易回头的路" },
    ],
    advanceStep: 6,
    hitLimit: 3,
    dodgeWindowMs: 980,
    minHazardGapMs: 1450,
    maxHazardGapMs: 2450,
    build: buildRuijinScene,
    animate: animateRuijinScene,
  },
  "xiangjiang-battle": {
    theme: "xiangjiang",
    progressLabel: "渡江进度",
    integrityLabel: "队形",
    introButton: "抢渡湘江",
    advanceLabel: "向渡口推进",
    dodgeLine: "掩护火力压住了落点，队伍抢过一段江滩",
    failLine: "江滩火力过密，队伍撤回堤岸重新组织",
    winLines: ["最后一批战士冲上西岸，湘江仍在身后轰鸣。", "突破封锁的代价，被每一个数字记住。"],
    hitLines: ["炮弹落在江滩，掩护队形被撕开一角", "浮桥猛烈摇晃，后队被迫停顿", "敌军火力压上来，渡口又少了一分余地"],
    warning: (side) => `炮火落向${SIDE_LABEL[side]}翼，按 ${side === "left" ? "←" : "→"} 闪避`,
    beats: [
      { at: 10, text: "湘江不是背景，是横在队伍面前的第四道封锁线" },
      { at: 42, text: "有人架桥，有人阻击，有人把最后的时间留给主力" },
      { at: 76, text: "每向前一步，代价都在队伍里留下空位" },
    ],
    advanceStep: 5,
    hitLimit: 3,
    dodgeWindowMs: 860,
    minHazardGapMs: 1200,
    maxHazardGapMs: 2100,
    build: buildXiangjiangScene,
    animate: animateXiangjiangScene,
  },
};

export function renderCampaignAction3d(root, level) {
  const config = MISSIONS[level.levelId];
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
          </div>

          <div class="campaign-3d__warning" id="campaign-warning" hidden></div>
          <div class="campaign-3d__caption" id="campaign-caption" hidden></div>
          <div class="campaign-3d__hint" id="campaign-hint" hidden></div>

          <div class="campaign-3d__controls" id="campaign-controls" hidden>
            <button type="button" data-command="left" aria-label="向左闪避">←</button>
            <button type="button" data-command="advance">${config.advanceLabel}</button>
            <button type="button" data-command="right" aria-label="向右闪避">→</button>
          </div>

          <div class="history-intro history-intro--3d" id="campaign-intro">
            <p class="history-intro__eyebrow">${level.date || ""}${level.location ? " · " + level.location : ""}</p>
            <h2 class="history-intro__title">${level.title}</h2>
            <p class="history-intro__text">${level.scenario}</p>
            <button type="button" id="campaign-start">${config.introButton}</button>
          </div>
        </div>
      </div>
    `;

    const nodes = {
      canvas: root.querySelector("#campaign-canvas"),
      hud: root.querySelector("#campaign-hud"),
      progress: root.querySelector("#campaign-progress"),
      integrity: root.querySelector("#campaign-integrity"),
      warning: root.querySelector("#campaign-warning"),
      caption: root.querySelector("#campaign-caption"),
      hint: root.querySelector("#campaign-hint"),
      controls: root.querySelector("#campaign-controls"),
      intro: root.querySelector("#campaign-intro"),
      start: root.querySelector("#campaign-start"),
    };

    const stage = createCampaignStage(nodes.canvas, config);
    let progress = 0;
    let hits = 0;
    let finished = false;
    let active = false;
    let awaitingDodge = null;
    let dodgeTimeout = null;
    let hazardTimeout = null;
    const shownBeats = new Set();

    function startMission() {
      nodes.intro.remove();
      nodes.hud.hidden = false;
      nodes.controls.hidden = false;
      active = true;
      stage.setActive(true);
      updateHud();
      showHint("空格键前进，方向警示出现时按对应方向；也可以使用下方按钮");
      scheduleHazard();
      window.addEventListener("keydown", onKeyDown);
    }

    function updateHud() {
      nodes.progress.style.width = `${progress}%`;
      nodes.integrity.textContent = `${config.integrityLabel} ${"●".repeat(config.hitLimit - hits)}${"○".repeat(hits)}`;
      stage.setProgress(progress);

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

    function advance() {
      if (!active || finished) return;
      progress = Math.min(100, progress + config.advanceStep);
      stage.step();
      updateHud();
      if (progress >= 100) winMission();
    }

    function scheduleHazard() {
      clearTimeout(hazardTimeout);
      if (!active || finished) return;
      const gap = config.minHazardGapMs + Math.random() * (config.maxHazardGapMs - config.minHazardGapMs);
      hazardTimeout = setTimeout(fireHazard, gap);
    }

    function fireHazard() {
      if (!active || finished) return;
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
      if (!active || finished || !awaitingDodge) return;
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
        shownBeats.clear();
        stage.reset();
        updateHud();
        showHint("重新组织队形：空格键前进，方向警示出现时及时闪避");
        scheduleHazard();
      }, 2500);
    }

    function winMission() {
      finished = true;
      active = false;
      clearTimeout(hazardTimeout);
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
  camera.position.set(0, 3.2, 7.4);
  camera.lookAt(0, 0.7, -4.2);

  const objects = {
    animated: [],
    threats: {},
    progress: 0,
  };

  config.build(scene, objects);

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

    const progressOffset = objects.progress / 100;
    camera.position.z = THREE.MathUtils.lerp(7.5, 5.9, progressOffset);
    camera.position.x = Math.sin(elapsed * 0.65) * 0.04 + (Math.random() - 0.5) * shake;
    camera.position.y = 3.2 + Math.sin(elapsed * 0.9) * 0.025 + Math.random() * shake * 0.35;
    camera.lookAt(0, 0.65, THREE.MathUtils.lerp(-3.6, -6.6, progressOffset));
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
        objects.column.position.z = THREE.MathUtils.lerp(2.35, -7.55, t);
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
          object.material.forEach((material) => material.dispose());
        } else if (object.material) {
          object.material.dispose();
        }
      });
      renderer.dispose();
    },
  };
}

function buildRuijinScene(scene, objects) {
  scene.background = new THREE.Color(0x15191d);
  scene.fog = new THREE.Fog(0x15191d, 8, 28);

  scene.add(new THREE.HemisphereLight(0x2f5f7f, 0x17100b, 1.5));
  const moon = new THREE.DirectionalLight(0xc8ddff, 1.8);
  moon.position.set(-4, 7, 5);
  moon.castShadow = true;
  scene.add(moon);

  const ground = makePlane(32, 36, 0x27251d, 0.9);
  ground.position.set(0, -0.03, -8);
  ground.receiveShadow = true;
  scene.add(ground);

  const road = makePlane(3.2, 34, 0x5b4931, 1);
  road.position.set(0, 0.002, -8);
  road.receiveShadow = true;
  scene.add(road);

  const lineMaterial = new THREE.MeshStandardMaterial({ color: 0x7b6746, roughness: 0.95 });
  for (let i = 0; i < 22; i += 1) {
    const stone = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.035, 0.42), lineMaterial);
    stone.position.set(i % 2 === 0 ? -1.55 : 1.55, 0.035, 5 - i * 1.35);
    stone.castShadow = true;
    scene.add(stone);
  }

  for (let i = 0; i < 18; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const hill = new THREE.Mesh(
      new THREE.ConeGeometry(1.3 + (i % 4) * 0.35, 1.2 + (i % 3) * 0.45, 5),
      new THREE.MeshStandardMaterial({ color: i % 3 === 0 ? 0x233023 : 0x303225, roughness: 0.9 })
    );
    hill.position.set(side * (4.2 + (i % 5) * 0.75), 0.45, 4.4 - i * 1.55);
    hill.rotation.y = i * 0.7;
    hill.castShadow = true;
    scene.add(hill);
  }

  objects.searchlights = [
    createSearchlight(-4.2, -2.8, 0.55),
    createSearchlight(4.35, -5.8, -0.35),
  ];
  objects.searchlights.forEach((light) => scene.add(light));

  const torches = [];
  for (let i = 0; i < 8; i += 1) {
    const torch = createTorch(i % 2 === 0 ? -1.25 : 1.25, 1.6 - i * 2.2);
    torches.push(torch);
    scene.add(torch);
  }
  objects.torches = torches;

  objects.column = createMarchColumn();
  objects.column.position.set(0, 0, 2.35);
  scene.add(objects.column);

  objects.goal = createRiverGate("于都河");
  objects.goal.position.set(0, 0.03, -8.2);
  scene.add(objects.goal);
  objects.goalFlag = objects.goal.getObjectByName("goalFlag");
  objects.goalFlag.visible = false;

  objects.threats.left = createGroundWarning(-1.25, 0xf2c94c);
  objects.threats.right = createGroundWarning(1.25, 0xf2c94c);
  Object.values(objects.threats).forEach((threat) => scene.add(threat));

  objects.bursts = {
    left: createBurst(0xf2c94c),
    right: createBurst(0xf2c94c),
    center: createBurst(0xf2c94c),
  };
  objects.bursts.left.position.x = -1.2;
  objects.bursts.right.position.x = 1.2;
  Object.values(objects.bursts).forEach((burst) => {
    burst.position.z = -1.7;
    scene.add(burst);
  });
}

function animateRuijinScene(objects, elapsed, active) {
  if (objects.column) {
    objects.column.children.forEach((child, index) => {
      child.position.y += Math.sin(elapsed * 4.2 + index) * 0.0007 * (active ? 1 : 0.35);
    });
  }

  objects.searchlights?.forEach((light, index) => {
    light.rotation.y = Math.sin(elapsed * 0.75 + index * 1.7) * 0.38 + light.userData.baseRotation;
    const beam = light.getObjectByName("beam");
    if (beam) beam.material.opacity = 0.18 + Math.sin(elapsed * 2.4 + index) * 0.04;
  });

  objects.torches?.forEach((torch, index) => {
    const flame = torch.getObjectByName("flame");
    if (flame) flame.scale.setScalar(0.8 + Math.sin(elapsed * 6 + index) * 0.12);
  });

  animateBursts(objects, elapsed);
}

function buildXiangjiangScene(scene, objects) {
  scene.background = new THREE.Color(0x2d342f);
  scene.fog = new THREE.Fog(0x2d342f, 9, 30);

  scene.add(new THREE.HemisphereLight(0x8aa8af, 0x2b1e15, 1.35));
  const sun = new THREE.DirectionalLight(0xffd7a0, 1.8);
  sun.position.set(-3, 5, 4);
  sun.castShadow = true;
  scene.add(sun);

  const nearBank = makePlane(24, 10, 0x5a4a2d, 1);
  nearBank.position.set(0, -0.04, 3.8);
  nearBank.receiveShadow = true;
  scene.add(nearBank);

  const farBank = makePlane(24, 12, 0x4d5131, 1);
  farBank.position.set(0, -0.04, -9.2);
  farBank.receiveShadow = true;
  scene.add(farBank);

  const river = makePlane(24, 12.8, 0x244f62, 0.86, true);
  river.position.set(0, -0.02, -3.5);
  river.receiveShadow = true;
  scene.add(river);
  objects.river = river;

  const plankMaterial = new THREE.MeshStandardMaterial({ color: 0x6d5136, roughness: 0.72, metalness: 0.02 });
  for (let i = 0; i < 24; i += 1) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.08, 0.18), plankMaterial);
    plank.position.set(i % 2 === 0 ? -0.08 : 0.08, 0.05, 2.2 - i * 0.42);
    plank.rotation.y = (i % 3 - 1) * 0.05;
    plank.castShadow = true;
    plank.receiveShadow = true;
    scene.add(plank);
  }

  for (let i = 0; i < 14; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const ridge = new THREE.Mesh(
      new THREE.ConeGeometry(1.1 + (i % 4) * 0.35, 1.6 + (i % 3) * 0.45, 6),
      new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0x3d4128 : 0x463829, roughness: 0.9 })
    );
    ridge.position.set(side * (4.8 + (i % 4) * 0.8), 0.55, 3.8 - i * 1.1);
    ridge.castShadow = true;
    scene.add(ridge);
  }

  objects.column = createRiverColumn();
  objects.column.position.set(0, 0, 2.35);
  scene.add(objects.column);

  objects.goal = createRiverGate("西岸");
  objects.goal.position.set(0, 0.03, -8.15);
  scene.add(objects.goal);
  objects.goalFlag = objects.goal.getObjectByName("goalFlag");
  objects.goalFlag.visible = false;

  objects.threats.left = createGroundWarning(-1.35, 0xff5a3c);
  objects.threats.right = createGroundWarning(1.35, 0xff5a3c);
  Object.values(objects.threats).forEach((threat) => scene.add(threat));

  objects.bursts = {
    left: createBurst(0xff7147),
    right: createBurst(0xff7147),
    center: createBurst(0xff7147),
  };
  objects.bursts.left.position.x = -1.25;
  objects.bursts.right.position.x = 1.25;
  Object.values(objects.bursts).forEach((burst) => {
    burst.position.z = -2.3;
    scene.add(burst);
  });

  objects.tracers = [];
  const tracerMaterial = new THREE.MeshBasicMaterial({ color: 0xffd49b });
  for (let i = 0; i < 8; i += 1) {
    const tracer = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 1.3), tracerMaterial);
    tracer.position.set(i % 2 === 0 ? -5.2 : 5.2, 1.05 + (i % 3) * 0.25, -6 + i * 1.1);
    tracer.rotation.y = i % 2 === 0 ? -1.05 : 1.05;
    scene.add(tracer);
    objects.tracers.push(tracer);
  }
}

function animateXiangjiangScene(objects, elapsed, active) {
  if (objects.river) {
    objects.river.material.opacity = 0.76 + Math.sin(elapsed * 1.8) * 0.07;
  }

  if (objects.column) {
    objects.column.position.y = Math.sin(elapsed * 2.5) * 0.045 * (active ? 1 : 0.35);
    objects.column.rotation.x = Math.sin(elapsed * 2.2) * 0.015;
  }

  objects.tracers?.forEach((tracer, index) => {
    tracer.position.x += (index % 2 === 0 ? 1 : -1) * 0.025;
    if (Math.abs(tracer.position.x) < 0.8) {
      tracer.position.x = index % 2 === 0 ? -5.2 : 5.2;
      tracer.position.z = -6 + ((elapsed + index) % 6);
    }
  });

  animateBursts(objects, elapsed);
}

function createMarchColumn() {
  const group = new THREE.Group();
  const positions = [
    [-0.55, 0],
    [0.1, -0.38],
    [0.62, -0.76],
    [-0.25, -1.12],
    [0.48, -1.5],
    [-0.62, -1.88],
    [0, -2.24],
    [0.58, -2.6],
    [-0.36, -2.96],
  ];
  positions.forEach(([x, z], index) => {
    const soldier = createSoldier(index === 0 ? 1.06 : 0.92);
    soldier.position.set(x, 0.08, z);
    group.add(soldier);
  });

  const cartMaterial = new THREE.MeshStandardMaterial({ color: 0x6d5136, roughness: 0.8 });
  const cart = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.34, 0.72), cartMaterial);
  cart.position.set(-0.08, 0.25, -3.32);
  cart.castShadow = true;
  group.add(cart);

  const flag = createFlag();
  flag.position.set(0.45, 0.15, -0.16);
  group.add(flag);
  return group;
}

function createRiverColumn() {
  const group = new THREE.Group();
  const raftMaterial = new THREE.MeshStandardMaterial({ color: 0x4f3928, roughness: 0.78 });
  const raft = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.18, 1.35), raftMaterial);
  raft.position.set(0, 0.18, -0.4);
  raft.castShadow = true;
  raft.receiveShadow = true;
  group.add(raft);

  const positions = [
    [-0.72, 0.08],
    [-0.22, -0.18],
    [0.3, 0.14],
    [0.78, -0.2],
    [-0.52, -0.62],
    [0.04, -0.72],
    [0.58, -0.62],
  ];
  positions.forEach(([x, z], index) => {
    const soldier = createSoldier(index === 0 ? 1 : 0.86);
    soldier.position.set(x, 0.27, z);
    group.add(soldier);
  });

  const flag = createFlag();
  flag.position.set(0.78, 0.3, 0.3);
  group.add(flag);
  return group;
}

function createSoldier(scale = 1) {
  const group = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x9c231b, roughness: 0.72 });
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0xd3a06e, roughness: 0.7 });
  const packMaterial = new THREE.MeshStandardMaterial({ color: 0x51432f, roughness: 0.8 });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.11 * scale, 0.14 * scale, 0.46 * scale, 12), bodyMaterial);
  body.position.y = 0.36 * scale;
  body.castShadow = true;
  group.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12 * scale, 14, 10), headMaterial);
  head.position.y = 0.66 * scale;
  head.castShadow = true;
  group.add(head);

  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.2 * scale, 0.28 * scale, 0.08 * scale), packMaterial);
  pack.position.set(0, 0.37 * scale, 0.13 * scale);
  pack.castShadow = true;
  group.add(pack);

  return group;
}

function createFlag() {
  const group = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 0.9, 8),
    new THREE.MeshStandardMaterial({ color: 0x4d3324, roughness: 0.6 })
  );
  pole.position.y = 0.65;
  pole.castShadow = true;
  group.add(pole);

  const flag = new THREE.Mesh(
    new THREE.PlaneGeometry(0.48, 0.28),
    new THREE.MeshStandardMaterial({ color: 0xb62820, roughness: 0.6, side: THREE.DoubleSide })
  );
  flag.position.set(0.24, 0.93, 0);
  flag.rotation.y = -0.08;
  flag.castShadow = true;
  group.add(flag);
  return group;
}

function createRiverGate(label) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: 0x7a5b36, roughness: 0.74 });
  [-1.2, 1.2].forEach((x) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.25, 10), material);
    post.position.set(x, 0.62, 0);
    post.castShadow = true;
    group.add(post);
  });
  const beam = new THREE.Mesh(new THREE.BoxGeometry(2.75, 0.12, 0.12), material);
  beam.position.set(0, 1.22, 0);
  beam.castShadow = true;
  group.add(beam);

  const flag = createFlag();
  flag.name = "goalFlag";
  flag.position.set(0.1, 0.58, 0);
  group.add(flag);

  const plaque = makeTextPlaque(label);
  plaque.position.set(0, 0.82, -0.03);
  group.add(plaque);
  return group;
}

function makeTextPlaque(label) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ede4cd";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#6f1712";
  ctx.font = "bold 42px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
  return new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.42), material);
}

function createSearchlight(x, z, baseRotation) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.userData.baseRotation = baseRotation;

  const towerMaterial = new THREE.MeshStandardMaterial({ color: 0x30271f, roughness: 0.75 });
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 1.4, 8), towerMaterial);
  tower.position.y = 0.7;
  tower.castShadow = true;
  group.add(tower);

  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 16, 10),
    new THREE.MeshBasicMaterial({ color: 0xf2c94c })
  );
  lamp.position.y = 1.45;
  group.add(lamp);

  const beam = new THREE.Mesh(
    new THREE.ConeGeometry(1.45, 7, 28, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xf2c94c, transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide })
  );
  beam.name = "beam";
  beam.position.set(0, 1.45, -3.3);
  beam.rotation.x = Math.PI / 2;
  group.add(beam);

  return group;
}

function createTorch(x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.58, 8),
    new THREE.MeshStandardMaterial({ color: 0x3b2a1d, roughness: 0.7 })
  );
  pole.position.y = 0.29;
  group.add(pole);

  const flame = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xffb84d })
  );
  flame.name = "flame";
  flame.position.y = 0.62;
  group.add(flame);
  return group;
}

function createGroundWarning(x, color) {
  const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.36, side: THREE.DoubleSide, depthWrite: false });
  const warning = new THREE.Mesh(new THREE.CircleGeometry(0.78, 32), material);
  warning.rotation.x = -Math.PI / 2;
  warning.position.set(x, 0.065, -1.6);
  warning.visible = false;
  return warning;
}

function createBurst(color) {
  const group = new THREE.Group();
  group.visible = false;
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 18, 12),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.72 })
  );
  core.name = "core";
  core.position.y = 0.33;
  group.add(core);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.025, 8, 32),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.58 })
  );
  ring.name = "ring";
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.12;
  group.add(ring);
  return group;
}

function animateBursts(objects, elapsed) {
  Object.values(objects.bursts || {}).forEach((burst) => {
    if (!burst.visible) return;
    const age = elapsed - (burst.userData.startedAt || 0);
    const scale = 1 + age * 2.4;
    burst.scale.setScalar(scale);
    burst.children.forEach((child) => {
      if (child.material) child.material.opacity = Math.max(0, 0.72 - age * 0.95);
    });
    if (age > 0.85) {
      burst.visible = false;
      burst.scale.setScalar(1);
    }
  });
}

function makePlane(width, height, color, opacity = 1, transparent = false) {
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.9,
    metalness: 0.02,
    opacity,
    transparent,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}
