import { preloadMapAssets } from "./map.js";

const COVER_IMAGE_SRC = "assets/cover/cover.jpg";

export function renderHomeView(root) {
  root.innerHTML = `
    <div class="view view-home" style="background-image: url('${COVER_IMAGE_SRC}')">
      <div class="view-home__scrim"></div>
      <div class="view-home__content">
        <header class="map-header">
          <p class="map-header__eyebrow">少年长征史料互动体验</p>
          <h1>重走长征路</h1>
          <p class="map-header__subtitle">纪念长征胜利90周年 · 用史料让小朋友重建长征关键路线</p>
        </header>
        <div class="home-actions">
          <button type="button" id="join-army" class="home-cta">加入红军，一起重走长征路</button>
        </div>
      </div>
    </div>
  `;

  const joinButton = document.querySelector("#join-army");
  const warmMap = () => preloadMapAssets();

  joinButton.addEventListener("pointerenter", warmMap, { once: true });
  joinButton.addEventListener("focus", warmMap, { once: true });
  joinButton.addEventListener("pointerdown", warmMap, { once: true });
  joinButton.addEventListener("click", () => {
    window.location.hash = "#/map";
  });
}
