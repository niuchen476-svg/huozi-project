import { renderZunyiMeeting } from "../../levels/zunyiTurn/index.js";
import { completeLevel } from "../protocol.js";
import { preloadImage } from "../assetPreload.js";

export default {
  id: "zunyi-turn",
  preload() {
    return preloadImage("assets/levels/zunyi-turn/meeting-painting-wide.jpg");
  },
  async play({ root, level }) {
    await renderZunyiMeeting(root, level);
    return completeLevel({ actionCompleted: true });
  },
};
