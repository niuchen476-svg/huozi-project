const DEFAULT_MAX_CHARACTERS = 40;
const OUTPUT_TITLES = {
  "departure-note": "我的出发札记",
  "exhibit-caption": "我的展品说明",
  "meeting-summary": "我的会议记录",
  "route-reflection": "我的路线思考",
  "action-telegram": "我的行动电报",
  "memory-card": "我的长征记忆",
  "exhibition-guide": "我的展台讲解",
};

export function getExpressionSources(experience) {
  return (experience?.phases?.sources?.items || [])
    .filter((source) => source.availableForAiExpression === true);
}

export function createExpressionPayload({ selectedSourceIds = [], selectedChoiceIds = [], userText = "", config = {} }) {
  return {
    sourceIds: [...new Set(selectedSourceIds)].slice(0, config.sourceSelectionLimit || 1),
    choiceIds: [...new Set(selectedChoiceIds)].slice(0, 6),
    userText: String(userText).trim(),
    outputType: config.outputType,
  };
}

export function createClientExpressionFallback(experience, payload) {
  const config = experience?.phases?.expression || {};
  const sources = getExpressionSources(experience);
  const selectedSource = sources.find((source) => payload.sourceIds?.includes(source.id));
  const template = config.fallbackTemplates?.find((item) => item?.title && item?.text);
  let text = template?.text || String(payload.userText || "").trim();
  if (!text && selectedSource) text = `我从《${selectedSource.title}》中，看见了历史选择背后的责任与坚持。`;
  if (!text) text = "我愿意记住这一段行程，也继续理解其中每一次选择的重量。";
  return {
    title: template?.title || OUTPUT_TITLES[config.outputType] || "我的长征表达",
    text: text.slice(0, config.ai?.maxOutputCharacters || 160),
    sourceIds: payload.sourceIds || [],
    label: config.outputLabel || "AI根据玩家选择生成",
    usedFallback: true,
  };
}

export function createLevelExpressionPanel(options = {}) {
  return new LevelExpressionPanel(options);
}

class LevelExpressionPanel {
  constructor({ experience, choices = [], onSubmit, onComplete } = {}) {
    this.experience = experience || {};
    this.config = this.experience.phases?.expression || {};
    this.sources = getExpressionSources(this.experience);
    this.choices = Array.isArray(choices) ? choices : [];
    this.onSubmit = typeof onSubmit === "function" ? onSubmit : null;
    this.onComplete = typeof onComplete === "function" ? onComplete : () => {};
    this.controller = new AbortController();
    this.element = this.build();
  }

  mount(container) {
    if (!container || typeof container.appendChild !== "function") {
      throw new Error("表达面板缺少合法的挂载容器");
    }
    container.appendChild(this.element);
    return this;
  }

  destroy() {
    this.controller.abort();
    this.element.remove();
  }

  build() {
    const section = document.createElement("section");
    section.className = "level-expression-panel";
    section.setAttribute("aria-labelledby", "level-expression-title");
    section.innerHTML = `
      <div class="level-expression-panel__heading">
        <p class="level-expression-panel__eyebrow">我的表达</p>
        <h2 id="level-expression-title">${this.escape(this.config.prompt || "这一关，你最想留下什么？")}</h2>
        <p>选择本关材料，也可以写一句自己的话。AI 只帮助整理，不替你作决定。</p>
      </div>
      <form class="level-expression-panel__form">
        <fieldset class="level-expression-panel__sources" ${this.sources.length ? "" : "hidden"}>
          <legend>选择史料（最多 ${this.config.sourceSelectionLimit || 1} 份）</legend>
          <div class="level-expression-panel__chips"></div>
        </fieldset>
        <fieldset class="level-expression-panel__choices" ${this.choices.length ? "" : "hidden"}>
          <legend>带上你的选择</legend>
          <div class="level-expression-panel__choice-list"></div>
        </fieldset>
        <label class="level-expression-panel__text-label" for="level-expression-input">我想说</label>
        <textarea id="level-expression-input" rows="3" maxlength="${this.maxCharacters}" placeholder="用一句话写下你的判断或感受"></textarea>
        <div class="level-expression-panel__counter" aria-live="polite"><span>0</span> / ${this.maxCharacters}</div>
        <p class="level-expression-panel__error" role="alert" hidden></p>
        <button class="level-expression-panel__submit" type="submit">生成我的表达</button>
      </form>
      <article class="level-expression-panel__result" aria-live="polite" hidden>
        <span class="level-expression-panel__label"></span>
        <h3></h3>
        <p></p>
        <small class="level-expression-panel__fallback" hidden>当前使用离线模板，体验不受影响。</small>
      </article>`;

    this.form = section.querySelector("form");
    this.textarea = section.querySelector("textarea");
    this.counter = section.querySelector(".level-expression-panel__counter span");
    this.error = section.querySelector(".level-expression-panel__error");
    this.submitButton = section.querySelector("button[type=submit]");
    this.result = section.querySelector(".level-expression-panel__result");
    this.renderSources(section.querySelector(".level-expression-panel__chips"));
    this.renderChoices(section.querySelector(".level-expression-panel__choice-list"));

    this.textarea.addEventListener("input", () => {
      this.counter.textContent = String(this.textarea.value.length);
      this.hideError();
    }, { signal: this.controller.signal });
    this.form.addEventListener("change", (event) => this.handleSelection(event), { signal: this.controller.signal });
    this.form.addEventListener("submit", (event) => this.handleSubmit(event), { signal: this.controller.signal });
    return section;
  }

