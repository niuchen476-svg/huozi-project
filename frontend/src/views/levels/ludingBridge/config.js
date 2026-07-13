export const ASSET_BASE = "assets/levels/luding-bridge";

export const KEYFRAMES = [
  { at: 0, bg: `${ASSET_BASE}/pov-start.jpg` },
  { at: 30, bg: `${ASSET_BASE}/pov-mid.jpg` },
  { at: 65, bg: `${ASSET_BASE}/pov-fire.jpg` },
  { at: 90, bg: `${ASSET_BASE}/pov-arrival.jpg` },
];

export const INTRO_BG = `${ASSET_BASE}/reference/assault-painting-wide.jpg`;
export const SQUAD_BG = `${ASSET_BASE}/squad-assembly.jpg`;
export const DRAG_SOLDIER = `${ASSET_BASE}/props/assault-drag-soldier.png`;
export const TEAMMATE_ICON = `${ASSET_BASE}/teammate-icon.jpg`;
export const TEAMMATE_FALL = `${ASSET_BASE}/teammate-fall.png`;
export const VICTORY_IMAGE = `${ASSET_BASE}/bridge-victory.jpg`;
export const CRAWL_VIDEO = `${ASSET_BASE}/videos/luding-bridge-crawl.mp4`;

// 坐标是在 squad-assembly.jpg 图片里的百分比位置：队伍后排 -> 桥头
export const PLAYER_START_POS = { x: 84, y: 58 };
export const SQUAD_SLOT_POS = { x: 42, y: 56 };

export const NARRATIVE_BEATS = [
  { at: 12, title: "只剩铁索", text: "桥面木板多已被拆除，突击队员只能攀着铁索前进。" },
  { at: 42, title: "打开通道", text: "突击队冒着对岸火力冲锋，为后续部队打开通道。" },
  { at: 72, title: "继续北上", text: "夺下桥头，中央红军才有机会继续北上。" },
];

export const ATTACK_DIRECTIONS = {
  left: { arrow: "←", label: "敌军向左扫射", escape: "right", escapeLabel: "向右躲" },
  right: { arrow: "→", label: "敌军向右扫射", escape: "left", escapeLabel: "向左躲" },
};

export const HIT_LIMIT = 3;
export const ADVANCE_STEP = 3.2;
export const ADVANCE_COOLDOWN_MS = 260;
export const ADVANCE_VIDEO_MS = 1250;
export const DODGE_WINDOW_MS = 850;
export const MIN_FIRE_GAP_MS = 1100;
export const MAX_FIRE_GAP_MS = 1900;
export const FIRE_LIMIT = 9;
export const FACT_MIN_READ_MS = 1400;
