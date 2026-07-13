import { renderXiangjiangBattleAction25d } from "../../levels/xiangjiangBattle/index.js";
import { challenge } from "../../levels/xiangjiangBattle/challenge.js";
import { continueLevel, skipLevel } from "../protocol.js";
import { preloadImage } from "../assetPreload.js";

export default {
  id: "xiangjiang-battle",
  challenge,
  preload() {
    return preloadImage("assets/levels/xiangjiang-battle/cards/02-crossing.jpg");
  },
  async play({ root, level }) {
    const result = await renderXiangjiangBattleAction25d(root, level);
    return result === "skipped"
      ? skipLevel({ actionCompleted: false })
      : continueLevel({ actionCompleted: true });
  },
};
