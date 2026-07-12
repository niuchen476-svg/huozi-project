const COVER_IMAGE_SRC = "assets/cover/cover.jpg";

export function renderHomeView(root) {
  root.innerHTML = `
    <div class="view view-home" style="background-image: url('${COVER_IMAGE_SRC}')">
      <div class="view-home__scrim"></div>
      <div class="view-home__content">
        <header class="map-header">
          <p class="map-header__eyebrow">数字图书馆馆员任务档案</p>
          <h1>长征档案行</h1>
          <p class="map-header__subtitle">重建长征关键路线 · 用史料检验你的每一次判断</p>
        </header>
        <div class="home-actions">
          <button type="button" id="join-army" class="home-cta">加入红军，一起重温长征路</button>
          <a class="home-link" href="#/landing">查看项目介绍</a>
        </div>
      </div>
    </div>
  `;

  document.querySelector("#join-army").addEventListener("click", () => {
    window.location.hash = "#/map";
  });
}
