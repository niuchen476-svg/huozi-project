import { preloadBridgeActionAssets, renderBridgeAction } from "../../levels/ludingBridge/index.js";
import { completeLevel, skipLevel } from "../protocol.js";

export default {
  id: "luding-bridge",
  preload() {
    return preloadBridgeActionAssets();
  },
  async play({ root, level }) {
    const result = await renderBridgeAction(root, level);
    return result === "skipped"
      ? skipLevel({ actionCompleted: false })
      : completeLevel({ actionCompleted: true });
  },
};
