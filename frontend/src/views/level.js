import { fetchLevel, verifyInference } from "../api.js";
import { markCompleted, hasCrossedBridge, markBridgeCrossed } from "../state.js";
import { renderBridgeAction } from "./bridgeAction.js";

const VERDICT_LABEL = {
  supported: "✅ 有史料支持",
  partial: "⚠️ 部分成立、遗漏关键信息",
  refuted: "❌ 被证据反驳",
};

const ACTION_SCENES = {
  "luding-bridge": renderBridgeAction,
};

export async function renderLevelView(root, levelId) {
  const actionScene = ACTION_SCENES[levelId];
  const playedAction = actionScene && !hasCrossedBridge(levelId);
  if (playedAction) {
    await actionScene(root);
    markBridgeCrossed(levelId);
  }

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

  root.innerHTML = `
    <div class="view view-level">
      <a class="back-link" href="#/map">← 返回路线图</a>

      <header class="level-header">
        <p class="level-header__eyebrow">${level.date || ""}${level.location ? " · " + level.location : ""}</p>
        <h1>${level.title}</h1>
        ${playedAction ? `<p class="level-header__debrief">刚才你在枪林弹雨里做出的选择，现在用真实史料复盘检验一下。</p>` : ""}
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
          <h2 class="dossier__heading">${level.playerQuestion}</h2>
          <textarea id="inference-input" rows="6" placeholder="写下你的推断，可以引用具体的档案卡内容……"></textarea>
          <button id="submit-inference" type="button">提交推断，交付核验</button>
          <div id="verdict-panel" class="verdict-panel"></div>
        </section>
      </div>
    </div>
  `;

  document
    .querySelector("#submit-inference")
    .addEventListener("click", () => handleSubmit(levelId));
}

function renderCard(card) {
  return `
    <article class="archive-card">
      <img
        class="archive-card__image"
        src="${card.image}"
        alt="${card.title}"
        onerror="this.style.display='none'"
      />
      <h3 class="archive-card__title">${card.title}</h3>
      <p class="archive-card__text">${card.translation || card.rawText}</p>
    </article>
  `;
}

async function handleSubmit(levelId) {
  const input = document.querySelector("#inference-input");
  const panel = document.querySelector("#verdict-panel");
  const inference = input.value.trim();

  if (!inference) {
    panel.innerHTML = `<p class="error">请先写下你的推断</p>`;
    return;
  }

  panel.innerHTML = `<p class="loading">正在逐条核验……</p>`;

  try {
    const result = await verifyInference(levelId, inference);
    panel.innerHTML = renderVerdict(result);

    if (result.overallPassed) {
      markCompleted(levelId);
    }
  } catch (err) {
    panel.innerHTML = `<p class="error">核验失败：${err.message}</p>`;
  }
}

function renderVerdict(result) {
  const pointsHtml = result.points
    .map(
      (point) => `
      <li class="verdict-point verdict-point--${point.verdict}">
        <p class="verdict-point__claim">${point.claim}</p>
        <p class="verdict-point__label">${VERDICT_LABEL[point.verdict] || point.verdict}</p>
        <p class="verdict-point__evidence">${point.evidence}</p>
      </li>
    `
    )
    .join("");

  return `
    <ul class="verdict-list">${pointsHtml}</ul>
    <p class="verdict-summary">${result.summary}</p>
    <p class="verdict-overall verdict-overall--${result.overallPassed ? "pass" : "fail"}">
      ${result.overallPassed ? "证据链站得住脚，关卡解锁。" : "证据链尚未站住，修改推断后可重新提交。"}
    </p>
  `;
}
