import { preloadEmbeddedLevel, renderEmbeddedLevel } from "../../embeddedLevel.js";
import { completeLevel } from "../protocol.js";

export default {
  id: "sidu-chishui",
  preload() {
    return preloadEmbeddedLevel("sidu-chishui");
  },
  async play({ root, level, runtime }) {
    await renderEmbeddedLevel(root, level, runtime);
    return completeLevel({ actionCompleted: true });
  },
};
