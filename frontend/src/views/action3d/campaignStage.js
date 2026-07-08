import * as THREE from "three";

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
      inventory: root.querySelector("#campaign-inventory"),
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
    const collectibles = config.collectibles || [];
    const collectedArtifacts = new Set();

    function startMission() {
      nodes.intro.remove();
      nodes.hud.hidden = false;
      nodes.controls.hidden = false;
      active = true;
      stage.setActive(true);
      updateHud();
      showHint("沿路收齐物品后再冲向终点；方向警示出现时及时闪避");
      scheduleHazard();
      window.addEventListener("keydown", onKeyDown);
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

    function collectDueArtifacts() {
      collectibles.forEach((item) => {
        if (progress < item.at || collectedArtifacts.has(item.id)) return;
        collectedArtifacts.add(item.id);
        stage.collectItem(item.id);
        showCaption(`拾取：${item.name}`, "collect", 1600);
      });
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
      if (!active || finished) return;
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
  camera.position.set(0, 1.08, 2.35);
  camera.lookAt(0, 0.84, -1.85);
  scene.add(camera);

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

function createFirstPersonRig() {
  const group = new THREE.Group();
  group.position.set(0, -0.43, -0.75);
  const robeMaterial = new THREE.MeshStandardMaterial({ color: 0x5b1718, roughness: 0.8 });
  const armorMaterial = new THREE.MeshStandardMaterial({ color: 0x15191d, metalness: 0.36, roughness: 0.44 });
  const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xd6a27a, roughness: 0.68 });
  const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xc8a04c, metalness: 0.58, roughness: 0.32 });

  [-1, 1].forEach((side) => {
    const upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.44), armorMaterial);
    upperArm.position.set(side * 0.34, -0.04, -0.16);
    upperArm.rotation.set(0.2, side * 0.2, side * 0.2);
    group.add(upperArm);

    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.5, 10), robeMaterial);
    sleeve.position.set(side * 0.24, -0.18, -0.45);
    sleeve.rotation.set(1.12, side * 0.22, side * 0.32);
    group.add(sleeve);

    const bracer = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.075, 0.28, 10), armorMaterial);
    bracer.position.set(side * 0.18, -0.26, -0.74);
    bracer.rotation.set(1.16, side * 0.18, side * 0.2);
    group.add(bracer);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 10), skinMaterial);
    hand.scale.set(1, 0.68, 1.25);
    hand.position.set(side * 0.13, -0.31, -0.94);
    hand.rotation.z = side * 0.2;
    group.add(hand);

    for (let i = 0; i < 3; i += 1) {
      const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), goldMaterial);
      rivet.position.set(side * (0.17 + i * 0.018), -0.23 + i * 0.025, -0.65);
      group.add(rivet);
    }
  });

  return group;
}

function createCollectibleArtifacts(items) {
  return items.map(createCollectibleArtifact);
}

function createCollectibleArtifact(item) {
  const group = new THREE.Group();
  const artifactZ = THREE.MathUtils.lerp(0.9, -6.55, item.at / 100);
  const x = item.x ?? 0;
  group.position.set(x, 0.34, artifactZ);
  group.userData = {
    id: item.id,
    baseY: group.position.y,
    collected: false,
  };

  const glow = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.018, 8, 36),
    new THREE.MeshBasicMaterial({ color: 0xf2c94c, transparent: true, opacity: 0.55, depthWrite: false })
  );
  glow.rotation.x = Math.PI / 2;
  glow.position.y = -0.25;
  group.add(glow);

  if (item.kind === "letter") {
    group.add(createLetterArtifact());
  } else if (item.kind === "map") {
    group.add(createMapArtifact());
  } else if (item.kind === "medical") {
    group.add(createMedicalArtifact());
  } else {
    group.add(createBackpackArtifact());
  }

  const label = makeArtifactLabel(item.name);
  label.position.set(0, 0.44, 0);
  group.add(label);
  return group;
}

function createBackpackArtifact() {
  const group = new THREE.Group();
  const cloth = new THREE.MeshStandardMaterial({ color: 0x6d5136, roughness: 0.78 });
  const strap = new THREE.MeshStandardMaterial({ color: 0x2f241b, roughness: 0.82 });
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.42, 0.22), cloth);
  pack.castShadow = true;
  group.add(pack);

  [-0.1, 0.1].forEach((x) => {
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.46, 0.245), strap);
    belt.position.x = x;
    belt.castShadow = true;
    group.add(belt);
  });

  const flap = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.25), cloth);
  flap.position.y = 0.17;
  flap.castShadow = true;
  group.add(flap);
  return group;
}

function createLetterArtifact() {
  const group = new THREE.Group();
  const paper = new THREE.MeshStandardMaterial({ color: 0xe8ddc2, roughness: 0.72, side: THREE.DoubleSide });
  const sealMaterial = new THREE.MeshBasicMaterial({ color: 0x9c231b });
  const letter = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.3), paper);
  letter.rotation.x = -0.25;
  letter.castShadow = true;
  group.add(letter);

  const fold = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.02), new THREE.MeshBasicMaterial({ color: 0xb9a986, side: THREE.DoubleSide }));
  fold.position.z = 0.006;
  fold.rotation.z = -0.6;
  group.add(fold);

  const seal = new THREE.Mesh(new THREE.CircleGeometry(0.045, 18), sealMaterial);
  seal.position.set(0.08, -0.02, 0.012);
  group.add(seal);
  return group;
}

