import { fetchExhibition, fetchLevelExperience, fetchLevelsIndex, fetchSouvenir } from "../api.js";
import { ARCHIVE_FRAGMENTS } from "../archiveFragments.js";

async function loadSourceNames(sourceIds = []) {
  if (!sourceIds.length) return [];
  try {
    const levels = await fetchLevelsIndex();
    const experiences = await Promise.all((levels.levels || levels || []).map(async (level) => ({
      level,
      experience: await fetchLevelExperience(level.id),
    })));
    const catalog = new Map(experiences.flatMap(({ level, experience }) =>
      (experience.phases?.sources?.items || []).map((source) => [source.id, `${level.title} · ${source.title}`])));
    return sourceIds.map((id) => catalog.get(id) || id);
  } catch {
    return sourceIds;
  }
}

export async function renderSouvenirView(root, token) {
  root.innerHTML = `
    <main class="souvenir-view souvenir-view--loading">
      <div class="souvenir-view__loading">正在打开你的长征记忆……</div>
    </main>`;
  try {
    const [work, exhibition] = await Promise.all([fetchSouvenir(token), fetchExhibition()]);
    const theme = (exhibition.themes || []).find((item) => item.id === work.themeId);
    const fragmentNames = (work.fragmentIds || []).map((id) =>
      ARCHIVE_FRAGMENTS.find((fragment) => fragment.id === id)?.name || id);
    const favoriteFragmentName = ARCHIVE_FRAGMENTS.find((fragment) => fragment.id === work.favoriteFragmentId)?.name;
    const sourceNames = await loadSourceNames(work.sourceIds || []);
    const main = document.createElement("main");
    main.className = "souvenir-view";
    main.innerHTML = `
      <header class="souvenir-view__header">
        <span>重走长征路 · 个人数字作品</span>
        <a href="#/">返回项目首页</a>
      </header>
      <section class="souvenir-view__work">
        <figure><img alt="玩家生成的长征主题纪念画作" /></figure>
        <div class="souvenir-view__copy">
          <p class="souvenir-view__eyebrow">我的长征记忆</p>
          <h1></h1>
          <p class="souvenir-view__expression"></p>
          <dl>
            <div><dt>主题</dt><dd data-theme></dd></div>
            <div><dt>史料</dt><dd data-sources></dd></div>
            <div><dt>碎片</dt><dd data-fragments></dd></div>
            <div><dt>最爱</dt><dd data-favorite></dd></div>
            <div><dt>署名</dt><dd data-player></dd></div>
          </dl>
          <a class="souvenir-view__save" target="_blank" rel="noreferrer noopener">打开原图并保存</a>
          <small data-expiry></small>
        </div>
      </section>`;
    main.querySelector("img").src = work.imageUrl;
    main.querySelector("h1").textContent = work.expressionTitle || "我的长征数字展台";
    main.querySelector(".souvenir-view__expression").textContent = work.expressionText || "这是一份从长征互动体验中带走的个人记忆。";
    main.querySelector("[data-theme]").textContent = theme?.name || "我的长征理解";
    main.querySelector("[data-sources]").textContent = sourceNames.join("；") || "会宁综合史料";
    main.querySelector("[data-fragments]").textContent = fragmentNames.join("、") || "会师基础展台";
    main.querySelector("[data-favorite]").textContent = favoriteFragmentName || "未单独选择";
    main.querySelector("[data-player]").textContent = work.playerName;
    main.querySelector(".souvenir-view__save").href = work.imageUrl;
    main.querySelector("[data-expiry]").textContent = `作品保存至 ${new Date(work.expiresAt).toLocaleDateString("zh-CN")}`;
    root.replaceChildren(main);
  } catch (error) {
    root.innerHTML = `
      <main class="souvenir-view souvenir-view--error">
        <div>
          <span>个人长征记忆</span>
          <h1>作品暂时无法打开</h1>
          <p></p>
          <a href="#/">返回项目首页</a>
        </div>
      </main>`;
    root.querySelector(".souvenir-view--error p").textContent = error.message || "请稍后重新扫码。";
  }
}
