import { fetchLevelsIndex, preloadLevelsIndex } from "../api.js";
import { getProgress } from "../state.js";
import { getArchiveFragmentForLevel, getArchiveFragmentItems, renderArchiveFragmentVisual } from "../archiveFragments.js";
import { preloadLevelResources } from "./level.js";

const MAP_IMAGE_SRC = "assets/map/route.jpg";
const INSTANT_ENTRY_LEVELS = new Set(["ruijin-departure", "xiangjiang-battle"]);

// 坐标为在地图图片中的百分比位置（横向 x% / 纵向 y%），对应图上的星标/地名：
// 瑞金 → 湘江战役 → 遵义会议 → 四渡赤水（标签处）→ 强渡大渡河/飞夺泸定桥 → 翻越夹金山/两河口会议 → 会宁会师
const MARKER_POSITIONS = {
  "ruijin-departure": { x: 75, y: 84 },
  "xiangjiang-battle": { x: 57, y: 84 },
  "zunyi-turn": { x: 42, y: 66 },
  "sidu-chishui": { x: 38, y: 58 },
  "luding-bridge": { x: 21, y: 51 },
  "snow-grassland": { x: 31, y: 46 },
  "huining-join": { x: 32, y: 15 },
};

export function preloadMapAssets() {
  preloadLevelsIndex();
  preloadImage(MAP_IMAGE_SRC);
}

export async function renderMapView(root) {
  preloadMapAssets();

  root.innerHTML = `
    <div class="view view-map view-map--fullscreen">
      <p class="loading">正在展开路线图...</p>
    </div>
  `;

  let levels;
  try {
    levels = await fetchLevelsIndex();
  } catch (err) {
    root.innerHTML = `
      <div class="view view-map view-map--fullscreen">
        <p class="error">加载失败：请确认后端已启动（backend 目录下 npm run dev）</p>
      </div>
    `;
    return;
  }

  const progress = getProgress();
  const sorted = [...levels].sort((a, b) => a.order - b.order);
  const statusById = computeStatuses(sorted, progress);
  const archiveFragments = getArchiveFragmentItems();
  const collectedArchiveFragments = archiveFragments.filter((fragment) => fragment.collected);

  root.innerHTML = `
    <div class="view view-map view-map--fullscreen">
      <a class="map-back-link" href="#/">← 返回首页</a>
      <div class="map-hint">点击关卡图钉，开始或重玩挑战吧！</div>
      <button class="archive-bag-button" type="button" data-open-archive-bag aria-label="打开档案袋">
        <span class="archive-bag-button__icon" aria-hidden="true"></span>
        <span>碎片收集</span>
        <strong>${collectedArchiveFragments.length}/${archiveFragments.length}</strong>
      </button>
      <div class="route-map-image">
        <img class="route-map-image__bg" src="${MAP_IMAGE_SRC}" alt="长征路线图" decoding="async" fetchpriority="high" />
        ${renderFragmentMapEffects(archiveFragments)}
        ${sorted.map((level, index) => renderPin(level, statusById[level.id], index, archiveFragments)).join("")}
      </div>
      ${renderArchiveBagPanel(archiveFragments)}
    </div>
  `;

  root.querySelectorAll("[data-level-id]").forEach((node) => {
    const preloadThisLevel = () => preloadLevelResources(node.dataset.levelId);
    node.addEventListener("pointerenter", preloadThisLevel, { once: true });
    node.addEventListener("focus", preloadThisLevel, { once: true });
    node.addEventListener("click", () => {
      if (node.dataset.status === "locked") return;
      preloadThisLevel();
      window.location.hash = `#/level/${node.dataset.levelId}`;
    });
  });

  sorted
    .filter((level) => INSTANT_ENTRY_LEVELS.has(level.id) && statusById[level.id] !== "locked")
    .forEach((level) => preloadLevelResources(level.id));

  idle(() => {
    sorted
      .filter((level) => statusById[level.id] !== "locked" && !INSTANT_ENTRY_LEVELS.has(level.id))
      .forEach((level) => preloadLevelResources(level.id));
  });

  attachArchiveBag(root, archiveFragments);
}

// 已完成内容的关卡直接点亮，方便从地图进入任意样本关卡。
// 还没写史料的关卡（status !== "sample"）永远锁定。
function computeStatuses(sortedLevels, progress) {
  const statusById = {};

  sortedLevels.forEach((level) => {
    if (level.status !== "sample") {
      statusById[level.id] = "locked";
      return;
    }
    if (progress[level.id] === "completed") {
      statusById[level.id] = "completed";
      return;
    }
    statusById[level.id] = "unlocked";
  });

  return statusById;
}

