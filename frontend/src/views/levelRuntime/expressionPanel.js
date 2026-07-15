import { createLevelArtworkPanel } from "./artworkPanel.js";

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

const OUTPUT_ACTIONS = {
  "departure-note": "生成出发札记",
  "exhibit-caption": "生成展品说明",
  "meeting-summary": "生成会议记录",
  "route-reflection": "生成路线思考",
  "action-telegram": "生成行动电报",
  "memory-card": "生成记忆卡",
  "exhibition-guide": "生成展台讲解",
};

const OUTPUT_PLACEHOLDERS = {
  "departure-note": "写一句出发前最想留下的话",
  "exhibit-caption": "写下你希望观众看懂的代价",
  "meeting-summary": "写下你认为会议改变的关键",
  "route-reflection": "写下你对路线变化的理解",
  "action-telegram": "用一句短报告写下行动与感受",
  "memory-card": "从一个人或一件事写起",
  "exhibition-guide": "写下你的展台最想告诉观众什么",
};

export function getExpressionSources(experience) {
  return (experience?.phases?.sources?.items || [])
    .filter((source) => source.availableForAiExpression === true);
}

export function getExpressionChoices(experience, choices = []) {
  const runtimeChoices = Array.isArray(choices)
    ? choices.filter((choice) => choice?.id && choice?.label)
    : [];
  if (runtimeChoices.length) return runtimeChoices;
  const suggestions = experience?.phases?.expression?.suggestions;
  return Array.isArray(suggestions)
    ? suggestions.filter((choice) => choice?.id && choice?.label)
    : [];
}

export function createExpressionPayload({ selectedSourceIds = [], selectedChoiceIds = [], userText = "", config = {} }) {
  return {
    sourceIds: [...new Set(selectedSourceIds)].slice(0, config.sourceSelectionLimit || 1),
    choiceIds: [...new Set(selectedChoiceIds)].slice(0, 6),
    userText: String(userText).trim(),
    outputType: config.outputType,
  };
}

export function getExpressionTextValidationError(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const compact = text.replace(/\s+/g, "");
  if (compact.length < 2 || !/[\p{Script=Han}A-Za-z]/u.test(compact)) {
    return "请写一句包含具体想法的话，不要只输入数字或符号";
  }
  return "";
}

export function createClientExpressionFallback(experience, payload) {
  const config = experience?.phases?.expression || {};
  const sources = getExpressionSources(experience);
  const selectedSource = sources.find((source) => payload.sourceIds?.includes(source.id));
  const template = config.fallbackTemplates?.find((item) => item?.title && item?.text);
  const userText = String(payload.userText || "").trim();
  let text = userText
    ? template?.text ? `我写下：“${userText}” ${template.text}` : userText
    : template?.text;
  if (!text && selectedSource) text = `我从《${selectedSource.title}》中，看见了历史选择背后的责任与坚持。`;
  if (!text) text = "我愿意记住这一段行程，也继续理解其中每一次选择的重量。";
  return {
    title: template?.title || OUTPUT_TITLES[config.outputType] || "我的长征表达",
    text: text.slice(0, config.ai?.maxOutputCharacters || 160),
    sourceIds: payload.sourceIds || [],
    label: config.outputLabel || "AI根据玩家选择生成",
    usedFallback: true,
    mode: "fallback",
    fallbackReason: "network",
    requestId: null,
  };
}

export function createLevelExpressionPanel(options = {}) {
  return new LevelExpressionPanel(options);
}

class LevelExpressionPanel {
  constructor({ experience, choices = [], sources = [], initialSourceIds = [], artworkContext = null, onSubmit, onSpeak, onArtwork, onPersistArtwork, onComplete } = {}) {
    this.experience = experience || {};
    this.config = this.experience.phases?.expression || {};
    this.sources = Array.isArray(sources) && sources.length ? sources : getExpressionSources(this.experience);
    this.initialSourceIds = new Set(Array.isArray(initialSourceIds) ? initialSourceIds : []);
    this.choices = getExpressionChoices(this.experience, choices);
    this.onSubmit = typeof onSubmit === "function" ? onSubmit : null;
    this.onSpeak = typeof onSpeak === "function" ? onSpeak : null;
    this.onArtwork = typeof onArtwork === "function" ? onArtwork : null;
    this.onPersistArtwork = typeof onPersistArtwork === "function" ? onPersistArtwork : null;
    this.onComplete = typeof onComplete === "function" ? onComplete : () => {};
    this.audio = null;
    this.audioUrls = [];
    this.audioIndex = 0;
    this.utterance = null;
    this.spokenText = "";
    this.controller = new AbortController();
    this.element = this.build();
    this.artworkPanel = this.config.artwork?.enabled && this.onArtwork
      ? createLevelArtworkPanel({
          config: this.config.artwork,
          context: artworkContext,
          onGenerate: this.onArtwork,
          onPersist: this.onPersistArtwork,
        })
      : null;
    this.artworkPanel?.mount(this.element);
  }

