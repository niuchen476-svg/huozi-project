import { createSceneController } from "./historicalMissionControllers.js";
import {
  applySceneBackdrop,
  preloadSceneImages,
  renderKeyCommand,
  renderSource,
  renderStory,
  renderTimeline,
} from "./historicalMissionUi.js";
import { applyLevelFeedback } from "../levelRuntime/feedbackSystem.js";
import { resolveLevelSource } from "../levelRuntime/sourceRegistry.js";

export function renderHistoricalMission25d(root, level, config, experience = null) {
  if (!config?.scenes?.length) return Promise.resolve();

  preloadSceneImages(config.scenes);

  return new Promise((resolve) => {
    root.innerHTML = `
      <div class="view view-historical-mission">
        <main class="historical-mission historical-mission--${config.theme}" id="historical-mission">
          <a class="historical-mission__back" href="#/map">返回路线图</a>
          <section class="historical-mission__stage" id="historical-stage" tabindex="0">
            <div class="historical-mission__backdrop" id="historical-backdrop" role="img"></div>
            <div class="historical-mission__atmosphere" aria-hidden="true"></div>
            <div class="historical-mission__scrim" aria-hidden="true"></div>

            <header class="historical-mission__topbar" id="historical-topbar" hidden>
              <div class="historical-mission__identity">
                <span>${level.title}</span>
                <b id="historical-scene-counter">1 / ${config.scenes.length}</b>
              </div>
              <ol class="historical-mission__timeline" id="historical-timeline">
                ${config.scenes.map((scene, index) => `
                  <li data-timeline-step="${index}">
                    <i>${index + 1}</i>
                    <span>${scene.shortTitle || scene.title}</span>
                  </li>
                `).join("")}
              </ol>
              <span class="historical-mission__status" id="historical-status"></span>
            </header>

            <aside class="historical-mission__story" id="historical-story" hidden></aside>
            <div class="historical-mission__hotspots" id="historical-hotspots"></div>
            <section class="historical-mission__task" id="historical-task" hidden></section>
            <div class="historical-mission__feedback" id="historical-feedback" data-level-feedback data-feedback-tone="neutral" hidden></div>
            <div class="historical-mission__overlay" id="historical-overlay" hidden></div>

            <section class="historical-mission__intro" id="historical-intro">
              <p class="historical-mission__eyebrow">${level.date || ""}${level.location ? " · " + level.location : ""}</p>
              <h1>${level.title}</h1>
              <p>${level.scenario}</p>
              <div class="historical-mission__intro-actions">
                ${renderKeyCommand("Enter", config.introButton || "进入历史现场", "", 'data-mission-action="start"')}
                ${renderKeyCommand("S", "直接查看档案", "secondary", 'data-mission-action="skip"')}
              </div>
            </section>
          </section>
        </main>
      </div>
    `;

    const nodes = {
      shell: root.querySelector("#historical-mission"),
      stage: root.querySelector("#historical-stage"),
      backdrop: root.querySelector("#historical-backdrop"),
      topbar: root.querySelector("#historical-topbar"),
      timeline: root.querySelector("#historical-timeline"),
      sceneCounter: root.querySelector("#historical-scene-counter"),
      status: root.querySelector("#historical-status"),
      story: root.querySelector("#historical-story"),
      hotspots: root.querySelector("#historical-hotspots"),
      task: root.querySelector("#historical-task"),
      feedback: root.querySelector("#historical-feedback"),
      overlay: root.querySelector("#historical-overlay"),
      intro: root.querySelector("#historical-intro"),
    };

    let sceneIndex = 0;
    let controller = null;
    let feedbackTimer = null;
    let settled = false;
    let introOpen = true;
    let overlayAction = null;

    applySceneBackdrop(nodes, config.scenes[0]);
    nodes.stage.focus({ preventScroll: true });

    function finish(value) {
      if (settled) return;
      settled = true;
      controller?.cleanup();
      clearTimeout(feedbackTimer);
      resolve(value);
    }

    function startMission() {
      if (!introOpen) return;
      introOpen = false;
      nodes.stage.dispatchEvent(new CustomEvent("levelruntime:phase", {
        bubbles: true,
        detail: { phase: "gameplay" },
      }));
      nodes.intro.remove();
      window.scrollTo({ top: 0, behavior: "auto" });
      nodes.topbar.hidden = false;
      nodes.story.hidden = false;
      nodes.task.hidden = false;
      renderScene();
    }

    function renderScene() {
      controller?.cleanup();
      controller = null;
      overlayAction = null;
      nodes.overlay.hidden = true;
      nodes.hotspots.replaceChildren();
      nodes.task.replaceChildren();
      nodes.stage.className = "historical-mission__stage";

      const originalScene = config.scenes[sceneIndex];
      const scene = {
        ...originalScene,
        source: resolveLevelSource(experience, originalScene.sourceId || originalScene.source),
      };
      nodes.stage.classList.add(`historical-mission__stage--${scene.type}`, `historical-mission__stage--${scene.id}`);
      applySceneBackdrop(nodes, scene);
      renderTimeline(nodes, config.scenes, sceneIndex);
      nodes.sceneCounter.textContent = `${sceneIndex + 1} / ${config.scenes.length}`;
      nodes.status.textContent = scene.statusLabel || "任务进行中";
      nodes.story.innerHTML = renderStory(scene, sceneIndex, config.scenes.length);

      controller = createSceneController(scene, {
        nodes,
        report,
        setStatus(text) {
          nodes.status.textContent = text;
        },
        complete(summary) {
          completeScene(scene, summary);
        },
        fail(reason) {
          failScene(reason);
        },
      });
    }

    function completeScene(scene, summary) {
      controller?.cleanup();
      controller = null;
      nodes.stage.classList.remove("historical-mission__stage--danger", "historical-mission__stage--impact");
      const isLast = sceneIndex === config.scenes.length - 1;
      const nextLabel = isLast ? "完成本关行动" : "进入下一幕";

      showOverlay(`
        <div class="historical-mission__result historical-mission__result--success">
          <p>第 ${sceneIndex + 1} 幕完成</p>
          <h2>${scene.completeTitle || scene.title}</h2>
          <div class="historical-mission__result-summary">${summary || scene.completeText || "任务完成。"}</div>
          <div class="historical-mission__fact">
            <span>史实节点</span>
            <p>${scene.fact}</p>
          </div>
          ${renderSource(scene.source)}
          ${renderKeyCommand("Enter", nextLabel, "", 'data-mission-action="overlay"')}
        </div>
      `, () => {
        if (isLast) {
          showMissionComplete();
          return;
        }
        sceneIndex += 1;
        window.scrollTo({ top: 0, behavior: "auto" });
        renderScene();
      });
    }

    function failScene(reason) {
      controller?.cleanup();
      controller = null;
      showOverlay(`
        <div class="historical-mission__result historical-mission__result--retry">
          <p>本幕需要重新组织</p>
          <h2>任务没有完成</h2>
          <div class="historical-mission__result-summary">${reason}</div>
          ${renderKeyCommand("Enter", "重新执行本幕", "", 'data-mission-action="overlay"')}
        </div>
      `, renderScene);
    }

    function showMissionComplete() {
      nodes.stage.classList.add("historical-mission__stage--complete");
      showOverlay(`
        <div class="historical-mission__result historical-mission__result--mission-complete">
          <p>历史行动完成</p>
          <h2>${config.completionTitle}</h2>
          <div class="historical-mission__result-summary">${config.completionText}</div>
          ${renderKeyCommand("Enter", "进入本关档案任务", "", 'data-mission-action="overlay"')}
        </div>
      `, () => finish());
    }

    function showOverlay(markup, action) {
      nodes.overlay.innerHTML = markup;
      nodes.overlay.hidden = false;
      overlayAction = action || null;
      nodes.stage.focus({ preventScroll: true });
    }

    function report(text, tone = "neutral", duration = 1700) {
      nodes.feedback.className = `historical-mission__feedback historical-mission__feedback--${tone}`;
      applyLevelFeedback(nodes.feedback, { message: text, tone });
      clearTimeout(feedbackTimer);
      feedbackTimer = setTimeout(() => {
        nodes.feedback.hidden = true;
      }, duration);
    }

    function onGlobalKeyDown(event) {
      if (settled) return;
      if (introOpen) {
        if (event.key === "Enter") {
          event.preventDefault();
          startMission();
        }
        if (event.key.toLowerCase() === "s") {
          event.preventDefault();
          finish("skipped");
        }
        return;
      }
      if (overlayAction && event.key === "Enter") {
        event.preventDefault();
        const action = overlayAction;
        overlayAction = null;
        action();
      }
    }

    function onMissionClick(event) {
      const command = event.target.closest("[data-mission-action]");
      if (!command || settled) return;
      const actionName = command.dataset.missionAction;
      if (actionName === "start") {
        startMission();
        return;
      }
      if (actionName === "skip") {
        finish("skipped");
        return;
      }
      if (actionName === "overlay" && overlayAction) {
        const action = overlayAction;
        overlayAction = null;
        action();
      }
    }

    window.addEventListener("keydown", onGlobalKeyDown);
    nodes.stage.addEventListener("click", onMissionClick);

    const originalFinish = finish;
    finish = (value) => {
      window.removeEventListener("keydown", onGlobalKeyDown);
      nodes.stage.removeEventListener("click", onMissionClick);
      originalFinish(value);
    };
  });
}