function renderPin(level, status, index, fragments) {
  const fragment = getArchiveFragmentForLevel(level.id);
  const fragmentCollected = fragment ? fragments.some((item) => item.id === fragment.id && item.collected) : false;
  const statusLabel = {
    completed: "已通关 · 可重新挑战",
    unlocked: "档案已解密 · 可进入核验",
    locked: "尚未解锁",
  }[status];
  const pos = MARKER_POSITIONS[level.id] || { x: 50, y: 50 };
  const linkAttributes =
    status === "locked" ? `aria-disabled="true"` : `href="#/level/${level.id}"`;

  return `
    <a
      class="route-pin route-pin--${status}${fragmentCollected ? " route-pin--fragment-lit" : ""}"
      data-level-id="${level.id}"
      data-status="${status}"
      ${linkAttributes}
      style="left: ${pos.x}%; top: ${pos.y}%; animation-delay: ${(index * 0.35).toFixed(2)}s;"
      title="${level.title} · ${statusLabel}${fragmentCollected ? " · 已收入档案碎片" : ""}"
    >
      <span class="route-pin__badge">${String(level.order).padStart(2, "0")}</span>
      <span class="route-pin__label">${level.title}</span>
    </a>
  `;
}

function renderFragmentMapEffects(fragments) {
  const collectedEffects = new Set(fragments.filter((fragment) => fragment.collected).map((fragment) => fragment.effect));
  const lines = [];

  if (collectedEffects.has("ruijin-xiangjiang-route")) {
    lines.push(`<path class="route-fragment-line route-fragment-line--departure" d="M 75 84 C 69 80, 62 81, 57 84" />`);
  }

  if (collectedEffects.has("xiangjiang-zunyi-route")) {
    lines.push(`<path class="route-fragment-line route-fragment-line--xiangjiang" d="M 57 84 C 52 78, 48 72, 42 66" />`);
  }

  if (collectedEffects.has("zunyi-chishui-route")) {
    lines.push(`<path class="route-fragment-line route-fragment-line--direction" d="M 42 66 C 41 62, 39 60, 38 58" />`);
  }

  if (collectedEffects.has("chishui-luding-route")) {
    lines.push(`<path class="route-fragment-line route-fragment-line--chishui" d="M 38 58 C 32 55, 27 52, 21 51" />`);
  }

  if (collectedEffects.has("luding-snow-route")) {
    lines.push(`<path class="route-fragment-line route-fragment-line--snow" d="M 21 51 C 24 49, 28 47, 31 46" />`);
  }

  if (!lines.length) return "";

  return `
    <svg class="route-fragment-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      ${lines.join("")}
    </svg>
  `;
}

function renderArchiveBagPanel(fragments) {
  const firstCollected = fragments.find((fragment) => fragment.collected);
  const detail = firstCollected
    ? firstCollected.fact
    : "完成瑞金出发、湘江血战等关卡后，档案碎片会收入这里。";

  return `
    <div class="archive-bag-panel" data-archive-bag-panel hidden>
      <button class="archive-bag-panel__backdrop" type="button" data-close-archive-bag aria-label="关闭档案袋"></button>
      <section class="archive-bag-panel__sheet" aria-label="档案袋">
        <div class="archive-bag-panel__header">
          <div>
            <p>长征档案行</p>
            <h2>碎片收集</h2>
          </div>
          <button type="button" data-close-archive-bag>关闭</button>
        </div>
        <div class="archive-bag-grid">
          ${fragments.map(renderArchiveBagFragment).join("")}
        </div>
        <p class="archive-bag-detail" data-archive-bag-detail>${detail}</p>
      </section>
    </div>
  `;
}

function renderArchiveBagFragment(fragment) {
  return `
    <button
      class="archive-bag-fragment ${fragment.collected ? "archive-bag-fragment--collected" : "archive-bag-fragment--locked"}"
      type="button"
      data-archive-fragment-id="${fragment.id}"
    >
      ${renderArchiveFragmentVisual(fragment, { collected: fragment.collected })}
      <span>${fragment.collected ? fragment.name : "未获得碎片"}</span>
      <small>${fragment.group}</small>
    </button>
  `;
}

function attachArchiveBag(root, fragments) {
  const panel = root.querySelector("[data-archive-bag-panel]");
  const detail = root.querySelector("[data-archive-bag-detail]");
  const open = root.querySelector("[data-open-archive-bag]");
  const closeButtons = root.querySelectorAll("[data-close-archive-bag]");

  open?.addEventListener("click", () => {
    panel.hidden = false;
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      panel.hidden = true;
    });
  });

  root.querySelectorAll("[data-archive-fragment-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const fragment = fragments.find((item) => item.id === button.dataset.archiveFragmentId);
      if (!fragment) return;
      detail.textContent = fragment.collected ? fragment.fact : `完成「${fragment.group.replace("碎片", "")}」后解锁：${fragment.visual}`;
    });
  });
}

function preloadImage(src) {
  const image = new Image();
  image.decoding = "async";
  image.src = src;
}

function idle(callback) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback, { timeout: 1500 });
    return;
  }
  window.setTimeout(callback, 250);
}
