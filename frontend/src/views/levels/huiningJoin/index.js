import {
  getArchiveFragmentItems,
  renderArchiveFragmentVisual,
} from "../../../archiveFragments.js";
import { saveHuiningShowcase } from "../../../state.js";

const ROUTES = [
  {
    id: "front-one",
    label: "红一方面军",
    shortLabel: "一方面军",
    origin: "陕甘根据地",
    target: "huining-oct9",
    color: "#d4a447",
  },
  {
    id: "front-four",
    label: "红四方面军",
    shortLabel: "四方面军",
    origin: "岷州方向",
    target: "huining-oct9",
    color: "#bd4b3f",
  },
  {
    id: "front-two",
    label: "红二方面军",
    shortLabel: "二方面军",
    origin: "陇南方向",
    target: "jiangtaibao-oct22",
    color: "#7c9274",
  },
];

const DEFAULT_THEMES = [
  { id: "unity", name: "力量在会合中汇聚", shortLabel: "团结会合" },
  { id: "arrival", name: "每一次抵达都有代价", shortLabel: "艰难抵达" },
  { id: "new-start", name: "会师之后走向新的任务", shortLabel: "新的起点" },
];

export function isCorrectMeetingNode(routeId, nodeId) {
  return ROUTES.some((route) => route.id === routeId && route.target === nodeId);
}

export function buildHuiningExpressionChoices(theme, fragments = []) {
  if (!theme) return [];
  return [
    { id: "routes-assembled", label: "完成三路会合" },
    { id: `theme-${theme.id}`, label: theme.shortLabel },
    ...fragments.slice(0, 3).map((fragment) => ({
      id: fragment.id,
      label: `选择${fragment.name}`,
    })),
  ];
}

export function renderHuiningJoinExperience({ root, level, exhibition, signal }) {
  return new HuiningJoinExperience({ root, level, exhibition, signal }).start();
}

class HuiningJoinExperience {
  constructor({ root, level, exhibition, signal }) {
    this.root = root;
    this.level = level;
    this.exhibition = exhibition || {};
    this.signal = signal;
    this.phase = "intro";
    this.selectedRoute = null;
    this.placedRoutes = new Map();
    this.wrongAttempts = 0;
    this.fragments = getArchiveFragmentItems();
    this.selectedFragments = new Set();
    this.selectedTheme = null;
    this.finished = false;
    this.audioContext = null;
  }

  start() {
    return new Promise((resolve) => {
      this.resolve = (value) => {
        if (this.finished) return;
        this.finished = true;
        this.audioContext?.close?.().catch(() => {});
        resolve(value);
      };
      if (this.signal?.aborted) {
        this.resolve(null);
        return;
      }
      this.signal?.addEventListener("abort", () => this.resolve(null), { once: true });
      this.renderIntro();
    });
  }

  renderShell(content, { phase, background = "site" } = {}) {
    this.phase = phase;
    const image = background === "hall"
      ? "assets/levels/huining-join/huining-hall-xinhua.jpg"
      : "assets/levels/huining-join/huining-site-xinhua.jpg";
    this.root.innerHTML = `
      <main class="huining-experience huining-experience--${phase}" style="--huining-scene: url('${image}')">
        <div class="huining-experience__wash" aria-hidden="true"></div>
        <header class="huining-topbar">
          <a class="huining-topbar__back" href="#/map" aria-label="返回路线图">←</a>
          <div class="huining-topbar__identity">
            <span>长征档案行 · 最终章</span>
            <strong>会宁会师</strong>
          </div>
          <ol class="huining-progress" aria-label="关卡进度">
            ${["进入会宁", "三路会合", "数字组展"].map((label, index) => `
              <li class="${index + 1 <= this.phaseNumber ? "is-active" : ""}${index + 1 === this.phaseNumber ? " is-current" : ""}">
                <span>0${index + 1}</span><em>${label}</em>
              </li>
            `).join("")}
          </ol>
        </header>
        ${content}
        <p class="huining-credit">场景参考：新华网会宁会师旧址影像</p>
      </main>
    `;
  }

  get phaseNumber() {
    return { intro: 1, routes: 2, showcase: 3 }[this.phase] || 1;
  }

