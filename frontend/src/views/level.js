import { fetchLevel, preloadLevel, submitReflection } from "../api.js";
import { markCompleted, resetLevelProgress, hasCrossedBridge, markBridgeCrossed } from "../state.js";
import { preloadBridgeActionAssets, renderBridgeAction } from "./bridgeAction.js";
import { renderZunyiMeeting } from "./zunyiMeeting.js";
import { showArchiveFragmentReward } from "../archiveFragments.js";

const ACTION_SCENES = {
  "ruijin-departure": renderRuijinDepartureAction3dLazy,
  "xiangjiang-battle": renderXiangjiangBattleAction3dLazy,
  "luding-bridge": renderBridgeAction,
  "zunyi-turn": renderZunyiMeeting,
};

const actionSceneModulePromises = {};

async function renderRuijinDepartureAction3dLazy(root, level) {
  const { renderRuijinDepartureAction3d } = await loadAction3dModule("ruijin-departure");
  return renderRuijinDepartureAction3d(root, level);
}

async function renderXiangjiangBattleAction3dLazy(root, level) {
  const { renderXiangjiangBattleAction3d } = await loadAction3dModule("xiangjiang-battle");
  return renderXiangjiangBattleAction3d(root, level);
}

function loadAction3dModule(levelId) {
  if (levelId === "ruijin-departure") {
    actionSceneModulePromises[levelId] ||= import("./action3d/ruijinDeparture3d.js");
  }
  if (levelId === "xiangjiang-battle") {
    actionSceneModulePromises[levelId] ||= import("./action3d/xiangjiangBattle3d.js");
  }
  return actionSceneModulePromises[levelId];
}

export function preloadLevelResources(levelId) {
  preloadLevel(levelId);
  if (levelId === "ruijin-departure" || levelId === "xiangjiang-battle") {
    loadAction3dModule(levelId)?.catch(() => {
      delete actionSceneModulePromises[levelId];
    });
  }
  if (levelId === "luding-bridge") {
    preloadBridgeActionAssets();
  }
}

const POEM_FORMS = ["七律", "绝句", "词"];
const REPLAY_ACTION_LEVELS = new Set(["ruijin-departure", "xiangjiang-battle", "luding-bridge"]);

const SPECIAL_CHALLENGES = {
  "ruijin-departure": {
    type: "supply",
    title: "物资取舍",
    debrief: "你已经在夜色中收齐行军背包、家书和苏区地图。现在回到关卡任务：在出发前做一次关键取舍。",
    prompt: "只能优先带 3 件，选出最能支撑战略转移的物资。",
    required: ["map", "radio", "medical"],
    successTitle: "出发准备完成",
    successText: "地图保证路线判断，电台维持联络，急救包保护伤员。队伍可以继续向于都河推进。",
    errorText: "再想一想：长距离隐蔽转移最需要路线、联络和救护，不只是多带沉重物件。",
    options: [
      { id: "map", label: "苏区地图", detail: "辨认渡河点和封锁线" },
      { id: "radio", label: "电台电池", detail: "维持队伍联络" },
      { id: "medical", label: "急救包", detail: "照护伤员和病号" },
      { id: "cabinet", label: "沉重木柜", detail: "拖慢夜间行军" },
      { id: "copper", label: "多余铜锅", detail: "占用背包空间" },
      { id: "banner", label: "庆典彩旗", detail: "容易暴露目标" },
    ],
  },
  "xiangjiang-battle": {
    type: "sequence",
    title: "渡江行动排序",
    debrief: "你已经在江滩上收齐行军背包、战地书信和急救包。现在回到关卡任务：把抢渡行动排成正确顺序。",
    prompt: "按真实战斗逻辑排列 4 个行动环节。",
    required: ["seize", "bridge", "cover", "cross"],
    successTitle: "渡江组织完成",
    successText: "先抢占渡口，再架设通路，两翼阻击掩护，主力才能抓住窗口渡过湘江。",
    errorText: "顺序还不稳：湘江抢渡要先打开渡口和通路，再用阻击掩护主力过江。",
    options: [
      { id: "cover", label: "两翼阻击", detail: "拖住追击与压迫" },
      { id: "cross", label: "主力渡江", detail: "中央纵队与大部队通过" },
      { id: "seize", label: "抢占渡口", detail: "先把通道入口拿下来" },
      { id: "bridge", label: "架设通路", detail: "搭设和修复渡江通道" },
    ],
  },
};

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
  const replayAction = REPLAY_ACTION_LEVELS.has(levelId) || levelId === "zunyi-turn";
  const playedAction = actionScene && (replayAction || !hasCrossedBridge(levelId));
  let actionResult = null;

  if (playedAction) {
    app.classList.add("app--fullbleed", "app--action-scene");
    actionResult = await actionScene(root, level);
    app.classList.remove("app--fullbleed", "app--action-scene");

    if (levelId === "zunyi-turn") {
      markCompleted(levelId);
      await showArchiveFragmentReward(root, levelId);
      window.location.hash = "#/map";
      return;
    }

    if (levelId === "luding-bridge" && actionResult !== "skipped") {
      markCompleted(levelId);
      await showArchiveFragmentReward(root, levelId);
      window.location.hash = "#/map";
      return;
    }

    if (actionResult !== "skipped" && !replayAction) markBridgeCrossed(levelId);
  }

  const specialChallenge = SPECIAL_CHALLENGES[levelId];
  const completedAction = playedAction && actionResult !== "skipped";

  root.innerHTML = `
    <div class="view view-level">
      <a class="back-link" href="#/map">← 返回路线图</a>

      <header class="level-header">
        <p class="level-header__eyebrow">${level.date || ""}${level.location ? " · " + level.location : ""}</p>
        <h1>${level.title}</h1>
        ${completedAction ? `<p class="level-header__debrief">${specialChallenge?.debrief || level.actionDebrief || "刚才你在枪林弹雨里经历的这一切，现在写下你的感悟吧。"}</p>` : ""}
        <p class="level-header__scenario">${level.scenario}</p>
        <div class="level-header__actions">
          <button type="button" data-restart-level-page>重新挑战本关</button>
          <a href="#/map">返回路线图</a>
        </div>
      </header>

      <div class="dossier">
        <section class="dossier__cards">
          <h2 class="dossier__heading">档案卡</h2>
          <div class="card-list">
            ${level.cards.map(renderCard).join("")}
          </div>
        </section>

        ${specialChallenge ? renderSpecialChallenge(specialChallenge) : renderReflectionTask()}
      </div>
    </div>
  `;

  if (specialChallenge) {
    attachSpecialChallenge(root, levelId, specialChallenge);
  } else {
    document
      .querySelector("#submit-reflection")
      .addEventListener("click", () => handleSubmit(root, levelId));
  }

  root.querySelector("[data-restart-level-page]")?.addEventListener("click", () => restartLevel(root, levelId));
}

