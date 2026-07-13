import { fetchExhibition } from "../../../api.js";
import { renderHuiningJoinExperience } from "../../levels/huiningJoin/index.js";
import { completeLevel, cancelLevel } from "../protocol.js";
import { preloadImage } from "../assetPreload.js";

export default {
  id: "huining-join",
  preload() {
    return Promise.all([
      preloadImage("assets/levels/huining-join/huining-site-xinhua.jpg"),
      preloadImage("assets/levels/huining-join/huining-hall-xinhua.jpg"),
    ]);
  },
  async play(context) {
    const exhibition = await fetchExhibition();
    const outcome = await renderHuiningJoinExperience({ ...context, exhibition });
    if (!outcome) return cancelLevel();
    return completeLevel({
      actionCompleted: true,
      data: { expressionChoices: outcome.expressionChoices },
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