  get maxCharacters() {
    return Math.min(Number(this.config.maxCharacters) || DEFAULT_MAX_CHARACTERS, 80);
  }

  renderSources(container) {
    for (const source of this.sources) {
      const label = document.createElement("label");
      label.className = "level-expression-panel__chip";
      label.innerHTML = `<input type="checkbox" name="sourceId" value="${this.escape(source.id)}"><span>${this.escape(source.title)}</span>`;
      container.appendChild(label);
    }
  }

  renderChoices(container) {
    for (const choice of this.choices) {
      if (!choice?.id || !choice?.label) continue;
      const label = document.createElement("label");
      label.className = "level-expression-panel__chip";
      label.innerHTML = `<input type="checkbox" name="choiceId" value="${this.escape(choice.id)}"><span>${this.escape(choice.label)}</span>`;
      container.appendChild(label);
    }
  }

  handleSelection(event) {
    if (event.target.name !== "sourceId" || !event.target.checked) return;
    const selected = [...this.form.querySelectorAll('input[name="sourceId"]:checked')];
    const limit = this.config.sourceSelectionLimit || 1;
    if (selected.length > limit) {
      event.target.checked = false;
      this.showError(`最多选择 ${limit} 份史料`);
    } else {
      this.hideError();
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    if (!this.onSubmit) {
      this.showError("表达服务尚未连接");
      return;
    }
    const payload = createExpressionPayload({
      selectedSourceIds: [...this.form.querySelectorAll('input[name="sourceId"]:checked')].map((input) => input.value),
      selectedChoiceIds: [...this.form.querySelectorAll('input[name="choiceId"]:checked')].map((input) => input.value),
      userText: this.textarea.value,
      config: this.config,
    });
    if (!payload.userText && !payload.sourceIds.length && !payload.choiceIds.length) {
      this.showError("请至少选择一项或写一句自己的话");
      this.textarea.focus();
      return;
    }

    this.hideError();
    this.submitButton.disabled = true;
    this.submitButton.textContent = "正在整理…";
    try {
      const value = await this.onSubmit(payload);
      this.showResult(value);
      await this.onComplete(value);
    } catch (err) {
      this.showError(err.message || "生成失败，请稍后重试");
    } finally {
      this.submitButton.disabled = false;
      this.submitButton.textContent = "重新生成";
    }
  }

  showResult(value) {
    this.result.querySelector(".level-expression-panel__label").textContent = value.label || "AI根据玩家选择生成";
    this.result.querySelector("h3").textContent = value.title || "我的表达";
    this.result.querySelector("p").textContent = value.text || "";
    this.result.querySelector(".level-expression-panel__fallback").hidden = value.usedFallback !== true;
    this.result.hidden = false;
    this.result.focus?.({ preventScroll: true });
  }

  showError(message) {
    this.error.textContent = message;
    this.error.hidden = false;
  }

  hideError() {
    this.error.hidden = true;
    this.error.textContent = "";
  }

  escape(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
}