function renderReflectionTask() {
  return `
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
  `;
}

function renderSpecialChallenge(challenge) {
  return `
    <section class="dossier__inference mission-challenge mission-challenge--${challenge.type}">
      <h2 class="dossier__heading">${challenge.title}</h2>
      <p class="mission-challenge__prompt">${challenge.prompt}</p>
      ${challenge.type === "supply" ? renderSupplyChallenge(challenge) : renderSequenceChallenge(challenge)}
      <div id="challenge-panel" class="challenge-panel" aria-live="polite"></div>
    </section>
  `;
}

function renderSupplyChallenge(challenge) {
  return `
    <div class="mission-choice-grid">
      ${challenge.options
        .map(
          (option) => `
          <button type="button" class="mission-choice" data-choice="${option.id}">
            <span class="mission-choice__label">${option.label}</span>
            <span class="mission-choice__detail">${option.detail}</span>
          </button>
        `
        )
        .join("")}
    </div>
    <div class="mission-challenge__bar">
      <span data-challenge-status>已选择 0/${challenge.required.length}</span>
      <button type="button" data-submit-challenge disabled>确认取舍</button>
    </div>
  `;
}

function renderSequenceChallenge(challenge) {
  return `
    <div class="mission-sequence-slots">
      ${challenge.required
        .map((_, index) => `<span class="mission-sequence-slot" data-sequence-slot="${index}">${index + 1}</span>`)
        .join("")}
    </div>
    <div class="mission-choice-grid mission-choice-grid--sequence">
      ${challenge.options
        .map(
          (option) => `
          <button type="button" class="mission-choice" data-sequence-choice="${option.id}">
            <span class="mission-choice__label">${option.label}</span>
            <span class="mission-choice__detail">${option.detail}</span>
          </button>
        `
        )
        .join("")}
    </div>
    <div class="mission-challenge__bar">
      <span data-challenge-status>已排序 0/${challenge.required.length}</span>
      <div class="mission-challenge__actions">
        <button type="button" data-clear-sequence>清空顺序</button>
        <button type="button" data-submit-challenge disabled>确认行动</button>
      </div>
    </div>
  `;
}

function attachSpecialChallenge(root, levelId, challenge) {
  if (challenge.type === "supply") {
    attachSupplyChallenge(root, levelId, challenge);
    return;
  }
  attachSequenceChallenge(root, levelId, challenge);
}

