import { renderRuijinDepartureAction25d } from "../../levels/ruijinDeparture/index.js";
import { challenge } from "../../levels/ruijinDeparture/challenge.js";
import { continueLevel, skipLevel } from "../protocol.js";
import { preloadImage } from "../assetPreload.js";

export default {
  id: "ruijin-departure",
  challenge,
  preload() {
    return preloadImage("assets/levels/ruijin-departure/cards/03-column.jpg");
  },
  async play({ root, level }) {
    const result = await renderRuijinDepartureAction25d(root, level);
    return result === "skipped"
      ? skipLevel({ actionCompleted: false })
      : continueLevel({ actionCompleted: true });
  },
};
