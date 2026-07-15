import { collectArchiveFragment, getArchiveFragments } from "./state.js";

let fragmentViewerPromise = null;

export const ARCHIVE_FRAGMENTS = [
  {
    id: "departure-map-fragment",
    levelId: "ruijin-departure",
    group: "瑞金出发碎片",
    name: "夜行马灯",
    visual: "一盏用于表现夜间集结与秘密转移的象征性数字马灯。",
    model: "/assets/fragments/models/ruijin-lantern.glb",
    image: "/assets/fragments/fallbacks/ruijin-lantern.webp",
    rewardText: "你完成了关键物资取舍，让队伍在艰难出发前保住继续前进的力量。",
    mapHint: "地图上瑞金到湘江方向的路线被点亮，提示长征已经启程。",
    fact: "1934年10月，中央红军主力从瑞金、于都等地集结出发，开始战略转移。",
    effect: "ruijin-xiangjiang-route",
  },
  {
    id: "river-crossing-fragment",
    levelId: "xiangjiang-battle",
    group: "湘江血战碎片",
    name: "渡江军号",
    visual: "一把用于表现战场号令与抢渡协同的象征性数字军号。",
    model: "/assets/fragments/models/xiangjiang-bugle.glb",
    image: "/assets/fragments/fallbacks/xiangjiang-bugle.webp",
    rewardText: "你排定了抢渡行动，让渡口、通路、阻击和主力渡江接成一线。",
    mapHint: "地图上湘江到遵义方向的路线被点亮，提示队伍穿过惨烈考验继续前行。",
    fact: "湘江战役是长征初期最惨烈的战斗之一，红军付出巨大代价后继续向西转移。",
    effect: "xiangjiang-zunyi-route",
  },
  {
    id: "direction-fragment",
    levelId: "zunyi-turn",
    group: "遵义会议碎片",
    name: "会议钢笔",
    visual: "一支用于表现会议记录、复盘与重新判断的象征性数字钢笔。",
    model: "/assets/fragments/models/zunyi-pen.glb",
    image: "/assets/fragments/fallbacks/zunyi-pen.webp",
    rewardText: "你记录下了关键判断。红军在危急关头重新看清方向。",
    mapHint: "地图上从遵义到赤水一段路线变亮，提示“重新争取主动”。",
    fact: "遵义会议集中总结长征初期军事指挥问题，使红军开始重新掌握主动。",
    effect: "zunyi-chishui-route",
  },
  {
    id: "chishui-maneuver-fragment",
    levelId: "sidu-chishui",
    group: "四渡赤水碎片",
    name: "行军罗盘",
    visual: "一枚用于表现路线调整与机动作战的象征性数字罗盘。",
    model: "/assets/fragments/models/sidu-compass.glb",
    image: "/assets/fragments/fallbacks/sidu-compass.webp",
    rewardText: "你完成四次机动渡河，帮助红军在围追堵截中重新掌握主动。",
    mapHint: "地图上赤水到泸定桥方向的路线被点亮，提示队伍跳出重围继续北上。",
    fact: "四渡赤水体现了红军声东击西、避实击虚的机动作战，使战略转移重新转为主动。",
    effect: "chishui-luding-route",
  },
  {
    id: "iron-chain-fragment",
    levelId: "luding-bridge",
    group: "飞夺泸定桥碎片",
    name: "铁索碎片",
    visual: "一段用于表现泸定桥险境与突破行动的象征性数字铁索。",
    model: "/assets/fragments/models/luding-chain.glb",
    image: "/assets/fragments/fallbacks/luding-chain.webp",
    rewardText: "你跟随突击队冲过铁索，帮助红军打开前进通道。",
    mapHint: "地图上泸定桥节点亮起，说明队伍突破险关。",
    fact: "飞夺泸定桥打通了红军北上通道，是长征突破险关的重要一战。",
    effect: "luding-node",
  },
  {
    id: "snow-grass-fragment",
    levelId: "snow-grassland",
    group: "雪山草地碎片",
    name: "信念红星",
    visual: "一枚用于表现极端环境中坚持与互助的象征性数字红星。",
    model: "/assets/fragments/models/snow-star.glb",
    image: "/assets/fragments/fallbacks/snow-star.webp",
    rewardText: "你在雪山和草地中做出正确抉择，带领队伍走出自然绝境。",
    mapHint: "地图上泸定桥到雪山草地方向的路线被点亮，提示队伍向会师继续前进。",
    fact: "翻雪山、过草地是长征途中最艰苦的自然考验之一，红军依靠信念和互助保存了继续前进的力量。",
    effect: "luding-snow-route",
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
          ${renderArchiveFragmentVisual(fragment, { interactive3d: true })}
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

    function collectReward() {
      overlay.classList.remove("archive-fragment-reward--visible");
      window.setTimeout(() => {
        overlay.remove();
        resolve(true);
      }, 180);
    }

    function onRewardKeyDown(event) {
      if (event.key !== "Enter" && event.code !== "Space") return;
      event.preventDefault();
      window.removeEventListener("keydown", onRewardKeyDown);
      collectReward();
    }

    overlay.querySelector("[data-collect-archive-fragment]").addEventListener("click", () => {
      window.removeEventListener("keydown", onRewardKeyDown);
      collectReward();
    });
    window.addEventListener("keydown", onRewardKeyDown);
  });
}

