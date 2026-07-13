export function createCampaignStage25d(nodes, config) {
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
