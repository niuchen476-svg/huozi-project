import { preloadEmbeddedLevel, renderEmbeddedLevel } from "../../embeddedLevel.js";
import { completeLevel } from "../protocol.js";

export default {
  id: "snow-grassland",
  preload() {
    return preloadEmbeddedLevel("snow-grassland");
  },
  async play({ root, level }) {
    await renderEmbeddedLevel(root, level);
    return completeLevel({ actionCompleted: true });
  },
};