  renderIntro() {
    this.renderShell(`
      <section class="huining-intro" aria-labelledby="huining-intro-title">
        <div class="huining-intro__date" aria-hidden="true">
          <span>1936</span><em>十月</em>
        </div>
        <div class="huining-intro__copy">
          <p class="huining-kicker">甘肃 · 会宁地区</p>
          <h1 id="huining-intro-title">三路终会合</h1>
          <p class="huining-intro__lead">两年的辗转跋涉，最终汇成同一个方向。</p>
          <p class="huining-intro__question">会师为什么既是长征胜利的标志，也是新的起点？</p>
          <button class="huining-primary-button" type="button" data-huining-start>
            <span>走进会师时刻</span><b aria-hidden="true">→</b>
          </button>
        </div>
        <aside class="huining-intro__note">
          <span>本关任务</span>
          <p>接通三路行军线，再把一路获得的碎片组成自己的长征数字展台。</p>
        </aside>
      </section>
    `, { phase: "intro" });
    this.root.querySelector("[data-huining-start]")?.addEventListener("click", () => {
      this.playTone(392, 0.08);
      this.renderRoutes();
    }, { once: true });
  }

  renderRoutes() {
    const nodes = this.exhibition.meetingNodes || [
      { id: "huining-oct9", name: "会宁", date: "1936年10月9日" },
      { id: "jiangtaibao-oct22", name: "将台堡", date: "1936年10月22日" },
    ];
    this.renderShell(`
      <section class="huining-route-layout" aria-labelledby="huining-route-title">
        <div class="huining-mission-panel">
          <p class="huining-kicker">任务 01 · 还原会师进程</p>
          <h1 id="huining-route-title">让三路队伍抵达正确节点</h1>
          <p>点击一支队伍，再点击地图节点。也可以直接拖动。史料会帮助你理解这不是同一天、同一地点完成的会合。</p>
          <div class="huining-route-roster" role="list" aria-label="待安排行军队伍">
            ${ROUTES.map((route) => `
              <button type="button" draggable="true" data-route-id="${route.id}" style="--route-color:${route.color}">
                <span class="huining-route-roster__signal"></span>
                <span><strong>${route.label}</strong><small>来自：${route.origin}</small></span>
                <em>选择</em>
              </button>
            `).join("")}
          </div>
          <div class="huining-mission-panel__status" role="status" aria-live="polite">
            <strong data-route-count>已接入 0 / 3</strong>
            <span data-route-message>先选择一支队伍。</span>
          </div>
        </div>
        <div class="huining-map-table" aria-label="会师节点地图">
          <div class="huining-map-table__topography" aria-hidden="true"></div>
          <div class="huining-map-table__legend">
            <span>会师区域示意</span><em>1936 · 10</em>
          </div>
          <div class="huining-map-table__route huining-map-table__route--north" aria-hidden="true"></div>
          <div class="huining-map-table__route huining-map-table__route--west" aria-hidden="true"></div>
          <div class="huining-map-table__route huining-map-table__route--south" aria-hidden="true"></div>
          ${nodes.map((node) => `
            <button class="huining-map-node huining-map-node--${node.id}" type="button" data-node-id="${node.id}">
              <span class="huining-map-node__pulse" aria-hidden="true"></span>
              <small>${node.date}</small>
              <strong>${node.name}</strong>
              <span class="huining-map-node__arrivals" data-arrivals-for="${node.id}"></span>
            </button>
          `).join("")}
          <div class="huining-map-table__fact">
            <span>史实提示</span>
            <p>会宁与将台堡等节点，共同构成长征胜利会师的历史进程。</p>
          </div>
          <button class="huining-primary-button huining-primary-button--continue" type="button" data-routes-complete disabled>
            <span>进入数字展台</span><b aria-hidden="true">→</b>
          </button>
        </div>
      </section>
    `, { phase: "routes", background: "hall" });
    this.attachRouteInteractions();
  }

  attachRouteInteractions() {
    const routeButtons = [...this.root.querySelectorAll("[data-route-id]")];
    const nodeButtons = [...this.root.querySelectorAll("[data-node-id]")];
    for (const button of routeButtons) {
      button.addEventListener("click", () => this.selectRoute(button.dataset.routeId));
      button.addEventListener("dragstart", (event) => {
        this.selectRoute(button.dataset.routeId);
        event.dataTransfer?.setData("text/plain", button.dataset.routeId);
      });
    }
    for (const node of nodeButtons) {
      node.addEventListener("click", () => this.placeSelectedRoute(node.dataset.nodeId));
      node.addEventListener("dragover", (event) => event.preventDefault());
      node.addEventListener("drop", (event) => {
        event.preventDefault();
        this.selectedRoute = event.dataTransfer?.getData("text/plain") || this.selectedRoute;
        this.placeSelectedRoute(node.dataset.nodeId);
      });
    }
    this.root.querySelector("[data-routes-complete]")?.addEventListener("click", () => {
      this.playTone(523.25, 0.12);
      this.renderShowcase();
    });
  }

