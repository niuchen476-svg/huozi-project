import * as THREE from "three";
import {
  animateBursts,
  createBurst,
  createGroundWarning,
  createRiverColumn,
  createRiverGate,
  makePlane,
  renderCampaignAction3d,
} from "./campaignStage.js";

const SIDE_LABEL = {
  left: "左",
  right: "右",
};

const XIANGJIANG_MISSION = {
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
  collectibles: [
    { id: "xiangjiang-pack", name: "行军背包", kind: "backpack", at: 24, x: -0.62 },
    { id: "xiangjiang-letter", name: "战地书信", kind: "letter", at: 52, x: 0.62 },
    { id: "xiangjiang-kit", name: "急救包", kind: "medical", at: 80, x: -0.28 },
  ],
  advanceStep: 5,
  hitLimit: 3,
  dodgeWindowMs: 860,
  minHazardGapMs: 1200,
  maxHazardGapMs: 2100,
  build: buildXiangjiangScene,
  animate: animateXiangjiangScene,
};

export function renderXiangjiangBattleAction3d(root, level) {
  return renderCampaignAction3d(root, level, XIANGJIANG_MISSION);
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
