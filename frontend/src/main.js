import { renderHomeView } from "./views/home.js";
import { preloadMapAssets, renderMapView } from "./views/map.js";
import { renderLevelView } from "./views/level.js";
import { setupBgm } from "./bgm.js";

const app = document.querySelector("#app");

function route() {
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
idle(preloadMapAssets);

function idle(callback) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback, { timeout: 2000 });
    return;
  }
  window.setTimeout(callback, 500);
}
