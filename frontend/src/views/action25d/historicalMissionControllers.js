import { createCollectController } from "./historicalMissionScenes/collect.js";
import { createDispatchController } from "./historicalMissionScenes/dispatch.js";
import { createRepairController } from "./historicalMissionScenes/repair.js";
import { createRescueController } from "./historicalMissionScenes/rescue.js";
import { createSignalController } from "./historicalMissionScenes/signal.js";
import { createStealthController } from "./historicalMissionScenes/stealth.js";

export function createSceneController(scene, context) {
  if (scene.type === "collect") return createCollectController(scene, context);
  if (scene.type === "stealth") return createStealthController(scene, context);
  if (scene.type === "signal") return createSignalController(scene, context);
  if (scene.type === "repair") return createRepairController(scene, context);
  if (scene.type === "dispatch") return createDispatchController(scene, context);
  if (scene.type === "rescue") return createRescueController(scene, context);
  return { cleanup() {} };
}
