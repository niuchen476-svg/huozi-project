import { renderHomeView } from "./views/home.js";
import { renderLandingView } from "./views/landing.js";
import { renderMapView } from "./views/map.js";
import { renderLevelView } from "./views/level.js";
import { resumeBgmAfterMedia, setupBgm } from "./bgm.js";

const app = document.querySelector("#app");

function route() {
  resumeBgmAfterMedia();
  const hash = window.location.hash.slice(1) || "/";
  const levelMatch = hash.match(/^\/level\/(.+)$/);

  app.classList.remove("app--action-scene");
  app.classList.toggle("app--fullbleed", hash === "/map" || hash === "/" || hash === "/landing");

  if (levelMatch) {
    renderLevelView(app, levelMatch[1]);
  } else if (hash === "/landing") {
    renderLandingView(app);
  } else if (hash === "/map") {
    renderMapView(app);
  } else {
    renderHomeView(app);
  }
}

window.addEventListener("hashchange", route);
route();
setupBgm();
