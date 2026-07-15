import { submitReflection } from "../api.js";
import { createCompletionRecap } from "./levelRuntime/completionRecap.js";

const POEM_FORMS = ["七律", "绝句", "词"];
export function renderLevelDossier({
  root,
  level,
  experience,
  challenge: specialChallenge,
  completedAction,
  useUnifiedExpression = false,
  onRestart,
  onComplete,
}) {
  root.innerHTML = `
    <div class="view view-level">
      <a class="back-link" href="#/map">← 返回路线图</a>

      <header class="level-header" data-level-recap-header>
        <div data-level-completion-recap-slot></div>
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

        ${specialChallenge
          ? renderSpecialChallenge(specialChallenge)
          : useUnifiedExpression
            ? `<section class="dossier__inference dossier__inference--expression" data-level-expression-slot></section>`
            : renderReflectionTask()}
      </div>
    </div>
  `;

  root.querySelector("[data-level-completion-recap-slot]")?.replaceWith(
    createCompletionRecap({
      level,
      experience,
      debrief: completedAction
        ? specialChallenge?.debrief || level.actionDebrief
        : "行动已经结束。现在回到档案卡，用材料检查刚才的判断。",
      variant: "dossier",
    })
  );

  if (specialChallenge) {
    attachSpecialChallenge(root, specialChallenge, { onRestart, onComplete });
  } else if (!useUnifiedExpression) {
    root.querySelector("#submit-reflection")
      .addEventListener("click", () => handleSubmit(root, level.levelId, { onRestart, onComplete }));
  }

  root.querySelector("[data-restart-level-page]")?.addEventListener("click", onRestart);
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
          (option, index) => `
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
      <span class="mission-challenge__keys">选择三张卡片，再确认取舍</span>
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
          (option, index) => `
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
      <span class="mission-challenge__keys">依次选择卡片，再确认行动</span>
      <div class="mission-challenge__actions">
        <button type="button" data-clear-sequence>清空顺序</button>
        <button type="button" data-submit-challenge disabled>确认行动</button>
      </div>
    </div>
  `;
}

function attachSpecialChallenge(root, challenge, callbacks) {
  if (challenge.type === "supply") {
    attachSupplyChallenge(root, challenge, callbacks);
    return;
  }
  attachSequenceChallenge(root, challenge, callbacks);
}

function attachSupplyChallenge(root, challenge, callbacks) {
  const selected = new Set();
  const buttons = [...root.querySelectorAll("[data-choice]")];
  const submit = root.querySelector("[data-submit-challenge]");
  const status = root.querySelector("[data-challenge-status]");
  const panel = root.querySelector("#challenge-panel");
  const keyboardSignal = createChallengeKeyboardSignal(root);

  function update() {
    buttons.forEach((button) => {
      button.classList.toggle("mission-choice--selected", selected.has(button.dataset.choice));
    });
    status.textContent = `已选择 ${selected.size}/${challenge.required.length}`;
    submit.disabled = selected.size !== challenge.required.length;
  }

  function toggleChoice(id) {
    if (selected.has(id)) {
      selected.delete(id);
    } else if (selected.size < challenge.required.length) {
      selected.add(id);
    }
    panel.innerHTML = "";
    update();
  }

  function submitChoice() {
    const correct = challenge.required.every((id) => selected.has(id)) && selected.size === challenge.required.length;
    if (correct) {
      completeSpecialChallenge(root, challenge, callbacks);
    } else {
      panel.innerHTML = `<p class="challenge-feedback challenge-feedback--error" data-level-feedback data-feedback-tone="error" role="alert">${challenge.errorText}</p>`;
    }
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => toggleChoice(button.dataset.choice));
  });

  submit.addEventListener("click", submitChoice);
  window.addEventListener("keydown", (event) => {
    const number = challengeNumberKey(event);
    if (number && buttons[number - 1]) {
      event.preventDefault();
      toggleChoice(buttons[number - 1].dataset.choice);
    }
    if (event.key === "Enter" && !submit.disabled) {
      event.preventDefault();
      submitChoice();
    }
  }, { signal: keyboardSignal });

  update();
}

function attachSequenceChallenge(root, challenge, callbacks) {
  const order = [];
  const buttons = [...root.querySelectorAll("[data-sequence-choice]")];
  const submit = root.querySelector("[data-submit-challenge]");
  const clear = root.querySelector("[data-clear-sequence]");
  const status = root.querySelector("[data-challenge-status]");
  const slots = [...root.querySelectorAll("[data-sequence-slot]")];
  const panel = root.querySelector("#challenge-panel");
  const keyboardSignal = createChallengeKeyboardSignal(root);

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

  function addChoice(id) {
    if (order.length >= challenge.required.length || order.includes(id)) return;
    order.push(id);
    panel.innerHTML = "";
    update();
  }

  function clearOrder() {
    order.length = 0;
    panel.innerHTML = "";
    update();
  }

  function submitOrder() {
    const correct = challenge.required.every((id, index) => order[index] === id);
    if (correct) {
      completeSpecialChallenge(root, challenge, callbacks);
    } else {
      panel.innerHTML = `<p class="challenge-feedback challenge-feedback--error" data-level-feedback data-feedback-tone="error" role="alert">${challenge.errorText}</p>`;
    }
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => addChoice(button.dataset.sequenceChoice));
  });

  clear.addEventListener("click", clearOrder);
  submit.addEventListener("click", submitOrder);
  window.addEventListener("keydown", (event) => {
    const number = challengeNumberKey(event);
    if (number && buttons[number - 1]) {
      event.preventDefault();
      addChoice(buttons[number - 1].dataset.sequenceChoice);
    }
    if (event.key === "Backspace") {
      event.preventDefault();
      clearOrder();
    }
    if (event.key === "Enter" && !submit.disabled) {
      event.preventDefault();
      submitOrder();
    }
  }, { signal: keyboardSignal });

  update();
}

function createChallengeKeyboardSignal(root) {
  root._challengeKeyboardAbort?.abort();
  root._challengeKeyboardAbort = new AbortController();
  return root._challengeKeyboardAbort.signal;
}

function challengeNumberKey(event) {
  if (/^Digit[1-9]$/.test(event.code)) return Number(event.code.replace("Digit", ""));
  if (/^Numpad[1-9]$/.test(event.code)) return Number(event.code.replace("Numpad", ""));
  return null;
}

async function completeSpecialChallenge(root, challenge, { onRestart, onComplete }) {
  root._challengeKeyboardAbort?.abort();
  const panel = root.querySelector("#challenge-panel");
  panel.innerHTML = `
    <div class="challenge-complete">
      <p class="challenge-complete__eyebrow">关卡完成</p>
      <h3>${challenge.successTitle}</h3>
      <p>${challenge.successText}</p>
      <div class="level-complete-actions">
        <a class="level-complete-actions__primary" href="#/map">完成并返回路线图</a>
        <button class="level-complete-actions__secondary" type="button" data-restart-level>再体验一次</button>
      </div>
    </div>
  `;
  panel.querySelector("[data-restart-level]")?.addEventListener("click", onRestart);
  const completion = await onComplete({ reward: true, redirect: "if-reward" });
  if (completion?.deferred) {
    panel.querySelector(".challenge-complete__eyebrow").textContent = "行动完成";
    panel.querySelector(".level-complete-actions")?.remove();
  }
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

async function handleSubmit(root, levelId, { onRestart, onComplete }) {
  const input = root.querySelector("#reflection-input");
  const panel = root.querySelector("#reflection-panel");
  const form = root.querySelector('input[name="poem-form"]:checked').value;
  const reflection = input.value.trim();

  if (!reflection) {
    panel.innerHTML = `<p class="error">请先写下你的感悟</p>`;
    return;
  }

  panel.innerHTML = `<p class="loading">AI 正在构思……</p>`;

  try {
    const result = await submitReflection(levelId, reflection, form);
    panel.innerHTML = renderPoem(result);
    await onComplete();
    panel.querySelector("[data-restart-level]")?.addEventListener("click", onRestart);
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
      <a class="level-complete-actions__primary" href="#/map">完成并返回路线图</a>
      <button class="level-complete-actions__secondary" type="button" data-restart-level>再体验一次</button>
    </div>
  `;
}