  mount(container) {
    if (!container || typeof container.appendChild !== "function") {
      throw new Error("表达面板缺少合法的挂载容器");
    }
    container.appendChild(this.element);
    return this;
  }

  destroy() {
    this.stopAudio(true);
    this.artworkPanel?.destroy();
    this.controller.abort();
    this.element.remove();
  }

  build() {
    const section = document.createElement("section");
    section.className = "level-expression-panel";
    section.dataset.outputType = this.config.outputType || "free-expression";
    section.setAttribute("aria-labelledby", "level-expression-title");
    section.innerHTML = `
      <div class="level-expression-panel__heading">
        <p class="level-expression-panel__eyebrow">我的表达</p>
        <h2 id="level-expression-title">${this.escape(this.config.prompt || "这一关，你最想留下什么？")}</h2>
        <p>${this.escape(this.config.guidance || "选择一个表达角度，也可以写一句自己的话。AI 只帮助整理，不替你作决定。")}</p>
      </div>
      <form class="level-expression-panel__form">
        <fieldset class="level-expression-panel__sources" ${this.sources.length ? "" : "hidden"}>
          <legend>选择史料（最多 ${this.config.sourceSelectionLimit || 1} 份）</legend>
          <div class="level-expression-panel__chips"></div>
        </fieldset>
        <fieldset class="level-expression-panel__choices" ${this.choices.length ? "" : "hidden"}>
          <legend>选择一个表达角度</legend>
          <div class="level-expression-panel__choice-list"></div>
        </fieldset>
        <label class="level-expression-panel__text-label" for="level-expression-input">${this.escape(this.config.textLabel || "我想说")}</label>
        <textarea id="level-expression-input" rows="3" maxlength="${this.maxCharacters}" placeholder="${this.escape(this.config.placeholder || OUTPUT_PLACEHOLDERS[this.config.outputType] || "用一句话写下你的判断或感受")}"></textarea>
        <div class="level-expression-panel__counter" aria-live="polite"><span>0</span> / ${this.maxCharacters}</div>
        <p class="level-expression-panel__error" role="alert" hidden></p>
        <button class="level-expression-panel__submit" type="submit">${this.escape(this.config.submitLabel || OUTPUT_ACTIONS[this.config.outputType] || "生成我的表达")}</button>
      </form>
      <article class="level-expression-panel__result" aria-live="polite" hidden>
        <span class="level-expression-panel__label"></span>
        <div class="level-expression-panel__result-title">
          <h3></h3>
          <button class="level-expression-panel__speech" type="button" aria-label="朗读这段表达" title="朗读这段表达" hidden>🔊</button>
        </div>
        <p></p>
        <small class="level-expression-panel__fallback" hidden>当前使用离线模板，体验不受影响。</small>
      </article>`;

    this.form = section.querySelector("form");
    this.textarea = section.querySelector("textarea");
    this.counter = section.querySelector(".level-expression-panel__counter span");
    this.error = section.querySelector(".level-expression-panel__error");
    this.submitButton = section.querySelector("button[type=submit]");
    this.result = section.querySelector(".level-expression-panel__result");
    this.speechButton = section.querySelector(".level-expression-panel__speech");
    this.submitLabel = this.submitButton.textContent;
    this.renderSources(section.querySelector(".level-expression-panel__chips"));
    this.renderChoices(section.querySelector(".level-expression-panel__choice-list"));

    this.textarea.addEventListener("input", () => {
      this.counter.textContent = String(this.textarea.value.length);
      this.hideError();
    }, { signal: this.controller.signal });
    this.form.addEventListener("change", (event) => this.handleSelection(event), { signal: this.controller.signal });
    this.form.addEventListener("submit", (event) => this.handleSubmit(event), { signal: this.controller.signal });
    this.speechButton.addEventListener("click", () => this.handleSpeech(), { signal: this.controller.signal });
    return section;
  }

  get maxCharacters() {
    return Math.min(Number(this.config.maxCharacters) || DEFAULT_MAX_CHARACTERS, 80);
  }

  renderSources(container) {
    for (const source of this.sources) {
      const label = document.createElement("label");
      label.className = "level-expression-panel__chip";
      const checked = this.initialSourceIds.has(source.id) ? " checked" : "";
      const levelPrefix = source.levelTitle ? `${source.levelTitle} · ` : "";
      label.innerHTML = `<input type="checkbox" name="sourceId" value="${this.escape(source.id)}"${checked}><span>${this.escape(`${levelPrefix}${source.title}`)}</span>`;
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
    const textError = getExpressionTextValidationError(payload.userText);
    if (textError) {
      this.showError(textError);
      this.textarea.focus();
      return;
    }
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
      this.artworkPanel?.setExpression(value, payload);
      await this.onComplete(value);
    } catch (err) {
      this.showError(err.message || "生成失败，请稍后重试");
    } finally {
      this.submitButton.disabled = false;
      this.submitButton.textContent = `重新${this.submitLabel}`;
    }
  }

