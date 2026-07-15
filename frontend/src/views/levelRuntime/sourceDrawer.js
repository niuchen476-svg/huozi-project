const DEFAULT_MAX_ITEMS = 12;
const MAX_ITEMS = 24;

export function normalizeSourceDrawerItems(sources, maxItems = DEFAULT_MAX_ITEMS) {
  const safeMax = Number.isInteger(maxItems) && maxItems > 0
    ? Math.min(maxItems, MAX_ITEMS)
    : DEFAULT_MAX_ITEMS;
  if (!Array.isArray(sources)) return [];
  return sources
    .filter((source) => source && source.visibleInSourceDrawer === true)
    .slice(0, safeMax);
}

export function safeSourceUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value, "https://source.invalid");
    return url.protocol === "http:" || url.protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

export function safeSourceImage(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[a-z][a-z\d+.-]*:/i.test(trimmed) || trimmed.startsWith("//")) return null;
  return trimmed;
}

export function createLevelSourceDrawer(options = {}) {
  return new LevelSourceDrawer(options);
}

class LevelSourceDrawer {
  constructor({ title = "本关史料", sources = [], maxItems = DEFAULT_MAX_ITEMS, onOpenChange } = {}) {
    this.title = title;
    this.maxItems = maxItems;
    this.sources = normalizeSourceDrawerItems(sources, maxItems);
    this.onOpenChange = typeof onOpenChange === "function" ? onOpenChange : () => {};
    this.isOpen = false;
    this.lastFocusedElement = null;
    this.closeTimer = null;
    this.controller = new AbortController();
    this.handleDocumentKeydown = this.handleDocumentKeydown.bind(this);
    this.element = this.build();
  }

  mount(container = document.body) {
    if (!container || typeof container.appendChild !== "function") {
      throw new Error("史料抽屉缺少合法的挂载容器");
    }
    container.appendChild(this.element);
    return this;
  }

  updateSources(sources, maxItems = this.maxItems) {
    this.maxItems = maxItems;
    this.sources = normalizeSourceDrawerItems(sources, maxItems);
    this.launcherCount.textContent = String(this.sources.length);
    this.launcher.setAttribute("aria-label", `${this.title}，共 ${this.sources.length} 份`);
    this.count.textContent = `${this.sources.length} 份`;
    this.renderList();
  }

  open() {
    if (this.isOpen) return;
    if (this.closeTimer) window.clearTimeout(this.closeTimer);
    this.isOpen = true;
    this.lastFocusedElement = document.activeElement;
    this.backdrop.hidden = false;
    this.panel.hidden = false;
    this.element.classList.add("level-source-drawer--open");
    this.launcher.setAttribute("aria-expanded", "true");
    this.panel.setAttribute("aria-hidden", "false");
    document.body.classList.add("level-source-drawer-is-open");
    document.addEventListener("keydown", this.handleDocumentKeydown);
    this.onOpenChange(true);
    window.requestAnimationFrame(() => this.closeButton.focus({ preventScroll: true }));
  }

  close({ restoreFocus = true } = {}) {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.element.classList.remove("level-source-drawer--open");
    this.launcher.setAttribute("aria-expanded", "false");
    this.panel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("level-source-drawer-is-open");
    document.removeEventListener("keydown", this.handleDocumentKeydown);
    this.onOpenChange(false);
    this.closeTimer = window.setTimeout(() => {
      this.backdrop.hidden = true;
      this.panel.hidden = true;
    }, 180);
    if (restoreFocus && this.lastFocusedElement?.focus) {
      this.lastFocusedElement.focus({ preventScroll: true });
    }
  }

  destroy() {
    if (this.closeTimer) window.clearTimeout(this.closeTimer);
    if (this.isOpen) this.close({ restoreFocus: false });
    document.removeEventListener("keydown", this.handleDocumentKeydown);
    document.body.classList.remove("level-source-drawer-is-open");
    this.controller.abort();
    this.element.remove();
  }

