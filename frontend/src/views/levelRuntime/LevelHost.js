import { fetchLevel, fetchLevelExperience, submitLevelExpression } from "../../api.js";
import { markCompleted, resetLevelProgress } from "../../state.js";
import { showArchiveFragmentReward } from "../../archiveFragments.js";
import { getLevelAdapter } from "./registry.js";
import { assertLevelResult, LEVEL_STATUS } from "./protocol.js";
import { createLevelSourceDrawer } from "./sourceDrawer.js";
import {
  createClientExpressionFallback,
  createLevelExpressionPanel,
} from "./expressionPanel.js";

export class LevelHost {
  constructor({ renderDossier }) {
    this.renderDossier = renderDossier;
    this.session = null;
  }

  dispose() {
    if (!this.session) return;
    this.session.disposing = true;
    this.session.sourceDrawer?.destroy();
    this.session.expressionPanel?.destroy();
    this.restoreRuntimeAudio(this.session);
    this.session.controller.abort();
    this.session.adapter?.dispose?.(this.session.context);
    this.session.root?._challengeKeyboardAbort?.abort();
    this.clearActionLayout();
    this.session = null;
  }

  async render(root, levelId) {
    this.dispose();
    const controller = new AbortController();
    const session = {
      root,
      levelId,
      controller,
      adapter: null,
      context: null,
      experience: null,
      sourceDrawer: null,
      expressionPanel: null,
      expressionCompleted: false,
      result: null,
      overlays: new Set(),
      bgmVolume: null,
      disposing: false,
    };
    this.session = session;

    root.innerHTML = `
      <div class="view view-level">
        <p class="loading">正在调阅档案卷宗...</p>
      </div>
    `;

    let level;
    let experience;
    let adapter;
    try {
      [level, experience, adapter] = await Promise.all([
        fetchLevel(levelId),
        fetchLevelExperience(levelId).catch((error) => {
          console.warn(`[level-host] ${levelId} 第二期配置加载失败，将保持一期流程`, error);
          return null;
        }),
        getLevelAdapter(levelId),
      ]);
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
    session.experience = experience;
    const context = {
      root,
      level,
      levelId,
      experience,
      signal: controller.signal,
      runtime: this.createRuntimeApi(session),
    };
    session.adapter = adapter;
    session.context = context;
    this.mountSourceDrawer(session);

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
      // 跳转可能已经销毁了当前会话并由新页面接管 #app。
      // 此时旧异步任务不能再移除路线图刚设置的全屏类。
      if (this.isActive(session)) this.clearActionLayout();
    }

    if (!this.isActive(session) || result.status === LEVEL_STATUS.CANCELLED) return;
    session.result = result;

    if (result.status === LEVEL_STATUS.COMPLETED) {
      if (this.isExpressionEnabled(session)) {
        this.renderExpressionPhase(session, { reward: true, redirect: "if-reward" });
        return;
      }
      await this.completeLevel(session, { reward: true, redirect: "always" });
      return;
    }

    const useUnifiedExpression = this.isExpressionEnabled(session);
    this.renderDossier({
      root,
      level,
      challenge: adapter.challenge || null,
      completedAction: result.actionCompleted,
      useUnifiedExpression,
      onRestart: () => this.restart(session),
      onComplete: (options) => {
        if (useUnifiedExpression && !session.expressionCompleted) {
          this.mountExpressionInDossier(session, options);
          return { deferred: true };
        }
        return this.completeLevel(session, options);
      },
    });
    if (useUnifiedExpression && !adapter.challenge) {
      this.mountExpressionInDossier(session, { reward: true, redirect: "if-reward" });
    }
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

  isExpressionEnabled(session) {
    return session.experience?.phases?.expression?.enabled === true;
  }

  mountSourceDrawer(session) {
    const config = session.experience?.sourceDrawer;
    const sources = session.experience?.phases?.sources?.items || [];
    if (!config?.enabled || !sources.some((source) => source.visibleInSourceDrawer === true)) return;
    session.sourceDrawer = createLevelSourceDrawer({
      title: config.title,
      sources,
      maxItems: config.maxItems,
      onOpenChange: (open) => this.setOverlayOpen(session, "source-drawer", open),
    }).mount(document.body);
  }

  createRuntimeApi(session) {
    const host = this;
    return Object.freeze({
      get paused() {
        return session.overlays.size > 0;
      },
      setOverlayOpen(id, open) {
        host.setOverlayOpen(session, id, open);
      },
    });
  }

  setOverlayOpen(session, id, open) {
    if (!id || session.disposing) return;
    const wasPaused = session.overlays.size > 0;
    if (open) session.overlays.add(id);
    else session.overlays.delete(id);
    const paused = session.overlays.size > 0;
    if (paused === wasPaused) return;

    session.root.classList.toggle("level-runtime--overlay-open", paused);
    this.setRuntimeAudioDucked(session, paused);
    const hook = paused ? session.adapter?.pause : session.adapter?.resume;
    Promise.resolve(hook?.(session.context)).catch((error) => {
      console.warn(`[level-host] ${session.levelId} ${paused ? "pause" : "resume"} 钩子失败`, error);
    });
    document.dispatchEvent(new CustomEvent("levelhost:pausechange", {
      detail: { levelId: session.levelId, paused, reason: id },
    }));
  }

  setRuntimeAudioDucked(session, ducked) {
    const bgm = document.querySelector("#bgm");
    if (!bgm) return;
    if (ducked && session.bgmVolume === null) {
      session.bgmVolume = bgm.volume;
      bgm.volume = Math.max(0, Math.min(1, session.bgmVolume * 0.3));
    } else if (!ducked) {
      this.restoreRuntimeAudio(session);
    }
  }

  restoreRuntimeAudio(session) {
    const bgm = document.querySelector("#bgm");
    if (bgm && session.bgmVolume !== null) bgm.volume = session.bgmVolume;
    session.bgmVolume = null;
    session.overlays.clear();
    session.root?.classList.remove("level-runtime--overlay-open");
  }

  renderExpressionPhase(session, completionOptions) {
    session.root.innerHTML = `
      <div class="view view-level level-expression-phase">
        <a class="back-link" href="#/map">← 返回路线图</a>
        <div data-level-expression-slot></div>
      </div>
    `;
    this.mountExpressionPanel(
      session,
      session.root.querySelector("[data-level-expression-slot]"),
      completionOptions
    );
  }

  mountExpressionInDossier(session, completionOptions = {}) {
    if (session.expressionPanel || !this.isActive(session)) return;
    let slot = session.root.querySelector("[data-level-expression-slot]");
    if (!slot) {
      const section = document.createElement("section");
      section.className = "dossier__inference dossier__inference--expression";
      section.dataset.levelExpressionSlot = "";
      session.root.querySelector(".dossier")?.appendChild(section);
      slot = section;
    }
    if (!slot) return;
    this.mountExpressionPanel(session, slot, {
      reward: true,
      redirect: "if-reward",
      ...completionOptions,
    });
    window.requestAnimationFrame(() => slot.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  mountExpressionPanel(session, container, completionOptions) {
    const choices = Array.isArray(session.result?.data?.expressionChoices)
      ? session.result.data.expressionChoices
      : Array.isArray(session.context?.expressionChoices)
        ? session.context.expressionChoices
        : [];
    session.expressionPanel = createLevelExpressionPanel({
      experience: session.experience,
      choices,
      onSubmit: async (payload) => {
        try {
          return await submitLevelExpression(session.levelId, payload);
        } catch (error) {
          console.warn(`[level-host] ${session.levelId} 表达接口不可用，使用本地模板`, error);
          return createClientExpressionFallback(session.experience, payload);
        }
      },
      onComplete: async () => {
        session.expressionCompleted = true;
        const showedReward = await this.completeLevel(session, completionOptions);
        if (!showedReward && this.isActive(session)) this.appendCompletionActions(session);
      },
    }).mount(container);
  }

  appendCompletionActions(session) {
    const result = session.expressionPanel?.result;
    if (!result || result.querySelector("[data-expression-complete-actions]")) return;
    const actions = document.createElement("div");
    actions.className = "level-complete-actions";
    actions.dataset.expressionCompleteActions = "";
    actions.innerHTML = `
      <button type="button" data-restart-level>重来</button>
      <a href="#/map">返回路线图</a>
    `;
    actions.querySelector("[data-restart-level]")?.addEventListener("click", () => this.restart(session));
    result.appendChild(actions);
  }

  applyActionLayout() {
    document.querySelector("#app")?.classList.add("app--fullbleed", "app--action-scene");
  }

  clearActionLayout() {
    document.querySelector("#app")?.classList.remove("app--action-scene", "app--fullbleed");
  }
}
