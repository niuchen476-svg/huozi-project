import { fetchLevelsIndex, preloadLevelsIndex } from "../api.js";
import { getProgress } from "../state.js";
import { preloadLevelResources } from "./level.js";

const MAP_IMAGE_SRC = "assets/map/route.jpg";

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

  root.innerHTML = `
    <div class="view view-map view-map--fullscreen">
      <a class="map-back-link" href="#/">← 返回首页</a>
      <div class="map-hint">点击关卡图钉，开始挑战吧！</div>
      <div class="route-map-image">
        <img class="route-map-image__bg" src="${MAP_IMAGE_SRC}" alt="长征路线图" decoding="async" fetchpriority="high" />
        ${sorted.map((level, index) => renderPin(level, statusById[level.id], index)).join("")}
      </div>
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

  idle(() => {
    sorted
      .filter((level) => statusById[level.id] !== "locked")
      .forEach((level) => preloadLevelResources(level.id));
  });
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

function renderPin(level, status, index) {
  const statusLabel = {
    completed: "已通关 · 证据链已封存",
    unlocked: "档案已解密 · 可进入核验",
    locked: "尚未解锁",
  }[status];
  const pos = MARKER_POSITIONS[level.id] || { x: 50, y: 50 };

  return `
    <button
      type="button"
      class="route-pin route-pin--${status}"
      data-level-id="${level.id}"
      data-status="${status}"
      style="left: ${pos.x}%; top: ${pos.y}%; animation-delay: ${(index * 0.35).toFixed(2)}s;"
      title="${level.title} · ${statusLabel}"
    >
      <span class="route-pin__badge">${String(level.order).padStart(2, "0")}</span>
      <span class="route-pin__label">${level.title}</span>
    </button>
  `;
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
