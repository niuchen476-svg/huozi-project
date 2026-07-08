import * as THREE from "three";
import {
  animateBursts,
  createBurst,
  createGroundWarning,
  createMarchColumn,
  createRiverGate,
  createSearchlight,
  createTorch,
  makePlane,
  renderCampaignAction3d,
} from "./campaignStage.js";

const SIDE_LABEL = {
  left: "左",
  right: "右",
};

const RUIJIN_MISSION = {
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
  collectibles: [
    { id: "ruijin-pack", name: "行军背包", kind: "backpack", at: 22, x: -0.68 },
    { id: "ruijin-letter", name: "家书", kind: "letter", at: 52, x: 0.58 },
    { id: "ruijin-map", name: "苏区地图", kind: "map", at: 82, x: -0.35 },
  ],
  advanceStep: 6,
  hitLimit: 3,
  dodgeWindowMs: 980,
  minHazardGapMs: 1450,
  maxHazardGapMs: 2450,
  build: buildRuijinScene,
  animate: animateRuijinScene,
};

export function renderRuijinDepartureAction3d(root, level) {
  return renderCampaignAction3d(root, level, RUIJIN_MISSION);
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
