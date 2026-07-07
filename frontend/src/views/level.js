import { fetchLevel, submitReflection } from "../api.js";
import { markCompleted, hasCrossedBridge, markBridgeCrossed } from "../state.js";
import { renderBridgeAction } from "./bridgeAction.js";

const ACTION_SCENES = {
  "ruijin-departure": renderCampaignAction3dLazy,
  "xiangjiang-battle": renderCampaignAction3dLazy,
  "luding-bridge": renderBridgeAction,
};

async function renderCampaignAction3dLazy(root, level) {
  const { renderCampaignAction3d } = await import("./campaignAction3d.js");
  return renderCampaignAction3d(root, level);
}

const POEM_FORMS = ["七律", "绝句", "词"];

export async function renderLevelView(root, levelId) {
  const app = document.querySelector("#app");

  root.innerHTML = `
    <div class="view view-level">
      <p class="loading">正在调阅档案卷宗...</p>
    </div>
  `;

  let level;
  try {
    level = await fetchLevel(levelId);
  } catch (err) {
    root.innerHTML = `
      <div class="view view-level">
        <p class="error">关卡加载失败</p>
        <a class="back-link" href="#/map">← 返回路线图</a>
      </div>
    `;
    return;
  }

  const actionScene = ACTION_SCENES[levelId];
  const playedAction = actionScene && !hasCrossedBridge(levelId);

  if (playedAction) {
    app.classList.add("app--fullbleed", "app--action-scene");
    await actionScene(root, level);
    markBridgeCrossed(levelId);
    app.classList.remove("app--fullbleed", "app--action-scene");
  }

  root.innerHTML = `
    <div class="view view-level">
      <a class="back-link" href="#/map">← 返回路线图</a>

      <header class="level-header">
        <p class="level-header__eyebrow">${level.date || ""}${level.location ? " · " + level.location : ""}</p>
        <h1>${level.title}</h1>
        ${playedAction ? `<p class="level-header__debrief">${level.actionDebrief || "刚才你在枪林弹雨里经历的这一切，现在写下你的感悟吧。"}</p>` : ""}
        <p class="level-header__scenario">${level.scenario}</p>
      </header>

      <div class="dossier">
        <section class="dossier__cards">
          <h2 class="dossier__heading">档案卡</h2>
          <div class="card-list">
            ${level.cards.map(renderCard).join("")}
          </div>
        </section>

        <section class="dossier__inference">
          <h2 class="dossier__heading">写下你此刻的感悟</h2>
          <textarea id="reflection-input" rows="6" placeholder="经历了这一切，你有什么感想？"></textarea>

          <div class="poem-form-picker">
            <span class="poem-form-picker__label">选择诗词形式：</span>
            ${POEM_FORMS.map(
              (form, i) => `
              <label class="poem-form-picker__option">
                <input type="radio" name="poem-form" value="${form}" ${i === 0 ? "checked" : ""} />
                <span>${form}</span>
              </label>
            `
            ).join("")}
          </div>

          <button id="submit-reflection" type="button">提交感悟，请 AI 赋诗</button>
          <div id="reflection-panel" class="reflection-panel"></div>
        </section>
      </div>
    </div>
  `;

  document
    .querySelector("#submit-reflection")
    .addEventListener("click", () => handleSubmit(levelId));
}

function renderCard(card) {
  return `
    <article class="archive-card">
      <img
        class="archive-card__image"
        src="${card.image.replace(/^\//, "")}"
        alt="${card.title}"
        onerror="this.style.display='none'"
      />
      <h3 class="archive-card__title">${card.title}</h3>
      <p class="archive-card__text">${card.translation || card.rawText}</p>
    </article>
  `;
}

async function handleSubmit(levelId) {
  const input = document.querySelector("#reflection-input");
  const panel = document.querySelector("#reflection-panel");
  const form = document.querySelector('input[name="poem-form"]:checked').value;
  const reflection = input.value.trim();

  if (!reflection) {
    panel.innerHTML = `<p class="error">请先写下你的感悟</p>`;
    return;
  }

  panel.innerHTML = `<p class="loading">AI 正在构思……</p>`;

  try {
    const result = await submitReflection(levelId, reflection, form);
    panel.innerHTML = renderPoem(result);
    markCompleted(levelId);
  } catch (err) {
    panel.innerHTML = `<p class="error">生成失败：${err.message}</p>`;
  }
}

function renderPoem(result) {
  const lines = (result.poemBody || "")
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => `<p class="poem-line">${line.trim()}</p>`)
    .join("");

  return `
    <p class="reflection-commentary">${result.commentary}</p>
    <div class="poem-card">
      <p class="poem-card__form">${result.poemForm}</p>
      <h3 class="poem-card__title">${result.poemTitle}</h3>
      ${lines}
    </div>
  `;
}
