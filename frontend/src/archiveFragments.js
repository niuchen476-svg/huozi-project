import { collectArchiveFragment, getArchiveFragments } from "./state.js";

export const ARCHIVE_FRAGMENTS = [
  {
    id: "departure-map-fragment",
    levelId: "ruijin-departure",
    group: "瑞金出发碎片",
    name: "出发碎片",
    visual: "一角苏区地图和行军背包布片，带红色出发线。",
    rewardText: "你完成了关键物资取舍，让队伍在艰难出发前保住继续前进的力量。",
    mapHint: "地图上瑞金到湘江方向的路线被点亮，提示长征已经启程。",
    fact: "1934年10月，中央红军主力从瑞金、于都等地集结出发，开始战略转移。",
    effect: "ruijin-xiangjiang-route",
  },
  {
    id: "river-crossing-fragment",
    levelId: "xiangjiang-battle",
    group: "湘江血战碎片",
    name: "渡江碎片",
    visual: "一块被江水浸湿的桥板残片，刻着渡口行动线。",
    rewardText: "你排定了抢渡行动，让渡口、通路、阻击和主力渡江接成一线。",
    mapHint: "地图上湘江到遵义方向的路线被点亮，提示队伍穿过惨烈考验继续前行。",
    fact: "湘江战役是长征初期最惨烈的战斗之一，红军付出巨大代价后继续向西转移。",
    effect: "xiangjiang-zunyi-route",
  },
  {
    id: "direction-fragment",
    levelId: "zunyi-turn",
    group: "遵义会议碎片",
    name: "方向碎片",
    visual: "一角会议记录纸，带墨迹和“转折”字样。",
    rewardText: "你记录下了关键判断。红军在危急关头重新看清方向。",
    mapHint: "地图上从遵义到赤水一段路线变亮，提示“重新争取主动”。",
    fact: "遵义会议集中总结长征初期军事指挥问题，使红军开始重新掌握主动。",
    effect: "zunyi-chishui-route",
  },
  {
    id: "iron-chain-fragment",
    levelId: "luding-bridge",
    group: "飞夺泸定桥碎片",
    name: "铁索碎片",
    visual: "一段铁索和桥板残片。",
    rewardText: "你跟随突击队冲过铁索，帮助红军打开前进通道。",
    mapHint: "地图上泸定桥节点亮起，说明队伍突破险关。",
    fact: "飞夺泸定桥打通了红军北上通道，是长征突破险关的重要一战。",
    effect: "luding-node",
  },
];

export function getArchiveFragmentForLevel(levelId) {
  return ARCHIVE_FRAGMENTS.find((fragment) => fragment.levelId === levelId) || null;
}

export function getArchiveFragmentItems() {
  const collected = getArchiveFragments();
  return ARCHIVE_FRAGMENTS.map((fragment) => ({
    ...fragment,
    collected: Boolean(collected[fragment.id]),
  }));
}

export function isArchiveFragmentCollected(fragmentId) {
  return Boolean(getArchiveFragments()[fragmentId]);
}

export function collectArchiveFragmentForLevel(levelId) {
  const fragment = getArchiveFragmentForLevel(levelId);
  if (!fragment) return null;
  return {
    ...fragment,
    newlyCollected: collectArchiveFragment(fragment.id),
  };
}

export function showArchiveFragmentReward(root, levelId) {
  const fragment = collectArchiveFragmentForLevel(levelId);
  if (!fragment) return Promise.resolve(false);

  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "archive-fragment-reward";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", `${fragment.name}获得`);
    overlay.innerHTML = `
      <div class="archive-fragment-reward__panel">
        <p class="archive-fragment-reward__eyebrow">${fragment.group}</p>
        <div class="archive-fragment-reward__body">
          ${renderArchiveFragmentVisual(fragment)}
          <div class="archive-fragment-reward__copy">
            <h2>${fragment.newlyCollected ? "获得" : "再次查看"}：${fragment.name}</h2>
            <p>${fragment.rewardText}</p>
            <small>${fragment.mapHint}</small>
          </div>
        </div>
        <button type="button" data-collect-archive-fragment>收进档案袋</button>
      </div>
    `;

    root.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("archive-fragment-reward--visible"));

    overlay.querySelector("[data-collect-archive-fragment]").addEventListener("click", () => {
      overlay.classList.remove("archive-fragment-reward--visible");
      window.setTimeout(() => {
        overlay.remove();
        resolve(true);
      }, 180);
    });
  });
}

export function renderArchiveFragmentVisual(fragment, options = {}) {
  const stateClass = options.collected === false ? " archive-fragment-visual--locked" : "";
  return `
    <div class="archive-fragment-visual archive-fragment-visual--${fragment.id}${stateClass}" aria-hidden="true">
      ${renderFragmentVisualInner(fragment.id)}
    </div>
  `;
}

function renderFragmentVisualInner(fragmentId) {
  if (fragmentId === "departure-map-fragment") return renderDepartureMapFragment();
  if (fragmentId === "river-crossing-fragment") return renderRiverCrossingFragment();
  if (fragmentId === "direction-fragment") return renderDirectionFragment();
  if (fragmentId === "iron-chain-fragment") return renderIronChainFragment();
  return "";
}

function renderDepartureMapFragment() {
  return `
    <span class="archive-fragment-visual__map-paper"></span>
    <span class="archive-fragment-visual__route-thread"></span>
    <span class="archive-fragment-visual__route-dot archive-fragment-visual__route-dot--start"></span>
    <span class="archive-fragment-visual__route-dot archive-fragment-visual__route-dot--end"></span>
    <span class="archive-fragment-visual__cloth-tab"></span>
    <strong>启程</strong>
  `;
}

function renderRiverCrossingFragment() {
  return `
    <span class="archive-fragment-visual__river"></span>
    <span class="archive-fragment-visual__crossing-plank"></span>
    <span class="archive-fragment-visual__crossing-mark archive-fragment-visual__crossing-mark--one"></span>
    <span class="archive-fragment-visual__crossing-mark archive-fragment-visual__crossing-mark--two"></span>
    <strong>渡江</strong>
  `;
}

function renderDirectionFragment() {
  return `
    <span class="archive-fragment-visual__paper-edge"></span>
    <span class="archive-fragment-visual__ink archive-fragment-visual__ink--one"></span>
    <span class="archive-fragment-visual__ink archive-fragment-visual__ink--two"></span>
    <strong>转折</strong>
  `;
}

function renderIronChainFragment() {
  return `
    <span class="archive-fragment-visual__chain archive-fragment-visual__chain--one"></span>
    <span class="archive-fragment-visual__chain archive-fragment-visual__chain--two"></span>
    <span class="archive-fragment-visual__plank"></span>
  `;
}
