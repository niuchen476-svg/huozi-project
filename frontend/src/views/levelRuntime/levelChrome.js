const PHASES = Object.freeze([
  { id: "briefing", number: "01", label: "进入历史" },
  { id: "gameplay", number: "02", label: "身处历史" },
  { id: "sources", number: "03", label: "遇见文献" },
  { id: "expression", number: "04", label: "作出表达" },
  { id: "completion", number: "05", label: "完成本关" },
]);

export function normalizeLevelPhase(value) {
  return PHASES.some((phase) => phase.id === value) ? value : "briefing";
}

export function getLevelPhaseIndex(value) {
  return PHASES.findIndex((phase) => phase.id === normalizeLevelPhase(value));
}

export function createLevelChrome(options = {}) {
  return new LevelChrome(options);
}

class LevelChrome {
  constructor({ level, phase = "briefing", onRestart } = {}) {
    this.level = level || {};
    this.phase = normalizeLevelPhase(phase);
    this.onRestart = typeof onRestart === "function" ? onRestart : () => {};
    this.controller = new AbortController();
    this.element = this.build();
  }

  mount(container = document.body) {
    container.appendChild(this.element);
    document.body.classList.add("level-runtime-chrome-is-mounted");
    this.renderPhase();
    return this;
  }

  setPhase(phase) {
    const nextPhase = normalizeLevelPhase(phase);
    if (nextPhase === this.phase) return;
    this.phase = nextPhase;
    this.renderPhase();
  }

  destroy() {
    this.controller.abort();
    this.element.remove();
    document.body.classList.remove("level-runtime-chrome-is-mounted");
  }

  build() {
    const root = document.createElement("header");
    root.className = "level-runtime-chrome";
    root.dataset.levelRuntimeChrome = "";

    const back = document.createElement("a");
    back.className = "level-runtime-chrome__back";
    back.href = "#/map";
    back.setAttribute("aria-label", "返回路线图");
    back.innerHTML = '<span aria-hidden="true">←</span><em>路线图</em>';

    const identity = document.createElement("div");
    identity.className = "level-runtime-chrome__identity";
    const eyebrow = document.createElement("span");
    const order = Number.isInteger(this.level.order)
      ? `第 ${String(this.level.order).padStart(2, "0")} 关`
      : "历史关卡";
    eyebrow.textContent = `重走长征路 · ${order}`;
    const title = document.createElement("strong");
    title.textContent = this.level.title || "长征历史现场";
    identity.append(eyebrow, title);

    this.progress = document.createElement("ol");
    this.progress.className = "level-runtime-chrome__progress";
    this.progress.setAttribute("aria-label", "统一关卡进度");
    for (const phase of PHASES) {
      const item = document.createElement("li");
      item.dataset.phase = phase.id;
      const number = document.createElement("span");
      number.textContent = phase.number;
      const label = document.createElement("em");
      label.textContent = phase.label;
      item.append(number, label);
      this.progress.appendChild(item);
    }

    const restart = document.createElement("button");
    restart.type = "button";
    restart.className = "level-runtime-chrome__restart";
    restart.setAttribute("aria-label", "重新开始本关");
    restart.innerHTML = '<span aria-hidden="true">↻</span><em>重来</em>';
    restart.addEventListener("click", () => this.onRestart(), { signal: this.controller.signal });

    root.append(back, identity, this.progress, restart);
    return root;
  }

  renderPhase() {
    const currentIndex = getLevelPhaseIndex(this.phase);
    for (const [index, item] of Array.from(this.progress.children).entries()) {
      item.classList.toggle("is-complete", index < currentIndex);
      item.classList.toggle("is-current", index === currentIndex);
      if (index === currentIndex) item.setAttribute("aria-current", "step");
      else item.removeAttribute("aria-current");
    }
    const current = PHASES[currentIndex];
    this.element.dataset.phase = current.id;
    this.element.setAttribute("aria-label", `${this.level.title || "本关"}，当前阶段：${current.label}`);
  }
}
