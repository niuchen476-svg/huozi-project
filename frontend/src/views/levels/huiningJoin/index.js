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

const HOOF_STEPS = ["左前蹄", "右前蹄", "左后蹄", "右后蹄"];

const DEFAULT_TIMELINE_EVENTS = [
  { id: "capture", date: "10月2日", label: "攻占会宁城", detail: "打开会师通道" },
  { id: "first-fourth", date: "10月9日", label: "一、四方面军会合", detail: "会宁正式会合" },
  { id: "jiangtaibao", date: "10月22日", label: "将台堡会师", detail: "红二方面军总部抵达" },
  { id: "xinglong", date: "10月23日", label: "兴隆镇会合", detail: "红六军团接续会合" },
];

const SCENE_IMAGES = {
  site: "assets/levels/huining-join/huining-site-xinhua.jpg",
  hall: "assets/levels/huining-join/huining-hall-xinhua.jpg",
  victory: "assets/levels/huining-join/victory-meeting-painting.png",
  reunion: "assets/levels/huining-join/reunion-painting.png",
};

export function isCorrectMeetingNode(routeId, nodeId) {
  return ROUTES.some((route) => route.id === routeId && route.target === nodeId);
}

export function isCorrectTimelineOrder(eventIds, events = DEFAULT_TIMELINE_EVENTS) {
  return eventIds.length === events.length
    && events.every((event, index) => event.id === eventIds[index]);
}

