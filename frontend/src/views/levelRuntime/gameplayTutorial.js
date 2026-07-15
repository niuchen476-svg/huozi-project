const DEFAULT_DELAY = 420;

export function normalizeGameplayTutorial(config) {
  const steps = Array.isArray(config?.steps)
    ? config.steps.filter((step) => step?.title && step?.text).slice(0, 6)
    : [];
  return {
    enabled: config?.enabled !== false && steps.length > 0,
    autoShow: config?.autoShow !== false,
    title: config?.title || "本关玩法提示",
    steps,
  };
}

export function createGameplayTutorial(options = {}) {
  return new GameplayTutorial(options);
}

class GameplayTutorial {
  constructor({ root, config, onOpenChange } = {}) {
    this.root = root;
    this.config = normalizeGameplayTutorial(config);
    this.onOpenChange = typeof onOpenChange === "function" ? onOpenChange : () => {};
    this.controller = new AbortController();
    this.index = 0;
    this.isOpen = false;
    this.hasAutoShown = false;
    this.autoTimer = null;
    this.highlighted = null;
    this.highlightSnapshot = null;
    this.closeWaiters = [];
    this.element = this.build();
  }

  mount(container = document.body) {
    container.appendChild(this.element);
    return this;
  }

  autoShow() {
    if (!this.config.enabled || !this.config.autoShow || this.hasAutoShown) return;
    this.hasAutoShown = true;
    window.clearTimeout(this.autoTimer);
    this.autoTimer = window.setTimeout(() => this.open(0), DEFAULT_DELAY);
  }

  openForOnboarding() {
    if (!this.config.enabled || !this.config.autoShow || this.hasAutoShown) return Promise.resolve(false);
    this.hasAutoShown = true;
    this.open(0);
    return new Promise((resolve) => this.closeWaiters.push(resolve));
  }

  open(index = 0) {
    if (!this.config.enabled) return false;
    window.clearTimeout(this.autoTimer);
    this.index = Math.max(0, Math.min(index, this.config.steps.length - 1));
    this.isOpen = true;
    this.element.hidden = false;
    document.body.classList.add("level-gameplay-tutorial-is-open");
    this.render();
    this.onOpenChange(true);
    window.requestAnimationFrame(() => this.nextButton.focus({ preventScroll: true }));
    return true;
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.clearHighlight();
    this.element.hidden = true;
    document.body.classList.remove("level-gameplay-tutorial-is-open");
    this.onOpenChange(false);
    this.closeWaiters.splice(0).forEach((resolve) => resolve(true));
  }

  next() {
    if (this.index >= this.config.steps.length - 1) {
      this.close();
      return;
    }
    this.index += 1;
    this.render();
  }

  destroy() {
    window.clearTimeout(this.autoTimer);
    if (this.isOpen) this.close();
    this.clearHighlight();
    this.closeWaiters.splice(0).forEach((resolve) => resolve(false));
    this.controller.abort();
    this.element.remove();
  }

  build() {
    const element = document.createElement("section");
    element.className = "level-gameplay-tutorial";
    element.hidden = true;
    element.setAttribute("role", "dialog");
    element.setAttribute("aria-modal", "true");
    element.setAttribute("aria-labelledby", "level-gameplay-tutorial-title");

    const backdrop = document.createElement("div");
    backdrop.className = "level-gameplay-tutorial__backdrop";
    const card = document.createElement("article");
    card.className = "level-gameplay-tutorial__card";
    const eyebrow = document.createElement("p");
    eyebrow.className = "level-gameplay-tutorial__eyebrow";
    eyebrow.textContent = this.config.title;
    this.counter = document.createElement("span");
    this.heading = document.createElement("h2");
    this.heading.id = "level-gameplay-tutorial-title";
    this.description = document.createElement("p");
    this.description.className = "level-gameplay-tutorial__description";
    const actions = document.createElement("div");
    actions.className = "level-gameplay-tutorial__actions";
    this.skipButton = document.createElement("button");
    this.skipButton.type = "button";
    this.skipButton.className = "level-gameplay-tutorial__skip";
    this.skipButton.textContent = "跳过提示";
    this.nextButton = document.createElement("button");
    this.nextButton.type = "button";
    this.nextButton.className = "level-gameplay-tutorial__next";
    actions.append(this.skipButton, this.nextButton);
    card.append(eyebrow, this.counter, this.heading, this.description, actions);
    element.append(backdrop, card);

    const signal = this.controller.signal;
    this.skipButton.addEventListener("click", () => this.close(), { signal });
    this.nextButton.addEventListener("click", () => this.next(), { signal });
    element.addEventListener("keydown", (event) => {
      if (event.key === "Escape") this.close();
    }, { signal });
    return element;
  }

  render() {
    const step = this.config.steps[this.index];
    this.counter.textContent = `${String(this.index + 1).padStart(2, "0")} / ${String(this.config.steps.length).padStart(2, "0")}`;
    this.heading.textContent = step.title;
    this.description.textContent = step.text;
    this.nextButton.textContent = this.index === this.config.steps.length - 1 ? "我明白了，开始" : "下一步";
    this.highlight(step.anchor);
  }

  findTarget(selector) {
    if (!selector) return null;
    const direct = this.root?.querySelector?.(selector);
    if (direct) return direct;
    const sharedShellTarget = document.querySelector(selector);
    if (sharedShellTarget) return sharedShellTarget;
    const frame = this.root?.querySelector?.("iframe");
    try {
      return frame?.contentDocument?.querySelector(selector) || null;
    } catch {
      return null;
    }
  }

  highlight(selector) {
    this.clearHighlight();
    const target = this.findTarget(selector);
    if (!target) return;
    this.highlighted = target;
    this.highlightSnapshot = {
      outline: target.style.outline,
      outlineOffset: target.style.outlineOffset,
      filter: target.style.filter,
      zIndex: target.style.zIndex,
    };
    target.style.outline = "4px solid #f2c66d";
    target.style.outlineOffset = "6px";
    target.style.filter = "drop-shadow(0 0 16px rgba(242, 198, 109, .75))";
    target.style.zIndex = "12";
  }

  clearHighlight() {
    if (!this.highlighted || !this.highlightSnapshot) return;
    Object.assign(this.highlighted.style, this.highlightSnapshot);
    this.highlighted = null;
    this.highlightSnapshot = null;
  }
}
