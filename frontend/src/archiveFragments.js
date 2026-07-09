import { collectArchiveFragment, getArchiveFragments } from "./state.js";

export const ARCHIVE_FRAGMENTS = [
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
  if (!fragment) return Promise.resolve();

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
        resolve();
      }, 180);
    });
  });
}

export function renderArchiveFragmentVisual(fragment, options = {}) {
  const stateClass = options.collected === false ? " archive-fragment-visual--locked" : "";
  return `
    <div class="archive-fragment-visual archive-fragment-visual--${fragment.id}${stateClass}" aria-hidden="true">
      ${fragment.id === "direction-fragment" ? renderDirectionFragment() : renderIronChainFragment()}
    </div>
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