export function renderArchiveFragmentVisual(fragment, options = {}) {
  const stateClass = options.collected === false ? " archive-fragment-visual--locked" : "";
  if (options.interactive3d && fragment.model && fragment.image) {
    ensureFragmentModelViewer();
    return `
      <div class="archive-fragment-visual archive-fragment-visual--image archive-fragment-visual--model archive-fragment-visual--${fragment.id}${stateClass}">
        <archive-fragment-model
          class="archive-fragment-model"
          model="${escapeAttribute(fragment.model)}"
          fallback="${escapeAttribute(fragment.image)}"
          aria-label="${escapeAttribute(`${fragment.name}三维模型`)}"
        ><img src="${escapeAttribute(fragment.image)}" alt="" loading="lazy" decoding="async" /></archive-fragment-model>
      </div>
    `;
  }
  if (fragment.image) {
    return `
      <div class="archive-fragment-visual archive-fragment-visual--image archive-fragment-visual--${fragment.id}${stateClass}" aria-hidden="true">
        <img src="${fragment.image}" alt="" loading="lazy" decoding="async" />
      </div>
    `;
  }

  return `
    <div class="archive-fragment-visual archive-fragment-visual--${fragment.id}${stateClass}" aria-hidden="true">
      ${renderFragmentVisualInner(fragment.id)}
    </div>
  `;
}

function ensureFragmentModelViewer() {
  if (typeof window === "undefined") return;
  fragmentViewerPromise ||= import("./views/fragmentModelViewer.js").catch((error) => {
    console.warn("[fragment-viewer] 三维查看器加载失败，继续使用平面备用图", error);
    return null;
  });
}

function escapeAttribute(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderFragmentVisualInner(fragmentId) {
  if (fragmentId === "departure-map-fragment") return renderDepartureMapFragment();
  if (fragmentId === "river-crossing-fragment") return renderRiverCrossingFragment();
  if (fragmentId === "direction-fragment") return renderDirectionFragment();
  if (fragmentId === "chishui-maneuver-fragment") return renderChishuiManeuverFragment();
  if (fragmentId === "iron-chain-fragment") return renderIronChainFragment();
  if (fragmentId === "snow-grass-fragment") return renderSnowGrassFragment();
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

function renderChishuiManeuverFragment() {
  return `
    <span class="archive-fragment-visual__chishui-river"></span>
    <span class="archive-fragment-visual__chishui-line archive-fragment-visual__chishui-line--one"></span>
    <span class="archive-fragment-visual__chishui-line archive-fragment-visual__chishui-line--two"></span>
    <span class="archive-fragment-visual__chishui-line archive-fragment-visual__chishui-line--three"></span>
    <span class="archive-fragment-visual__chishui-line archive-fragment-visual__chishui-line--four"></span>
    <strong>赤水</strong>
  `;
}

function renderSnowGrassFragment() {
  return `
    <span class="archive-fragment-visual__snow-peak archive-fragment-visual__snow-peak--one"></span>
    <span class="archive-fragment-visual__snow-peak archive-fragment-visual__snow-peak--two"></span>
    <span class="archive-fragment-visual__grass"></span>
    <strong>雪草</strong>
  `;
}