function createMapArtifact() {
  const group = new THREE.Group();
  const mapMaterial = new THREE.MeshStandardMaterial({ color: 0xddcfa9, roughness: 0.72, side: THREE.DoubleSide });
  const lineMaterial = new THREE.MeshBasicMaterial({ color: 0x9c231b, side: THREE.DoubleSide });
  const map = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.34), mapMaterial);
  map.rotation.x = -0.22;
  group.add(map);

  for (let i = 0; i < 3; i += 1) {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.28 - i * 0.04, 0.018), lineMaterial);
    line.position.set(-0.04 + i * 0.05, 0.08 - i * 0.08, 0.012);
    line.rotation.z = 0.35 - i * 0.4;
    group.add(line);
  }
  return group;
}

function createMedicalArtifact() {
  const group = new THREE.Group();
  const bagMaterial = new THREE.MeshStandardMaterial({ color: 0xd8d3c2, roughness: 0.72 });
  const crossMaterial = new THREE.MeshBasicMaterial({ color: 0x9c231b });
  const bag = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.3, 0.22), bagMaterial);
  bag.castShadow = true;
  group.add(bag);

  const crossA = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.045, 0.235), crossMaterial);
  const crossB = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.22, 0.235), crossMaterial);
  [crossA, crossB].forEach((part) => {
    part.position.z = -0.002;
    group.add(part);
  });
  return group;
}

function makeArtifactLabel(label) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 80;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(42, 36, 32, 0.78)";
  ctx.fillRect(18, 15, 220, 46);
  ctx.fillStyle = "#ede4cd";
  ctx.font = "bold 30px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, canvas.width / 2, 39);
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
  return new THREE.Mesh(new THREE.PlaneGeometry(1.12, 0.35), material);
}

function animateCollectibles(objects, elapsed) {
  objects.collectibles?.forEach((item, index) => {
    if (!item.visible || item.userData.collected) return;
    item.position.y = item.userData.baseY + Math.sin(elapsed * 2.2 + index) * 0.05;
    item.rotation.y += 0.012;
    const glow = item.children[0];
    if (glow?.material) glow.material.opacity = 0.42 + Math.sin(elapsed * 3.4 + index) * 0.12;
  });
}