  showResult(value) {
    this.stopAudio(true);
    this.spokenText = value.text || "";
    this.result.querySelector(".level-expression-panel__label").textContent = value.label || "AI根据玩家选择生成";
    this.result.querySelector("h3").textContent = value.title || "我的表达";
    this.result.querySelector("p").textContent = value.text || "";
    const fallback = this.result.querySelector(".level-expression-panel__fallback");
    fallback.hidden = value.usedFallback !== true;
    if (value.usedFallback === true) {
      fallback.textContent = fallbackMessage(value.fallbackReason);
      if (value.requestId) fallback.title = `请求编号：${value.requestId}`;
    }
    this.speechButton.hidden = !this.onSpeak || !this.spokenText;
    this.setSpeechButtonState("ready");
    this.result.hidden = false;
    this.result.focus?.({ preventScroll: true });
  }

  async handleSpeech() {
    if (this.utterance && "speechSynthesis" in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        this.setSpeechButtonState("playing");
      } else {
        window.speechSynthesis.pause();
        this.setSpeechButtonState("ready");
      }
      return;
    }
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
      this.setSpeechButtonState("ready");
      return;
    }
    if (this.audio) {
      await this.audio.play();
      this.setSpeechButtonState("playing");
      return;
    }
    if (this.audioUrls.length) {
      await this.playAudioSegment();
      return;
    }

    this.speechButton.disabled = true;
    this.setSpeechButtonState("loading");
    try {
      const value = await this.onSpeak(this.spokenText);
      this.audioUrls = Array.isArray(value?.audioDataUrls) && value.audioDataUrls.length
        ? value.audioDataUrls
        : value?.audioDataUrl ? [value.audioDataUrl] : [];
      if (!this.audioUrls.length) throw new Error("语音接口没有返回音频");
      this.audioIndex = 0;
      await this.playAudioSegment();
    } catch (err) {
      if (!this.speakWithBrowser()) {
        this.showError(err.message || "朗读失败，请稍后重试");
        this.setSpeechButtonState("ready");
      }
    } finally {
      this.speechButton.disabled = false;
    }
  }

  speakWithBrowser() {
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance !== "function") return false;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(this.spokenText);
    utterance.lang = "zh-CN";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => {
      this.utterance = null;
      this.setSpeechButtonState("ready");
    };
    utterance.onerror = () => {
      this.utterance = null;
      this.setSpeechButtonState("ready");
      this.showError("朗读失败，请稍后重试");
    };
    this.utterance = utterance;
    window.speechSynthesis.speak(utterance);
    this.setSpeechButtonState("playing");
    return true;
  }

  async playAudioSegment() {
    const source = this.audioUrls[this.audioIndex];
    if (!source) {
      this.audio = null;
      this.audioIndex = 0;
      this.setSpeechButtonState("ready");
      return;
    }
    this.audio = new Audio(source);
    this.audio.addEventListener("ended", () => {
      this.audio = null;
      this.audioIndex += 1;
      if (this.audioIndex < this.audioUrls.length) {
        this.playAudioSegment().catch((err) => this.showError(err.message || "朗读失败，请稍后重试"));
      } else {
        this.audioIndex = 0;
        this.setSpeechButtonState("ready");
      }
    }, { once: true });
    await this.audio.play();
    this.setSpeechButtonState("playing");
  }

  stopAudio(clearCache = false) {
    if (this.utterance && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      this.utterance = null;
    }
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute("src");
      this.audio.load?.();
      this.audio = null;
    }
    this.audioIndex = 0;
    if (clearCache) this.audioUrls = [];
  }

  setSpeechButtonState(state) {
    const labels = {
      loading: ["…", "正在生成朗读"],
      playing: ["⏸", "暂停朗读"],
      ready: ["🔊", "朗读这段表达"],
    };
    const [content, label] = labels[state] || labels.ready;
    this.speechButton.textContent = content;
    this.speechButton.setAttribute("aria-label", label);
    this.speechButton.title = label;
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

function fallbackMessage(reason) {
  const messages = {
    quota: "在线生成额度暂时不可用，当前使用离线模板。",
    auth: "在线服务认证暂时不可用，当前使用离线模板。",
    timeout: "在线生成等待超时，当前使用离线模板。",
    config: "在线生成尚未配置完成，当前使用离线模板。",
    response: "在线结果暂时无法解析，当前使用离线模板。",
    validation: "所选材料暂未同步到在线服务，当前使用离线模板。",
    network: "当前网络无法连接在线服务，已使用离线模板。",
    upstream: "在线服务暂时不可用，当前使用离线模板。",
    disabled: "本关当前使用离线模板。",
  };
  return messages[reason] || messages.upstream;
}
