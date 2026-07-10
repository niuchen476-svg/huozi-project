import { renderCampaignAction25d } from "./campaignStage25d.js";

const SIDE_LABEL = {
  left: "左",
  right: "右",
};

const XIANGJIANG_MISSION = {
  theme: "xiangjiang",
  progressLabel: "桥头距离",
  integrityLabel: "队形",
  goalLabel: "湘江浮桥",
  introButton: "从草地出发",
  advanceLabel: "穿过草地",
  dodgeLine: "队伍压低身体，从弹坑旁绕了过去",
  failLine: "江滩火力过密，队伍撤回堤岸重新组织",
  winLines: ["湘江浮桥就在脚下，队伍刚好赶到桥头。", "收齐物品，跟上前队，开始过桥。"],
  hitLines: ["炮弹落在草坡边，队形被撕开一角", "桥头方向被火力压住，后队被迫停顿", "敌军火力压上来，渡口又少了一分余地"],
  warning: (side) => `炮火落向${SIDE_LABEL[side]}翼，按 ${side === "left" ? "←" : "→"} 闪避`,
  beats: [
    { at: 10, text: "你还在桥前草地上，湘江的水声在前方越来越近" },
    { at: 42, text: "有人架桥，有人阻击，有人把最后的时间留给主力" },
    { at: 76, text: "浮桥已经看得清楚，先把最后的物品收好" },
  ],
  collectibles: [
    { id: "xiangjiang-pack", name: "行军背包", kind: "backpack", at: 20, x: -0.62 },
    {
      id: "xiangjiang-letter",
      name: "红军儿子家书",
      kind: "letter",
      at: 48,
      x: 0.62,
      letter: {
        title: "红军儿子家书摘录",
        shortTitle: "红军家书",
        sourceName: "人民政协网《家书抵万金》",
        sourceUrl: "https://www.rmzxw.com.cn/c/2017-08-03/1698037.shtml",
        lines: ["父亲母亲：", "你们好！", "想念你们的心思", "时刻不曾间断", "红军儿子敬上"],
      },
    },
    { id: "xiangjiang-kit", name: "急救包", kind: "medical", at: 78, x: -0.28 },
  ],
  advanceStep: 5,
  hitLimit: 3,
  dodgeWindowMs: 860,
  minHazardGapMs: 1200,
  maxHazardGapMs: 2100,
};

export function renderXiangjiangBattleAction25d(root, level) {
  return renderCampaignAction25d(root, level, XIANGJIANG_MISSION);
}