export function createMarchColumn() {
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

export function createRiverColumn() {
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
  const robeMaterial = new THREE.MeshStandardMaterial({ color: 0x5f1717, roughness: 0.78 });
  const robeDarkMaterial = new THREE.MeshStandardMaterial({ color: 0x351014, roughness: 0.82 });
  const armorMaterial = new THREE.MeshStandardMaterial({ color: 0x171b1f, metalness: 0.38, roughness: 0.42 });
  const helmetMaterial = new THREE.MeshStandardMaterial({ color: 0x262a2d, metalness: 0.48, roughness: 0.36 });
  const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xc9a14c, metalness: 0.72, roughness: 0.28 });
  const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xd6a27a, roughness: 0.66 });
  const plumeMaterial = new THREE.MeshStandardMaterial({ color: 0xaa2c25, roughness: 0.62 });

  function addMesh(mesh, position, rotation = null) {
    mesh.position.set(position[0] * scale, position[1] * scale, position[2] * scale);
    if (rotation) mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
    mesh.castShadow = true;
    group.add(mesh);
    return mesh;
  }

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.13 * scale, 0.17 * scale, 0.43 * scale, 14), robeMaterial);
  addMesh(torso, [0, 0.42, 0]);

  const frontSkirt = new THREE.Mesh(new THREE.BoxGeometry(0.3 * scale, 0.38 * scale, 0.035 * scale), robeMaterial);
  addMesh(frontSkirt, [0, 0.16, -0.04]);

  const splitPanelMaterial = new THREE.MeshStandardMaterial({ color: 0x4b1317, roughness: 0.82 });
  [-0.09, 0.09].forEach((x) => {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.12 * scale, 0.42 * scale, 0.045 * scale), splitPanelMaterial);
    addMesh(panel, [x, 0.12, -0.07]);
  });

  const trim = new THREE.Mesh(new THREE.BoxGeometry(0.34 * scale, 0.045 * scale, 0.055 * scale), armorMaterial);
  addMesh(trim, [0, -0.09, -0.07]);

  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.37 * scale, 0.055 * scale, 0.08 * scale), armorMaterial);
  addMesh(belt, [0, 0.28, -0.02]);

  [-0.07, 0.07].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025 * scale, 0.03 * scale, 0.26 * scale, 8), armorMaterial);
    addMesh(leg, [x, -0.15, 0]);
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.07 * scale, 0.035 * scale, 0.12 * scale), armorMaterial);
    addMesh(boot, [x, -0.29, -0.035]);
  });

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.105 * scale, 16, 10), skinMaterial);
  addMesh(head, [0, 0.69, -0.015]);

  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.128 * scale, 16, 8), helmetMaterial);
  helmet.scale.y = 0.62;
  addMesh(helmet, [0, 0.77, -0.005]);

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.2 * scale, 0.035 * scale, 0.028 * scale), armorMaterial);
  addMesh(visor, [0, 0.735, -0.115]);

  [-0.095, 0.095].forEach((x) => {
    const cheekGuard = new THREE.Mesh(new THREE.BoxGeometry(0.04 * scale, 0.14 * scale, 0.035 * scale), helmetMaterial);
    addMesh(cheekGuard, [x, 0.655, -0.045], [0, 0, x < 0 ? -0.18 : 0.18]);
  });

  const neckGuard = new THREE.Mesh(new THREE.BoxGeometry(0.22 * scale, 0.16 * scale, 0.045 * scale), robeDarkMaterial);
  addMesh(neckGuard, [0, 0.62, 0.085]);

  const plumeBase = new THREE.Mesh(new THREE.CylinderGeometry(0.014 * scale, 0.014 * scale, 0.08 * scale, 8), goldMaterial);
  addMesh(plumeBase, [0, 0.88, 0]);

  const plume = new THREE.Mesh(new THREE.CylinderGeometry(0.012 * scale, 0.018 * scale, 0.24 * scale, 8), plumeMaterial);
  addMesh(plume, [0, 1.02, 0]);

  const plumeTip = new THREE.Mesh(new THREE.ConeGeometry(0.027 * scale, 0.09 * scale, 8), armorMaterial);
  addMesh(plumeTip, [0, 1.185, 0]);

  [-1, 1].forEach((side) => {
    const shoulder = new THREE.Mesh(new THREE.BoxGeometry(0.15 * scale, 0.07 * scale, 0.12 * scale), armorMaterial);
    addMesh(shoulder, [side * 0.18, 0.58, -0.01], [0, 0, side * 0.18]);

    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.035 * scale, 0.04 * scale, 0.34 * scale, 8), armorMaterial);
    addMesh(upperArm, [side * 0.255, 0.43, -0.01], [0, 0, side * 0.66]);

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.028 * scale, 0.032 * scale, 0.28 * scale, 8), armorMaterial);
    addMesh(forearm, [side * 0.36, 0.29, -0.02], [0, 0, side * 0.78]);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.038 * scale, 10, 8), skinMaterial);
    addMesh(hand, [side * 0.46, 0.19, -0.03]);

    for (let i = 0; i < 4; i += 1) {
      const stud = new THREE.Mesh(new THREE.SphereGeometry(0.012 * scale, 8, 6), goldMaterial);
      addMesh(stud, [side * (0.22 + i * 0.055), 0.53 - i * 0.075, -0.082]);
    }
  });

  const chestMirror = new THREE.Mesh(new THREE.CylinderGeometry(0.073 * scale, 0.073 * scale, 0.024 * scale, 24), goldMaterial);
  addMesh(chestMirror, [0, 0.49, -0.148], [Math.PI / 2, 0, 0]);

  const mirrorBoss = new THREE.Mesh(new THREE.SphereGeometry(0.028 * scale, 12, 8), goldMaterial);
  addMesh(mirrorBoss, [0, 0.49, -0.163]);

  const rivetGeometry = new THREE.SphereGeometry(0.011 * scale, 8, 6);
  const rivetRows = [
    [-0.07, 0, 0.07],
    [-0.085, -0.03, 0.03, 0.085],
    [-0.07, 0, 0.07],
    [-0.085, -0.03, 0.03, 0.085],
  ];
  rivetRows.forEach((xs, row) => {
    xs.forEach((x) => {
      const rivet = new THREE.Mesh(rivetGeometry, goldMaterial);
      addMesh(rivet, [x, 0.56 - row * 0.075, -0.145]);
    });
  });

  [-0.11, -0.045, 0.045, 0.11].forEach((x, index) => {
    const fringeMaterial = index % 2 === 0 ? robeDarkMaterial : robeMaterial;
    const fringe = new THREE.Mesh(new THREE.BoxGeometry(0.04 * scale, 0.13 * scale, 0.035 * scale), fringeMaterial);
    addMesh(fringe, [x, -0.19, -0.075]);
  });

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

export function createRiverGate(label) {
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

export function createSearchlight(x, z, baseRotation) {
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

export function createTorch(x, z) {
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

export function createGroundWarning(x, color) {
  const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.36, side: THREE.DoubleSide, depthWrite: false });
  const warning = new THREE.Mesh(new THREE.CircleGeometry(0.78, 32), material);
  warning.rotation.x = -Math.PI / 2;
  warning.position.set(x, 0.065, -1.6);
  warning.visible = false;
  return warning;
}

export function createBurst(color) {
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

export function animateBursts(objects, elapsed) {
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

export function makePlane(width, height, color, opacity = 1, transparent = false) {
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
