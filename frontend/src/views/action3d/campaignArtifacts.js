import * as THREE from "three";

export function createFirstPersonRig() {
  const group = new THREE.Group();
  group.position.set(0, -0.43, -0.75);
  const robeMaterial = new THREE.MeshStandardMaterial({ color: 0x5b1718, roughness: 0.8 });
  const armorMaterial = new THREE.MeshStandardMaterial({ color: 0x15191d, metalness: 0.36, roughness: 0.44 });
  const scaleMaterial = new THREE.MeshStandardMaterial({ color: 0x22282b, metalness: 0.5, roughness: 0.34 });
  const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xd6a27a, roughness: 0.68 });
  const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xc8a04c, metalness: 0.58, roughness: 0.32 });
  const wrapMaterial = new THREE.MeshStandardMaterial({ color: 0x765d45, roughness: 0.82 });

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

    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        const scale = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.018, 0.055), scaleMaterial);
        scale.position.set(side * (0.19 + col * 0.025), -0.19 - row * 0.04, -0.61 - row * 0.025);
        scale.rotation.set(1.1, side * 0.1, side * 0.24);
        group.add(scale);
      }
    }

    for (let i = 0; i < 3; i += 1) {
      const wrap = new THREE.Mesh(new THREE.TorusGeometry(0.083 - i * 0.004, 0.006, 6, 18), wrapMaterial);
      wrap.position.set(side * 0.18, -0.21 - i * 0.045, -0.73 + i * 0.012);
      wrap.rotation.set(1.17, side * 0.18, side * 0.2);
      group.add(wrap);
    }

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

export function createCollectibleArtifacts(items) {
  return items.map(createCollectibleArtifact);
}

export function createCollectibleArtifact(item) {
  const group = new THREE.Group();
  const artifactZ = THREE.MathUtils.lerp(0.9, -6.55, item.at / 100);
  const x = item.x ?? 0;
  group.position.set(x, 0.34, artifactZ);
  group.userData = {
    id: item.id,
    baseY: group.position.y,
    collected: false,
    item,
  };

  const glow = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.018, 8, 36),
    new THREE.MeshBasicMaterial({ color: 0xf2c94c, transparent: true, opacity: 0.55, depthWrite: false })
  );
  glow.rotation.x = Math.PI / 2;
  glow.position.y = -0.25;
  group.add(glow);

  if (item.kind === "letter") {
    group.add(createLetterArtifact(item.letter));
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

export function createBackpackArtifact() {
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

export function createLetterArtifact(letterData) {
  const group = new THREE.Group();
  const paper = new THREE.MeshStandardMaterial({
    map: makeLetterTexture(letterData),
    color: 0xffffff,
    roughness: 0.72,
    side: THREE.DoubleSide,
  });
  const sealMaterial = new THREE.MeshBasicMaterial({ color: 0x9c231b });
  const letter = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.44), paper);
  letter.rotation.x = -0.25;
  letter.castShadow = true;
  group.add(letter);

  const fold = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.018), new THREE.MeshBasicMaterial({ color: 0xb9a986, side: THREE.DoubleSide }));
  fold.position.set(0, 0.04, 0.006);
  fold.rotation.z = -0.6;
  group.add(fold);

  const seal = new THREE.Mesh(new THREE.CircleGeometry(0.04, 18), sealMaterial);
  seal.position.set(0.19, -0.13, 0.012);
  group.add(seal);
  return group;
}

export function makeLetterTexture(letterData) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 360;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#eadfc3";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(124, 95, 57, 0.5)";
  ctx.lineWidth = 5;
  ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28);
  ctx.fillStyle = "rgba(102, 70, 38, 0.22)";
  ctx.fillRect(34, 58, canvas.width - 68, 2);
  ctx.fillRect(34, 126, canvas.width - 68, 2);
  ctx.fillRect(34, 194, canvas.width - 68, 2);
  ctx.fillStyle = "#5f2b1d";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 28px serif";
  ctx.fillText(letterData?.shortTitle || letterData?.title || "红军书信", canvas.width / 2, 42);
  ctx.font = "24px serif";
  const lines = letterData?.lines || [];
  const top = lines.length > 4 ? 94 : 112;
  const gap = lines.length > 4 ? 42 : 52;
  lines.forEach((line, index) => {
    ctx.fillText(line, canvas.width / 2, top + index * gap);
  });
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

export function createMapArtifact() {
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

export function createMedicalArtifact() {
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

export function makeArtifactLabel(label) {
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

export function animateCollectibles(objects, elapsed) {
  objects.collectibles?.forEach((item, index) => {
    if (!item.visible || item.userData.collected) return;
    item.position.y = item.userData.baseY + Math.sin(elapsed * 2.2 + index) * 0.05;
    item.rotation.y += 0.012;
    const glow = item.children[0];
    if (glow?.material) glow.material.opacity = 0.42 + Math.sin(elapsed * 3.4 + index) * 0.12;
  });
}