  selectRoute(routeId) {
    if (this.placedRoutes.has(routeId)) return;
    this.selectedRoute = routeId;
    this.root.querySelectorAll("[data-route-id]").forEach((button) => {
      button.classList.toggle("is-selected", button.dataset.routeId === routeId);
    });
    const route = ROUTES.find((item) => item.id === routeId);
    this.setRouteMessage(`已选择${route?.label || "队伍"}，请指定会师节点。`);
    this.playTone(330, 0.05);
  }

  placeSelectedRoute(nodeId) {
    if (!this.selectedRoute) {
      this.setRouteMessage("请先选择一支队伍，再指定节点。", true);
      return;
    }
    const route = ROUTES.find((item) => item.id === this.selectedRoute);
    if (!route || !isCorrectMeetingNode(route.id, nodeId)) {
      this.wrongAttempts += 1;
      const hint = this.wrongAttempts >= 2
        ? "提示：红一、红四方面军在会宁会合；红二方面军随后抵达将台堡。"
        : "这个节点与该队伍的时间线不吻合，可以查看右上角本关史料。";
      this.setRouteMessage(hint, true);
      this.root.querySelector(`[data-node-id="${nodeId}"]`)?.classList.add("is-wrong");
      window.setTimeout(() => this.root.querySelector(`[data-node-id="${nodeId}"]`)?.classList.remove("is-wrong"), 420);
      this.playTone(196, 0.08);
      return;
    }

    this.placedRoutes.set(route.id, nodeId);
    const button = this.root.querySelector(`[data-route-id="${route.id}"]`);
    button?.classList.remove("is-selected");
    button?.classList.add("is-placed");
    button?.setAttribute("disabled", "");
    const arrival = document.createElement("span");
    arrival.textContent = route.shortLabel;
    arrival.style.setProperty("--route-color", route.color);
    this.root.querySelector(`[data-arrivals-for="${nodeId}"]`)?.appendChild(arrival);
    this.root.querySelector(`[data-node-id="${nodeId}"]`)?.classList.add("is-filled");
    this.selectedRoute = null;
    this.playTone(440 + this.placedRoutes.size * 55, 0.1);
    this.updateRouteProgress();
  }

  updateRouteProgress() {
    const count = this.placedRoutes.size;
    const counter = this.root.querySelector("[data-route-count]");
    if (counter) counter.textContent = `已接入 ${count} / 3`;
    const done = count === ROUTES.length;
    this.setRouteMessage(done ? "三路行军线已经汇聚。会师完成，但新的任务刚刚开始。" : "继续接入下一支队伍。", false);
    const next = this.root.querySelector("[data-routes-complete]");
    if (next) next.disabled = !done;
  }

  setRouteMessage(message, isError = false) {
    const target = this.root.querySelector("[data-route-message]");
    if (!target) return;
    target.textContent = message;
    target.classList.toggle("is-error", isError);
  }

  renderShowcase() {
    const collected = this.fragments.filter((fragment) => fragment.collected);
    const themes = this.exhibition.themes || DEFAULT_THEMES;
    this.renderShell(`
      <section class="huining-showcase-layout" aria-labelledby="huining-showcase-title">
        <div class="huining-showcase-copy">
          <p class="huining-kicker">任务 02 · 组成个人展台</p>
          <h1 id="huining-showcase-title">把一路经历放在一起</h1>
          <p>最多选择三块已经获得的碎片，再决定你最想讲述的主题。没有碎片也可以从会师史料开始。</p>
          <div class="huining-theme-picker" role="group" aria-label="选择展览主题">
            ${themes.map((theme) => `
              <button type="button" data-theme-id="${theme.id}">
                <span>${theme.shortLabel}</span><strong>${theme.name}</strong>
              </button>
            `).join("")}
          </div>
          <div class="huining-showcase-status" role="status" aria-live="polite" data-showcase-message>
            ${collected.length ? `你已经带来 ${collected.length} 块历史碎片。` : "你还没有获得前六关碎片，本次将使用会师史料搭建基础展台。"}
          </div>
        </div>
        <div class="huining-showcase-stage">
          <div class="huining-showcase-stage__hall" aria-hidden="true"></div>
          <div class="huining-showcase-stage__title"><span>我的长征</span><strong>数字展台</strong></div>
          <div class="huining-showcase-pedestal" data-showcase-pedestal>
            <div class="huining-showcase-pedestal__glow"></div>
            <div class="huining-showcase-pedestal__empty">
              <span>等待碎片</span><small>也可以从本关史料开始</small>
            </div>
          </div>
          <div class="huining-fragment-tray" aria-label="历史碎片托盘">
            ${this.fragments.map((fragment) => `
              <button type="button" data-fragment-id="${fragment.id}" ${fragment.collected ? "" : "disabled"} class="${fragment.collected ? "" : "is-locked"}">
                ${renderArchiveFragmentVisual(fragment, { collected: fragment.collected })}
                <span><strong>${fragment.name}</strong><small>${fragment.collected ? "点击放入展台" : "完成对应关卡后获得"}</small></span>
              </button>
            `).join("")}
          </div>
          <button class="huining-primary-button huining-primary-button--finish" type="button" data-showcase-finish disabled>
            <span>生成我的展台讲解</span><b aria-hidden="true">→</b>
          </button>
        </div>
      </section>
    `, { phase: "showcase", background: "hall" });
    this.attachShowcaseInteractions();
  }

