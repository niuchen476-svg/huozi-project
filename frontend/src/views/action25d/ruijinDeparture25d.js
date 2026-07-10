import { renderCampaignAction25d } from "./campaignStage25d.js";

const SIDE_LABEL = {
  left: "左",
  right: "右",
};

const RUIJIN_MISSION = {
  theme: "ruijin",
  progressLabel: "桥头距离",
  integrityLabel: "隐蔽",
  goalLabel: "木板渡桥",
  introButton: "从草地出发",
  advanceLabel: "沿草地前进",
  dodgeLine: "队伍贴着山影绕开了灯束",
  failLine: "探照灯扫到队伍，必须退回林线重新隐蔽",
  winLines: ["前方木板渡桥已经搭好，队伍刚好赶到桥头。", "收齐物品，跟上前队，开始过桥。"],
  hitLines: ["灯束擦过队尾，行军速度被迫放慢", "封锁线枪声逼近，队伍短暂散开", "物资车陷进泥地，后队停下了脚步"],
  warning: (side) => `探照灯扫向${SIDE_LABEL[side]}侧，按 ${side === "left" ? "←" : "→"} 绕行`,
  beats: [
    { at: 8, text: "你在队伍中间，脚下还是湿草和泥土" },
    { at: 36, text: "机关、后勤、电台、伤员都在队列里，速度不能只按冲锋来算" },
    { at: 74, text: "桥头木板隐约出现，先把沿路物品都收好" },
  ],
  collectibles: [
    { id: "ruijin-pack", name: "行军背包", kind: "backpack", at: 18, x: -0.68 },
    {
      id: "ruijin-letter",
      name: "红军家书",
      kind: "letter",
      at: 46,
      x: 0.58,
      letter: {
        title: "易冠美家书摘录",
        shortTitle: "红军家书",
        sourceName: "文艺报《十封红军家信》",
        sourceUrl: "https://wyb.chinawriter.com.cn/content/202102/03/content58104.html",
        lines: ["母亲大人膝下敬禀", "现在身体平安", "不必挂念", "争取革命首先胜利"],
      },
    },
    { id: "ruijin-map", name: "苏区地图", kind: "map", at: 74, x: -0.35 },
  ],
  advanceStep: 6,
  hitLimit: 3,
  dodgeWindowMs: 980,
  minHazardGapMs: 1450,
  maxHazardGapMs: 2450,
};

export function renderRuijinDepartureAction25d(root, level) {
  return renderCampaignAction25d(root, level, RUIJIN_MISSION);
}
