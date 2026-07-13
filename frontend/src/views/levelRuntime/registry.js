import { preloadLevel } from "../../api.js";
import { continueLevel } from "./protocol.js";

const adapterLoaders = {
  "ruijin-departure": () => import("./adapters/ruijinDeparture.js"),
  "xiangjiang-battle": () => import("./adapters/xiangjiangBattle.js"),
  "zunyi-turn": () => import("./adapters/zunyiTurn.js"),
  "sidu-chishui": () => import("./adapters/siduChishui.js"),
  "luding-bridge": () => import("./adapters/ludingBridge.js"),
  "snow-grassland": () => import("./adapters/snowGrassland.js"),
  "huining-join": () => import("./adapters/huiningJoin.js"),
};

const adapterPromises = new Map();

const dossierOnlyAdapter = Object.freeze({
  id: "dossier-only",
  preload() {},
  play() {
    return continueLevel({ actionCompleted: false });
  },
});

export async function getLevelAdapter(levelId) {
  const load = adapterLoaders[levelId];
  if (!load) return dossierOnlyAdapter;

  if (!adapterPromises.has(levelId)) {
    adapterPromises.set(
      levelId,
      load()
        .then((module) => module.default)
        .catch((error) => {
          adapterPromises.delete(levelId);
          throw error;
        })
    );
  }
  return adapterPromises.get(levelId);
}

export function preloadLevelResources(levelId) {
  preloadLevel(levelId);
  return getLevelAdapter(levelId).then((adapter) => adapter.preload?.()).catch(() => {});
}