export function buildHuiningExpressionChoices(theme, fragments = []) {
  if (!theme) return [];
  return [
    { id: "hooves-wrapped", label: "完成马蹄裹布奔袭" },
    { id: "routes-assembled", label: "完成三路会合" },
    { id: "timeline-restored", label: "复原四个会师节点" },
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
    this.wrappedHooves = new Set();
    this.selectedRoute = null;
    this.placedRoutes = new Map();
    this.wrongAttempts = 0;
    this.timelineEvents = this.exhibition.timelineEvents || DEFAULT_TIMELINE_EVENTS;
    this.timelineOptions = shuffleItems(this.timelineEvents);
    this.timelineOrder = [];
    this.timelineAttempts = 0;
    this.timelineAssisted = false;
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
    const image = SCENE_IMAGES[background] || SCENE_IMAGES.site;
    this.root.innerHTML = `
      <main class="huining-experience huining-experience--${phase}" style="--huining-scene: url('${image}')">
        <div class="huining-experience__wash" aria-hidden="true"></div>
        <header class="huining-topbar">
          <a class="huining-topbar__back" href="#/map" aria-label="返回路线图">←</a>
          <div class="huining-topbar__identity">
            <span>重走长征路 · 最终章</span>
            <strong>会宁会师</strong>
          </div>
          <ol class="huining-progress" aria-label="关卡进度">
            ${["打开会宁", "会师进程", "数字组展"].map((label, index) => `
              <li class="${index + 1 <= this.phaseNumber ? "is-active" : ""}${index + 1 === this.phaseNumber ? " is-current" : ""}">
                <span>0${index + 1}</span><em>${label}</em>
              </li>
            `).join("")}
          </ol>
        </header>
        ${content}
        <p class="huining-credit">场景与史料图像：项目资料库</p>
      </main>
    `;
  }

  get phaseNumber() {
    return { intro: 1, hoof: 1, routes: 2, timeline: 2, showcase: 3 }[this.phase] || 1;
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
    `, { phase: "intro", background: "victory" });
    this.root.querySelector("[data-huining-start]")?.addEventListener("click", () => {
      this.playTone(392, 0.08);
      this.renderHoofWrap();
    }, { once: true });
  }

  renderHoofWrap() {
    this.renderShell(`
      <section class="huining-hoof-layout" aria-labelledby="huining-hoof-title">
        <div class="huining-hoof-story">
          <p class="huining-kicker">1936年10月2日 · 会宁西津门</p>
          <h1 id="huining-hoof-title">马蹄裹布，昼伏夜行</h1>
          <p>红十五军团直属骑兵团向会宁急进。为了隐藏马蹄声，骑兵用布裹住马蹄，抢在敌军之前打开会师通道。</p>
          <aside><strong>微互动 · 约15秒</strong><span>依次点击四只马蹄完成裹布，没有失败惩罚。</span></aside>
        </div>
        <div class="huining-hoof-workbench" aria-label="马蹄裹布操作台">
          <div class="huining-hoof-workbench__cloth" aria-hidden="true"><i></i><span>裹蹄布卷</span></div>
          <div class="huining-hoof-grid">
            ${HOOF_STEPS.map((label, index) => `
              <button type="button" data-hoof-index="${index}" aria-label="为${label}裹布">
                <span class="huining-hoof-mark" aria-hidden="true"><i></i><i></i><i></i></span>
                <strong>${label}</strong><small>点击裹布</small>
              </button>
            `).join("")}
          </div>
          <div class="huining-hoof-status" role="status" aria-live="polite">
            <span data-hoof-message>先为第一只马蹄裹布。</span><strong data-hoof-count>0 / 4</strong>
          </div>
          <button class="huining-primary-button huining-primary-button--hoof" type="button" data-hoof-complete disabled>
            <span>隐蔽奔袭，打开西津门</span><b aria-hidden="true">→</b>
          </button>
        </div>
      </section>
    `, { phase: "hoof", background: "site" });
    this.attachHoofInteractions();
  }

  attachHoofInteractions() {
    this.root.querySelectorAll("[data-hoof-index]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.hoofIndex);
        if (this.wrappedHooves.has(index)) return;
        this.wrappedHooves.add(index);
        button.classList.add("is-wrapped");
        button.setAttribute("disabled", "");
        button.querySelector("small").textContent = "已经裹好";
        const count = this.wrappedHooves.size;
        const countNode = this.root.querySelector("[data-hoof-count]");
        const message = this.root.querySelector("[data-hoof-message]");
        if (countNode) countNode.textContent = `${count} / 4`;
        if (message) message.textContent = count === HOOF_STEPS.length
          ? "马蹄声已经收住，可以隐蔽奔袭。"
          : `继续为第 ${count + 1} 只马蹄裹布。`;
        const complete = this.root.querySelector("[data-hoof-complete]");
        if (complete) complete.disabled = count !== HOOF_STEPS.length;
        this.playTone(280 + count * 55, 0.08);
      });
    });
    this.root.querySelector("[data-hoof-complete]")?.addEventListener("click", () => {
      this.playTone(523.25, 0.12);
      this.renderRoutes();
    });
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
          <img class="huining-map-table__historical-map" src="assets/levels/huining-join/three-armies-map.png" alt="红军三大主力会师示意图" loading="lazy" decoding="async" />
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
            <span>继续核对时间线</span><b aria-hidden="true">→</b>
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
      this.renderTimeline();
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

  renderTimeline() {
    this.renderShell(`
      <section class="huining-timeline-layout" aria-labelledby="huining-timeline-title">
        <div class="huining-mission-panel huining-timeline-copy">
          <p class="huining-kicker">任务 01 · 还原会师进程</p>
          <h1 id="huining-timeline-title">四个节点，不是同一天</h1>
          <p>三路队伍已经接通。现在按照发生时间依次点击四张事件卡，复原从打开会宁通道到接续会合的过程。</p>
          <div class="huining-process-summary">
            <span><b>10月9日</b>红一、红四方面军在会宁会合</span>
            <span><b>10月22日</b>红二方面军抵达将台堡</span>
          </div>
          <figure class="huining-timeline-photo">
            <img src="assets/levels/huining-join/front-fourth-photo.png" alt="长征到达陕北的红四方面军历史照片" loading="lazy" decoding="async" />
            <figcaption>长征到达陕北的红四方面军</figcaption>
          </figure>
          <p class="huining-timeline-hint">需要帮助时，可以打开右上角“本关史料”。第二次排序错误后系统会直接标出正确顺序。</p>
        </div>
        <div class="huining-timeline-board">
          <header><span>会师进程档案</span><strong>1936 · 10</strong></header>
          <ol class="huining-timeline-slots" aria-label="会师时间线" data-timeline-slots>
            ${this.timelineEvents.map((_, index) => `
              <li><i>0${index + 1}</i><span>等待历史节点</span></li>
            `).join("")}
          </ol>
          <div class="huining-timeline-options" aria-label="待排序历史节点">
            ${this.timelineOptions.map((event) => `
              <button type="button" data-timeline-event="${event.id}">
                <span>${event.date}</span><strong>${event.label}</strong><small>${event.detail}</small>
              </button>
            `).join("")}
          </div>
          <div class="huining-timeline-actions">
            <button type="button" data-timeline-undo disabled>撤回上一步</button>
            <p role="status" aria-live="polite" data-timeline-message>选择最早发生的节点。</p>
            <button class="huining-primary-button" type="button" data-timeline-confirm disabled>
              <span>确认会师进程</span><b aria-hidden="true">→</b>
            </button>
          </div>
        </div>
      </section>
    `, { phase: "timeline", background: "hall" });
    this.attachTimelineInteractions();
    this.updateTimelineUI();
  }

  attachTimelineInteractions() {
    this.root.querySelectorAll("[data-timeline-event]").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.timelineEvent;
        if (this.timelineOrder.includes(id) || this.timelineOrder.length >= this.timelineEvents.length) return;
        this.timelineOrder.push(id);
        this.updateTimelineUI();
        this.playTone(330 + this.timelineOrder.length * 48, 0.07);
      });
    });
    this.root.querySelector("[data-timeline-undo]")?.addEventListener("click", () => {
      this.timelineOrder.pop();
      this.updateTimelineUI();
    });
    this.root.querySelector("[data-timeline-confirm]")?.addEventListener("click", () => this.confirmTimeline());
  }

  updateTimelineUI(message = "") {
    const slots = [...this.root.querySelectorAll("[data-timeline-slots] li")];
    slots.forEach((slot, index) => {
      const event = this.timelineEvents.find((item) => item.id === this.timelineOrder[index]);
      slot.classList.toggle("is-filled", Boolean(event));
      slot.querySelector("span").textContent = event ? `${event.date} · ${event.label}` : "等待历史节点";
    });
    this.root.querySelectorAll("[data-timeline-event]").forEach((button) => {
      const used = this.timelineOrder.includes(button.dataset.timelineEvent);
      button.classList.toggle("is-used", used);
      button.disabled = used;
    });
    const undo = this.root.querySelector("[data-timeline-undo]");
    if (undo) undo.disabled = !this.timelineOrder.length || this.timelineAssisted;
    const confirm = this.root.querySelector("[data-timeline-confirm]");
    if (confirm) {
      confirm.disabled = this.timelineOrder.length !== this.timelineEvents.length;
      confirm.querySelector("span").textContent = this.timelineAssisted ? "进入数字展台" : "确认会师进程";
    }
    const status = this.root.querySelector("[data-timeline-message]");
    if (status) status.textContent = message || `已归位 ${this.timelineOrder.length} / ${this.timelineEvents.length}`;
  }

  confirmTimeline() {
    if (isCorrectTimelineOrder(this.timelineOrder, this.timelineEvents)) {
      this.playTone(659.25, 0.14);
      this.renderShowcase();
      return;
    }
    this.timelineAttempts += 1;
    if (this.timelineAttempts >= 2) {
      this.timelineOrder = this.timelineEvents.map((event) => event.id);
      this.timelineAssisted = true;
      this.updateTimelineUI("正确顺序已经标出：2日打开通道，9日会宁会合，22日将台堡会师，23日兴隆镇会合。");
      this.playTone(392, 0.1);
      return;
    }
    this.timelineOrder = [];
    this.updateTimelineUI("时间和地点还未对齐。提示：先打开通道，再到会宁、将台堡和兴隆镇。");
    this.playTone(196, 0.08);
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
          <img class="huining-showcase-stage__painting" src="assets/levels/huining-join/reunion-painting.png" alt="红军会师主题油画" loading="lazy" decoding="async" />
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

function shuffleItems(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}