  build() {
    const root = document.createElement("section");
    root.className = "level-source-drawer";

    this.launcher = document.createElement("button");
    this.launcher.type = "button";
    this.launcher.className = "level-source-drawer__launcher";
    this.launcher.setAttribute("aria-expanded", "false");
    this.launcher.setAttribute("aria-controls", "level-source-drawer-panel");
    this.launcher.setAttribute("aria-label", `${this.title}，共 ${this.sources.length} 份`);
    const launcherLabel = document.createElement("span");
    launcherLabel.textContent = this.title;
    this.launcherCount = document.createElement("strong");
    this.launcherCount.textContent = String(this.sources.length);
    this.launcher.append(launcherLabel, this.launcherCount);

    this.backdrop = document.createElement("button");
    this.backdrop.type = "button";
    this.backdrop.className = "level-source-drawer__backdrop";
    this.backdrop.setAttribute("aria-label", "关闭本关史料");
    this.backdrop.hidden = true;

    this.panel = document.createElement("aside");
    this.panel.id = "level-source-drawer-panel";
    this.panel.className = "level-source-drawer__panel";
    this.panel.setAttribute("role", "dialog");
    this.panel.setAttribute("aria-modal", "true");
    this.panel.setAttribute("aria-labelledby", "level-source-drawer-title");
    this.panel.setAttribute("aria-hidden", "true");
    this.panel.hidden = true;

    const header = document.createElement("header");
    header.className = "level-source-drawer__header";
    const headingGroup = document.createElement("div");
    const eyebrow = document.createElement("p");
    eyebrow.textContent = "历史依据";
    const heading = document.createElement("h2");
    heading.id = "level-source-drawer-title";
    heading.textContent = this.title;
    this.count = document.createElement("span");
    this.count.textContent = `${this.sources.length} 份`;
    headingGroup.append(eyebrow, heading, this.count);

    this.closeButton = document.createElement("button");
    this.closeButton.type = "button";
    this.closeButton.className = "level-source-drawer__close";
    this.closeButton.setAttribute("aria-label", "关闭本关史料");
    this.closeButton.textContent = "×";
    header.append(headingGroup, this.closeButton);

    this.scroller = document.createElement("div");
    this.scroller.className = "level-source-drawer__scroller";
    this.scroller.tabIndex = 0;
    this.list = document.createElement("div");
    this.list.className = "level-source-drawer__list";
    this.scroller.appendChild(this.list);
    this.panel.append(header, this.scroller);
    root.append(this.launcher, this.backdrop, this.panel);

    const signal = this.controller.signal;
    this.launcher.addEventListener("click", () => this.open(), { signal });
    this.backdrop.addEventListener("click", () => this.close(), { signal });
    this.closeButton.addEventListener("click", () => this.close(), { signal });
    this.renderList();
    return root;
  }

  renderList() {
    this.list.replaceChildren();
    if (!this.sources.length) {
      const empty = document.createElement("div");
      empty.className = "level-source-drawer__empty";
      const seal = document.createElement("span");
      seal.setAttribute("aria-hidden", "true");
      seal.textContent = "档";
      const heading = document.createElement("strong");
      heading.textContent = "本关史料正在整理";
      const description = document.createElement("p");
      description.textContent = "你可以继续体验；史料补充后，会统一在这里展示。";
      empty.append(seal, heading, description);
      this.list.appendChild(empty);
      return;
    }
    this.sources.forEach((source, index) => this.list.appendChild(this.renderSource(source, index)));
  }

  renderSource(source, index) {
    const details = document.createElement("details");
    details.className = "level-source-drawer__item";
    if (source.activeInGameplay) details.classList.add("level-source-drawer__item--core");

    const summary = document.createElement("summary");
    const number = document.createElement("span");
    number.className = "level-source-drawer__number";
    number.textContent = String(index + 1).padStart(2, "0");
    const titleGroup = document.createElement("span");
    titleGroup.className = "level-source-drawer__item-title";
    const title = document.createElement("strong");
    title.textContent = source.title || "未命名史料";
    const meta = document.createElement("small");
    meta.textContent = [source.type, source.date, source.creator].filter(Boolean).join(" · ") || "史料";
    titleGroup.append(title, meta);
    summary.append(number, titleGroup);
    if (source.activeInGameplay) {
      const badge = document.createElement("em");
      badge.textContent = "参与本关";
      summary.appendChild(badge);
    }

    const content = document.createElement("div");
    content.className = "level-source-drawer__content";
    const imageSource = safeSourceImage(source.image || source.thumbnail);
    if (imageSource) {
      const figure = document.createElement("figure");
      const image = document.createElement("img");
      image.src = imageSource;
      image.alt = source.imageAlt || source.title || "史料图片";
      image.loading = "lazy";
      image.decoding = "async";
      figure.appendChild(image);
      if (source.imageCaption) {
        const caption = document.createElement("figcaption");
        caption.textContent = source.imageCaption;
        figure.appendChild(caption);
      }
      content.appendChild(figure);
    }
    this.appendParagraph(content, source.summary, "摘要");
    this.appendQuote(content, source.originalExcerpt);
    this.appendParagraph(content, source.plainExplanation, "说明");
    this.appendParagraph(content, source.sourceName, "来源");
    const sourceUrl = safeSourceUrl(source.sourceUrl);
    if (sourceUrl) {
      const link = document.createElement("a");
      link.href = sourceUrl;
      link.target = "_blank";
      link.rel = "noreferrer noopener";
      link.textContent = "查看来源页面";
      content.appendChild(link);
    }
    details.append(summary, content);
    return details;
  }

  appendParagraph(container, value, label) {
    if (!value) return;
    const paragraph = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = `${label}：`;
    paragraph.append(strong, document.createTextNode(value));
    container.appendChild(paragraph);
  }

  appendQuote(container, value) {
    if (!value) return;
    const quote = document.createElement("blockquote");
    quote.textContent = value;
    container.appendChild(quote);
  }

  handleDocumentKeydown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(this.panel.querySelectorAll(
      'button:not([disabled]), a[href], summary, [tabindex]:not([tabindex="-1"])'
    )).filter((element) => !element.hidden);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
