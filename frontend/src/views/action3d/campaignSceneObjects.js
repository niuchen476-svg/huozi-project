import * as THREE from "three";

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

export function createSoldier(scale = 1) {
  const group = new THREE.Group();
  const robeMaterial = new THREE.MeshStandardMaterial({ color: 0x5f1717, roughness: 0.78 });
  const robeDarkMaterial = new THREE.MeshStandardMaterial({ color: 0x351014, roughness: 0.82 });
  const armorMaterial = new THREE.MeshStandardMaterial({ color: 0x171b1f, metalness: 0.38, roughness: 0.42 });
  const helmetMaterial = new THREE.MeshStandardMaterial({ color: 0x262a2d, metalness: 0.48, roughness: 0.36 });
  const scaleMaterial = new THREE.MeshStandardMaterial({ color: 0x23282b, metalness: 0.52, roughness: 0.32 });
  const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xc9a14c, metalness: 0.72, roughness: 0.28 });
  const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xd6a27a, roughness: 0.66 });
  const plumeMaterial = new THREE.MeshStandardMaterial({ color: 0xaa2c25, roughness: 0.62 });
  const leatherMaterial = new THREE.MeshStandardMaterial({ color: 0x4b3020, roughness: 0.78 });
  const canvasMaterial = new THREE.MeshStandardMaterial({ color: 0x6d5b3b, roughness: 0.86 });
  const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x17110d });

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

  const beltBuckle = new THREE.Mesh(new THREE.BoxGeometry(0.06 * scale, 0.04 * scale, 0.018 * scale), goldMaterial);
  addMesh(beltBuckle, [0, 0.28, -0.072]);

  for (let row = 0; row < 4; row += 1) {
    const cols = row % 2 === 0 ? 4 : 5;
    for (let col = 0; col < cols; col += 1) {
      const x = (col - (cols - 1) / 2) * 0.055;
      const y = 0.57 - row * 0.07;
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.047 * scale, 0.052 * scale, 0.014 * scale), scaleMaterial);
      addMesh(plate, [x, y, -0.151], [0.05, 0, (col - (cols - 1) / 2) * 0.035]);
      const lowerLip = new THREE.Mesh(new THREE.BoxGeometry(0.043 * scale, 0.006 * scale, 0.018 * scale), goldMaterial);
      addMesh(lowerLip, [x, y - 0.024, -0.161]);
    }
  }

  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const x = (col - 1.5) * 0.058;
      const y = 0.53 - row * 0.065;
      const backPlate = new THREE.Mesh(new THREE.BoxGeometry(0.046 * scale, 0.05 * scale, 0.014 * scale), scaleMaterial);
      addMesh(backPlate, [x, y, 0.142], [-0.05, 0, (col - 1.5) * 0.028]);
      const backLip = new THREE.Mesh(new THREE.BoxGeometry(0.04 * scale, 0.006 * scale, 0.018 * scale), goldMaterial);
      addMesh(backLip, [x, y - 0.023, 0.153]);
    }
  }

  [-0.07, 0.07].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025 * scale, 0.03 * scale, 0.26 * scale, 8), armorMaterial);
    addMesh(leg, [x, -0.15, 0]);
    for (let i = 0; i < 3; i += 1) {
      const wrap = new THREE.Mesh(new THREE.TorusGeometry(0.033 * scale, 0.0045 * scale, 6, 16), leatherMaterial);
      addMesh(wrap, [x, -0.07 - i * 0.055, 0], [Math.PI / 2, 0, 0]);
    }
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.07 * scale, 0.035 * scale, 0.12 * scale), armorMaterial);
    addMesh(boot, [x, -0.29, -0.035]);
    const bootStrap = new THREE.Mesh(new THREE.BoxGeometry(0.075 * scale, 0.01 * scale, 0.125 * scale), leatherMaterial);
    addMesh(bootStrap, [x, -0.265, -0.035]);
  });

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.105 * scale, 16, 10), skinMaterial);
  addMesh(head, [0, 0.69, -0.015]);

  [-0.035, 0.035].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.009 * scale, 8, 6), eyeMaterial);
    addMesh(eye, [x, 0.705, -0.108]);
  });

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.013 * scale, 0.04 * scale, 8), skinMaterial);
  addMesh(nose, [0, 0.68, -0.125], [Math.PI / 2, 0, 0]);

  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.128 * scale, 16, 8), helmetMaterial);
  helmet.scale.y = 0.62;
  addMesh(helmet, [0, 0.77, -0.005]);

  const helmetBand = new THREE.Mesh(new THREE.TorusGeometry(0.118 * scale, 0.01 * scale, 8, 30), armorMaterial);
  helmetBand.scale.y = 0.38;
  addMesh(helmetBand, [0, 0.753, -0.006], [Math.PI / 2, 0, 0]);

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

    for (let i = 0; i < 3; i += 1) {
      const shoulderScale = new THREE.Mesh(new THREE.BoxGeometry(0.13 * scale, 0.028 * scale, 0.105 * scale), scaleMaterial);
      addMesh(shoulderScale, [side * 0.19, 0.55 - i * 0.03, -0.02], [0, side * 0.04, side * (0.22 + i * 0.05)]);
    }

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

  const bedroll = new THREE.Mesh(new THREE.CylinderGeometry(0.07 * scale, 0.07 * scale, 0.32 * scale, 12), canvasMaterial);
  addMesh(bedroll, [0, 0.45, 0.145], [0, 0, Math.PI / 2]);

  [-0.08, 0.08].forEach((x) => {
    const rollStrap = new THREE.Mesh(new THREE.TorusGeometry(0.071 * scale, 0.005 * scale, 6, 16), leatherMaterial);
    addMesh(rollStrap, [x, 0.45, 0.145], [0, Math.PI / 2, 0]);
  });

  [-1, 1].forEach((side) => {
    const shoulderStrap = new THREE.Mesh(new THREE.BoxGeometry(0.035 * scale, 0.42 * scale, 0.018 * scale), leatherMaterial);
    addMesh(shoulderStrap, [side * 0.105, 0.38, 0.155], [0, 0, side * 0.18]);
    for (let i = 0; i < 3; i += 1) {
      const strapRivet = new THREE.Mesh(new THREE.SphereGeometry(0.008 * scale, 8, 6), goldMaterial);
      addMesh(strapRivet, [side * 0.11, 0.49 - i * 0.09, 0.168]);
    }
  });

  const rifleStock = new THREE.Mesh(new THREE.BoxGeometry(0.035 * scale, 0.09 * scale, 0.12 * scale), leatherMaterial);
  addMesh(rifleStock, [-0.18, 0.34, 0.12], [0.18, 0.18, -0.55]);

  const rifleBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.008 * scale, 0.008 * scale, 0.64 * scale, 8), armorMaterial);
  addMesh(rifleBarrel, [-0.12, 0.56, 0.1], [0.62, 0.16, -0.58]);

  return group;
}

export function createFlag() {
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

export function makeTextPlaque(label) {
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
