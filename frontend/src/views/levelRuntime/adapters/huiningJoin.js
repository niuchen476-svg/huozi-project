import { fetchExhibition, fetchLevelExperience, fetchLevelsIndex } from "../../../api.js";
import { buildHuiningSourceCatalog, renderHuiningJoinExperience } from "../../levels/huiningJoin/index.js";
import { completeLevel, cancelLevel } from "../protocol.js";
import { preloadImage } from "../assetPreload.js";

export default {
  id: "huining-join",
  preload() {
    return Promise.all([
      preloadImage("assets/levels/huining-join/victory-meeting-painting.png"),
      preloadImage("assets/levels/huining-join/huining-site-xinhua.jpg"),
    ]);
  },
  async play(context) {
    const [exhibition, levels] = await Promise.all([fetchExhibition(), fetchLevelsIndex()]);
    const experiences = await Promise.all(levels.map((level) => fetchLevelExperience(level.id).catch(() => null)));
    const sourceCatalog = buildHuiningSourceCatalog(levels, experiences);
    const outcome = await renderHuiningJoinExperience({ ...context, exhibition, sourceCatalog });
    if (!outcome) return cancelLevel();
    return completeLevel({
      actionCompleted: true,
      data: {
        expressionChoices: outcome.expressionChoices,
        expressionSources: sourceCatalog,
        initialSourceIds: outcome.sourceIds,
      },
    });
  },
  pause({ root }) {
    root.querySelector(".huining-experience")?.classList.add("is-paused");
  },
  resume({ root }) {
    root.querySelector(".huining-experience")?.classList.remove("is-paused");
  },
  dispose({ root }) {
    root.querySelector(".huining-experience")?.remove();
  },
};
