import * as THREE from "three";
import {
  animateBursts,
  createBurst,
  createGroundWarning,
  createMarchColumn,
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
  progressLabel: "桥头距离",
  integrityLabel: "队形",
  introButton: "从草地出发",
  advanceLabel: "穿过草地",
  dodgeLine: "队伍压低身体，从弹坑旁绕了过去",
  failLine: "江滩火力过密，队伍撤回堤岸重新组织",
  winLines: ["湘江浮桥就在脚下，队伍刚好赶到桥头。", "收齐物品，跟上前队，开始过桥。"],
  hitLines: ["炮弹落在草坡边，队形被撕开一角", "桥头方向被火力压住，后队被迫停顿", "敌军火力压上来，渡口又少了一分余地"],
  warning: (side) => `炮火落向${SIDE_LABEL[side]}翼，按 ${side === "left" ? "←" : "→"} 闪避`,
  beats: [
    { at: 10, text: "你还在桥前草地上，湘江的水声在前方越来越近" },
    { at: 42, text: "有人架桥，有人阻击，有人把最后的时间留给主力" },
    { at: 76, text: "浮桥已经看得清楚，先把最后的物品收好" },
  ],
  collectibles: [
    { id: "xiangjiang-pack", name: "行军背包", kind: "backpack", at: 20, x: -0.62 },
    {
      id: "xiangjiang-letter",
      name: "红军儿子家书",
      kind: "letter",
      at: 48,
      x: 0.62,
      letter: {
        title: "红军儿子家书摘录",
        shortTitle: "红军家书",
        sourceName: "人民政协网《家书抵万金》",
        sourceUrl: "https://www.rmzxw.com.cn/c/2017-08-03/1698037.shtml",
        lines: ["父亲母亲：", "你们好！", "想念你们的心思", "时刻不曾间断", "红军儿子敬上"],
      },
    },
    { id: "xiangjiang-kit", name: "急救包", kind: "medical", at: 78, x: -0.28 },
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

  const grassland = makePlane(24, 20, 0x4f5a36, 1);
  grassland.position.set(0, -0.04, 0.2);
  grassland.receiveShadow = true;
  scene.add(grassland);

  const muddyTrack = makePlane(3.1, 18, 0x5a4a2d, 1);
  muddyTrack.position.set(0, -0.025, 0.1);
  muddyTrack.receiveShadow = true;
  scene.add(muddyTrack);

  const farBank = makePlane(24, 12, 0x4d5131, 1);
  farBank.position.set(0, -0.04, -13.8);
  farBank.receiveShadow = true;
  scene.add(farBank);

  const river = makePlane(24, 12.8, 0x244f62, 0.86, true);
  river.position.set(0, -0.02, -10.2);
  river.receiveShadow = true;
  scene.add(river);
  objects.river = river;

  const plankMaterial = new THREE.MeshStandardMaterial({ color: 0x6d5136, roughness: 0.72, metalness: 0.02 });
  for (let i = 0; i < 22; i += 1) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.08, 0.18), plankMaterial);
    plank.position.set(i % 2 === 0 ? -0.08 : 0.08, 0.05, -6.25 - i * 0.28);
    plank.rotation.y = (i % 3 - 1) * 0.05;
    plank.castShadow = true;
    plank.receiveShadow = true;
    scene.add(plank);
  }

  const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x65713f, roughness: 0.9 });
  for (let i = 0; i < 28; i += 1) {
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.12 + (i % 3) * 0.03, 0.42, 5), grassMaterial);
    tuft.position.set((i % 2 === 0 ? -1 : 1) * (1.65 + (i % 6) * 0.55), 0.16, 5.2 - i * 0.36);
    tuft.rotation.y = i * 0.7;
    scene.add(tuft);
  }

  for (let i = 0; i < 14; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const ridge = new THREE.Mesh(
      new THREE.ConeGeometry(1.1 + (i % 4) * 0.35, 1.6 + (i % 3) * 0.45, 6),
      new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0x3d4128 : 0x463829, roughness: 0.9 })
    );
    ridge.position.set(side * (4.8 + (i % 4) * 0.8), 0.55, 3.8 - i * 1.25);
    ridge.castShadow = true;
    scene.add(ridge);
  }

  objects.column = createMarchColumn();
  objects.column.position.set(0, 0, 2.35);
  scene.add(objects.column);

  objects.goal = createRiverGate("湘江浮桥");
  objects.goal.position.set(0, 0.03, -8.25);
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