  attachShowcaseInteractions() {
    this.root.querySelectorAll("[data-theme-id]").forEach((button) => {
      button.addEventListener("click", () => {
        this.selectedTheme = button.dataset.themeId;
        this.root.querySelectorAll("[data-theme-id]").forEach((item) => item.classList.toggle("is-selected", item === button));
        this.updateShowcase();
        this.playTone(392, 0.06);
      });
    });
    this.root.querySelectorAll("[data-fragment-id]:not([disabled])").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.fragmentId;
        if (this.selectedFragments.has(id)) {
          this.selectedFragments.delete(id);
        } else if (this.selectedFragments.size < (this.exhibition.maximumSelectedFragments || 3)) {
          this.selectedFragments.add(id);
        } else {
          this.setShowcaseMessage("展台最多放入三块碎片。你可以先取下一块，再重新选择。", true);
          this.playTone(196, 0.08);
          return;
        }
        button.classList.toggle("is-selected", this.selectedFragments.has(id));
        this.updateShowcase();
        this.playTone(440 + this.selectedFragments.size * 45, 0.08);
      });
    });
    this.root.querySelector("[data-showcase-finish]")?.addEventListener("click", () => this.finishShowcase());
  }

  updateShowcase() {
    const pedestal = this.root.querySelector("[data-showcase-pedestal]");
    const selected = this.fragments.filter((fragment) => this.selectedFragments.has(fragment.id));
    if (pedestal) {
      pedestal.classList.toggle("has-fragments", selected.length > 0);
      pedestal.querySelectorAll(".huining-showcase-fragment").forEach((item) => item.remove());
      selected.forEach((fragment, index) => {
        const wrapper = document.createElement("div");
        wrapper.className = "huining-showcase-fragment";
        wrapper.style.setProperty("--slot", String(index));
        wrapper.innerHTML = `${renderArchiveFragmentVisual(fragment)}<span>${fragment.name}</span>`;
        pedestal.appendChild(wrapper);
      });
    }
    const theme = (this.exhibition.themes || DEFAULT_THEMES).find((item) => item.id === this.selectedTheme);
    const fragmentText = selected.length ? `已选择 ${selected.length} 块碎片` : "使用会师基础展台";
    this.setShowcaseMessage(theme ? `${fragmentText} · 主题：${theme.shortLabel}` : `${fragmentText} · 请选择展览主题`);
    const finish = this.root.querySelector("[data-showcase-finish]");
    if (finish) finish.disabled = !this.selectedTheme;
  }

  setShowcaseMessage(message, isError = false) {
    const target = this.root.querySelector("[data-showcase-message]");
    if (!target) return;
    target.textContent = message;
    target.classList.toggle("is-error", isError);
  }

  finishShowcase() {
    const themes = this.exhibition.themes || DEFAULT_THEMES;
    const theme = themes.find((item) => item.id === this.selectedTheme);
    const selected = this.fragments.filter((fragment) => this.selectedFragments.has(fragment.id));
    saveHuiningShowcase({
      themeId: theme.id,
      fragmentIds: selected.map((fragment) => fragment.id),
    });
    this.playTone(659.25, 0.14);
    this.resolve({
      expressionChoices: buildHuiningExpressionChoices(theme, selected),
    });
  }

  playTone(frequency, duration) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.audioContext ||= new AudioContext();
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.055, this.audioContext.currentTime + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + duration);
      oscillator.connect(gain).connect(this.audioContext.destination);
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + duration + 0.02);
    } catch {
      // 声音不可用时不影响通关。
    }
  }
}
