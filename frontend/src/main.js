import { renderHomeView } from "./views/home.js";
import { preloadMapAssets, renderMapView } from "./views/map.js";
import { disposeLevelView, renderLevelView } from "./views/level.js";
import { resumeBgmAfterMedia, setupBgm } from "./bgm.js";

const app = document.querySelector("#app");

function route() {
  disposeLevelView();
  resumeBgmAfterMedia();
  const hash = window.location.hash.slice(1) || "/";
  const levelMatch = hash.match(/^\/level\/(.+)$/);

  app.classList.remove("app--action-scene");
  app.classList.toggle("app--fullbleed", hash === "/map" || hash === "/");

  if (levelMatch) {
    renderLevelView(app, levelMatch[1]);
  } else if (hash === "/map") {
    renderMapView(app);
  } else {
    renderHomeView(app);
  }
}

window.addEventListener("hashchange", route);
route();
setupBgm();

function warmMapWhenHomeIsReady() {
  const warm = () => {
    if (window.location.hash && window.location.hash !== "#/") return;
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => preloadMapAssets(), { timeout: 900 });
      return;
    }
    window.setTimeout(() => preloadMapAssets(), 180);
  };

  if (document.readyState === "complete") warm();
  else window.addEventListener("load", warm, { once: true });
}

warmMapWhenHomeIsReady();
