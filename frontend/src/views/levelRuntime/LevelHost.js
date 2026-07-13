import { fetchLevel } from "../../api.js";
import { markCompleted, resetLevelProgress } from "../../state.js";
import { showArchiveFragmentReward } from "../../archiveFragments.js";
import { getLevelAdapter } from "./registry.js";
import { assertLevelResult, LEVEL_STATUS } from "./protocol.js";

export class LevelHost {
  constructor({ renderDossier }) {
    this.renderDossier = renderDossier;
    this.session = null;
  }

  dispose() {
    if (!this.session) return;
    this.session.controller.abort();
    this.session.adapter?.dispose?.(this.session.context);
    this.session.root?._challengeKeyboardAbort?.abort();
    this.clearActionLayout();
    this.session = null;
  }

  async render(root, levelId) {
    this.dispose();
    const controller = new AbortController();
    const session = { root, levelId, controller, adapter: null, context: null };
    this.session = session;

    root.innerHTML = `
      <div class="view view-level">
        <p class="loading">正在调阅档案卷宗...</p>
      </div>
    `;

    let level;
    let adapter;
    try {
      [level, adapter] = await Promise.all([fetchLevel(levelId), getLevelAdapter(levelId)]);
    } catch {
      if (!this.isActive(session)) return;
      root.innerHTML = `
        <div class="view view-level">
          <p class="error">关卡加载失败</p>
          <a class="back-link" href="#/map">← 返回路线图</a>
        </div>
      `;
      return;
    }

    if (!this.isActive(session)) return;
    const context = { root, level, levelId, signal: controller.signal };
    session.adapter = adapter;
    session.context = context;

    let result;
    try {
      this.applyActionLayout();
      result = assertLevelResult(await adapter.play(context), levelId);
    } catch (error) {
      if (!this.isActive(session)) return;
      this.clearActionLayout();
      root.innerHTML = `
        <div class="view view-level">
          <p class="error">关卡运行失败</p>
          <a class="back-link" href="#/map">← 返回路线图</a>
        </div>
      `;
      console.error(error);
      return;
    } finally {
      this.clearActionLayout();
    }

    if (!this.isActive(session) || result.status === LEVEL_STATUS.CANCELLED) return;

    if (result.status === LEVEL_STATUS.COMPLETED) {
      await this.completeLevel(session, { reward: true, redirect: "always" });
      return;
    }

    this.renderDossier({
      root,
      level,
      challenge: adapter.challenge || null,
      completedAction: result.actionCompleted,
      onRestart: () => this.restart(session),
      onComplete: (options) => this.completeLevel(session, options),
    });
  }

  async restart(session) {
    if (!this.isActive(session)) return;
    resetLevelProgress(session.levelId);
    window.scrollTo({ top: 0, behavior: "auto" });
    await this.render(session.root, session.levelId);
  }

  async completeLevel(session, options = {}) {
    if (!this.isActive(session)) return false;
    markCompleted(session.levelId);

    const showedReward = options.reward
      ? await showArchiveFragmentReward(session.root, session.levelId)
      : false;

    if (!this.isActive(session)) return showedReward;
    const shouldRedirect = options.redirect === "always"
      || (options.redirect === "if-reward" && showedReward);
    if (shouldRedirect) window.location.hash = "#/map";
    return showedReward;
  }

  isActive(session) {
    return this.session === session && !session.controller.signal.aborted;
  }

  applyActionLayout() {
    document.querySelector("#app")?.classList.add("app--fullbleed", "app--action-scene");
  }

  clearActionLayout() {
    document.querySelector("#app")?.classList.remove("app--action-scene", "app--fullbleed");
  }
}
