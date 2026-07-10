const COVER_IMAGE_SRC = "assets/cover/cover.png";

export function renderLandingView(root) {
  root.innerHTML = `
    <main class="view view-landing">
      <section class="landing-hero" style="background-image: url('${COVER_IMAGE_SRC}')">
        <div class="landing-hero__shade"></div>
        <a class="landing-back" href="#/">返回封面</a>
        <div class="landing-hero__content">
          <p>长征档案行</p>
          <h1>在史料与互动中重走长征关键节点</h1>
          <span>面向 K12 学生的沉浸式红色历史学习项目。通过档案、图像、视频、小游戏和碎片收集，把历史事实转化为可以理解、可以参与、可以回看的学习体验。</span>
          <div class="landing-hero__actions">
            <a href="#/map">开始体验</a>
            <a href="#/level/zunyi-turn">进入遵义会议</a>
          </div>
        </div>
      </section>

      <section class="landing-section landing-section--intro">
        <div>
          <p class="landing-kicker">项目定位</p>
          <h2>不是单纯看故事，而是带着任务进入历史现场。</h2>
        </div>
        <p>
          学生会以“小记录员”“突击队员”等身份进入关卡，在真实史实线索的提示下完成判断、记录、躲避、前进和归档。每一关结束后获得一枚档案碎片，形成连续的长征路线记忆。
        </p>
      </section>

      <section class="landing-feature-grid" aria-label="当前关卡亮点">
        <article>
          <small>第一关原型</small>
          <h3>遵义会议</h3>
          <p>围绕会议背景、会场记录和史料放大查看设计互动，让学生理解“为什么这是生死攸关的转折点”。</p>
        </article>
        <article>
          <small>动作关卡</small>
          <h3>飞夺泸定桥</h3>
          <p>通过拖动报名、空格前进、方向键躲避和史实节点弹窗，把“只剩铁索”的险境做成可操作的体验。</p>
        </article>
        <article>
          <small>连续机制</small>
          <h3>碎片收集</h3>
          <p>完成关卡后获得方向碎片、铁索碎片，并在长征档案袋中回看，建立关卡之间的连续性。</p>
        </article>
      </section>

      <section class="landing-section landing-section--cta">
        <div>
          <p class="landing-kicker">体验入口</p>
          <h2>从路线图开始，逐步打开长征档案。</h2>
        </div>
        <a href="#/map">打开长征路线图</a>
      </section>
    </main>
  `;
}