function attachSupplyChallenge(root, levelId, challenge) {
  const selected = new Set();
  const buttons = [...root.querySelectorAll("[data-choice]")];
  const submit = root.querySelector("[data-submit-challenge]");
  const status = root.querySelector("[data-challenge-status]");
  const panel = root.querySelector("#challenge-panel");

  function update() {
    buttons.forEach((button) => {
      button.classList.toggle("mission-choice--selected", selected.has(button.dataset.choice));
    });
    status.textContent = `已选择 ${selected.size}/${challenge.required.length}`;
    submit.disabled = selected.size !== challenge.required.length;
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.choice;
      if (selected.has(id)) {
        selected.delete(id);
      } else if (selected.size < challenge.required.length) {
        selected.add(id);
      }
      panel.innerHTML = "";
      update();
    });
  });

  submit.addEventListener("click", () => {
    const correct = challenge.required.every((id) => selected.has(id)) && selected.size === challenge.required.length;
    if (correct) {
      completeSpecialChallenge(root, levelId, challenge);
    } else {
      panel.innerHTML = `<p class="challenge-feedback challenge-feedback--error">${challenge.errorText}</p>`;
    }
  });

  update();
}

function attachSequenceChallenge(root, levelId, challenge) {
  const order = [];
  const buttons = [...root.querySelectorAll("[data-sequence-choice]")];
  const submit = root.querySelector("[data-submit-challenge]");
  const clear = root.querySelector("[data-clear-sequence]");
  const status = root.querySelector("[data-challenge-status]");
  const slots = [...root.querySelectorAll("[data-sequence-slot]")];
  const panel = root.querySelector("#challenge-panel");

  function labelFor(id) {
    return challenge.options.find((option) => option.id === id)?.label || "";
  }

  function update() {
    slots.forEach((slot, index) => {
      slot.textContent = order[index] ? `${index + 1}. ${labelFor(order[index])}` : `${index + 1}`;
      slot.classList.toggle("mission-sequence-slot--filled", Boolean(order[index]));
    });
    buttons.forEach((button) => {
      const chosen = order.includes(button.dataset.sequenceChoice);
      button.classList.toggle("mission-choice--selected", chosen);
      button.disabled = chosen;
    });
    status.textContent = `已排序 ${order.length}/${challenge.required.length}`;
    submit.disabled = order.length !== challenge.required.length;
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      if (order.length >= challenge.required.length) return;
      order.push(button.dataset.sequenceChoice);
      panel.innerHTML = "";
      update();
    });
  });

  clear.addEventListener("click", () => {
    order.length = 0;
    panel.innerHTML = "";
    update();
  });

  submit.addEventListener("click", () => {
    const correct = challenge.required.every((id, index) => order[index] === id);
    if (correct) {
      completeSpecialChallenge(root, levelId, challenge);
    } else {
      panel.innerHTML = `<p class="challenge-feedback challenge-feedback--error">${challenge.errorText}</p>`;
    }
  });

  update();
}

function completeSpecialChallenge(root, levelId, challenge) {
  markCompleted(levelId);
  const panel = root.querySelector("#challenge-panel");
  panel.innerHTML = `
    <div class="challenge-complete">
      <p class="challenge-complete__eyebrow">关卡完成</p>
      <h3>${challenge.successTitle}</h3>
      <p>${challenge.successText}</p>
      <div class="level-complete-actions">
        <button type="button" data-restart-level>重来</button>
        <a href="#/map">返回路线图</a>
      </div>
    </div>
  `;
  panel.querySelector("[data-restart-level]")?.addEventListener("click", () => restartLevel(root, levelId));
}

function restartLevel(root, levelId) {
  resetLevelProgress(levelId);
  window.scrollTo({ top: 0, behavior: "auto" });
  renderLevelView(root, levelId);
}

function renderCard(card) {
  return `
    <article class="archive-card">
      <img
        class="archive-card__image"
        src="${card.image.replace(/^\//, "")}"
        alt="${card.title}"
        loading="lazy"
        decoding="async"
        onerror="this.style.display='none'"
      />
      <h3 class="archive-card__title">${card.title}</h3>
      <p class="archive-card__text">${card.translation || card.rawText}</p>
    </article>
  `;
}

async function handleSubmit(root, levelId) {
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
    panel.querySelector("[data-restart-level]")?.addEventListener("click", () => restartLevel(root, levelId));
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
    <div class="level-complete-actions">
      <button type="button" data-restart-level>重来</button>
      <a href="#/map">返回路线图</a>
    </div>
  `;
}
