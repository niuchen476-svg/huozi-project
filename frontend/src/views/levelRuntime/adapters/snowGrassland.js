import { preloadEmbeddedLevel, renderEmbeddedLevel } from "../../embeddedLevel.js";
import { completeLevel } from "../protocol.js";

export default {
  id: "snow-grassland",
  preload() {
    return preloadEmbeddedLevel("snow-grassland");
  },
  async play({ root, level, runtime }) {
    await renderEmbeddedLevel(root, level, runtime);
    return completeLevel({ actionCompleted: true });
  },
};
