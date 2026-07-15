import {
  ADVANCE_COOLDOWN_MS,
  ADVANCE_STEP,
  ADVANCE_VIDEO_MS,
  ATTACK_DIRECTIONS,
  DODGE_WINDOW_MS,
  FACT_MIN_READ_MS,
  FIRE_LIMIT,
  HIT_LIMIT,
  KEYFRAMES,
  MAX_FIRE_GAP_MS,
  MIN_FIRE_GAP_MS,
  NARRATIVE_BEATS,
  TEAMMATE_FALL,
  VICTORY_IMAGE,
} from "./config.js";
import { applyLevelFeedback } from "../../levelRuntime/feedbackSystem.js";

export function startCrossing(resolve) {
  const scene = document.querySelector("#bridge-scene");
  const squadSelect = document.querySelector("#squad-select");
  const hud = document.querySelector("#bridge-hud");
  const bg = document.querySelector("#bridge-bg");
  const crawlVideo = document.querySelector("#bridge-crawl-video");
  const crossingPath = document.querySelector("#bridge-crossing-path");
  const crawler = document.querySelector("#bridge-crawler");
  const progressFill = document.querySelector("#bridge-progress-fill");
  const hitsEl = document.querySelector("#bridge-hits");
  const warningEl = document.querySelector("#bridge-warning");
  const attackEl = document.querySelector("#bridge-attack");
  const attackArrowEl = document.querySelector("#bridge-attack-arrow");
  const attackHelpEl = document.querySelector("#bridge-attack-help");
  const captionEl = document.querySelector("#bridge-caption");
  const hintEl = document.querySelector("#bridge-hint");
  const controlsEl = document.querySelector("#bridge-controls");
  const factCardEl = document.querySelector("#bridge-fact-card");
  const resultEl = document.querySelector("#bridge-result");

  squadSelect.remove();
  hud.hidden = false;
  crossingPath.hidden = false;
  controlsEl.hidden = false;
  bg.classList.add("bridge-scene__bg--sway");
  if (!crawlVideo.src) {
    crawlVideo.src = crawlVideo.dataset.src;
    crawlVideo.load();
  }
  crawlVideo.hidden = false;
  crawlVideo.currentTime = 0;
  crawlVideo.pause();
  crawlVideo.addEventListener("error", () => {
    crawlVideo.hidden = true;
  }, { once: true });
  crawlVideo.addEventListener("ended", () => {
    if (finished || pausedForFact) return;
    progress = 100;
    updateHud();
    winCrossing();
  });

  let progress = 0;
  let hits = 0;
  let finished = false;
  let awaitingDodge = null; // { attackDirection: "left" | "right", escapeDirection: "left" | "right" } | null
  let dodgeTimeout = null;
  let fireTimeout = null;
  let firedCount = 0;
  let lastAdvanceAt = 0;
  let pausedForFact = false;
  let factCanContinueAt = 0;
  let videoAdvanceTimeout = null;
  const shownBeats = new Set();

  function updateHud() {
    syncProgressFromVideo();
    progressFill.style.width = `${progress}%`;
    hitsEl.innerHTML = Array.from({ length: HIT_LIMIT }, (_, index) => (
      `<span class="${index < HIT_LIMIT - hits ? "is-full" : "is-empty"}"></span>`
    )).join("");
    hitsEl.setAttribute("aria-label", `剩余体力 ${HIT_LIMIT - hits} 格`);
    crawler.style.setProperty("--bridge-progress", progress);

    const frame = [...KEYFRAMES].reverse().find((k) => progress >= k.at);
    if (frame && crawlVideo.hidden) bg.style.backgroundImage = `url(${frame.bg})`;

    const beat = NARRATIVE_BEATS.find((b) => progress >= b.at && !shownBeats.has(b.at));
    if (beat) {
      shownBeats.add(beat.at);
      showFactCard(beat);
    }
  }

  function syncProgressFromVideo() {
    if (crawlVideo.hidden || !crawlVideo.duration) return;
    progress = Math.min(100, (crawlVideo.currentTime / crawlVideo.duration) * 100);
  }

  function showCaption(text, type, duration = 2600) {
    captionEl.className = `bridge-caption bridge-caption--${type}`;
    applyLevelFeedback(captionEl, { message: text, tone: type });
    clearTimeout(showCaption._t);
    showCaption._t = setTimeout(() => {
      captionEl.hidden = true;
    }, duration);
  }

  function showHint(text) {
    applyLevelFeedback(hintEl, { message: text, tone: "assist" });
    clearTimeout(showHint._t);
    showHint._t = setTimeout(() => {
      hintEl.hidden = true;
    }, 2200);
  }

  function showFactCard(beat) {
    pausedForFact = true;
    factCanContinueAt = performance.now() + FACT_MIN_READ_MS;
    clearTimeout(fireTimeout);
    clearTimeout(dodgeTimeout);
    crawlVideo.pause();
    awaitingDodge = null;
    warningEl.hidden = true;
    crawler.classList.remove("bridge-crawler--brace");
    factCardEl.hidden = false;
    factCardEl.innerHTML = `
      <article>
        <p>史实节点</p>
        <h3>${beat.title}</h3>
        <span>${beat.text}</span>
        <small data-fact-continue>请先阅读</small>
      </article>
    `;
    clearTimeout(showFactCard._t);
    showFactCard._t = setTimeout(() => {
      factCardEl.querySelector("[data-fact-continue]")?.replaceChildren("按空格继续前进");
    }, FACT_MIN_READ_MS);
  }

  function closeFactCard() {
    clearTimeout(showFactCard._t);
    pausedForFact = false;
    factCardEl.hidden = true;
    factCardEl.innerHTML = "";
    showHint("继续按空格前进；火力出现时先闪避");
    scheduleFire();
  }

  function advanceCrawlVideo() {
    if (crawlVideo.hidden) return;
    clearTimeout(videoAdvanceTimeout);
    if (crawlVideo.duration && crawlVideo.currentTime >= Math.max(0, crawlVideo.duration - 0.2)) {
      crawlVideo.currentTime = crawlVideo.duration;
      progress = 100;
      updateHud();
      winCrossing();
      return;
    }
    crawlVideo.play().catch(() => {});
    videoAdvanceTimeout = setTimeout(() => {
      if (finished || pausedForFact) return;
      crawlVideo.pause();
      updateHud();
      if (crawlVideo.duration && crawlVideo.currentTime >= Math.max(0, crawlVideo.duration - 0.2)) {
        progress = 100;
        updateHud();
        winCrossing();
      }
    }, ADVANCE_VIDEO_MS);
  }

  function showResult(type, title, text, actionText = "") {
    resultEl.hidden = false;
    resultEl.className = `bridge-result bridge-result--${type}`;
    resultEl.innerHTML = `
      <div class="bridge-result__card">
        <p>${type === "fail" ? "行动受阻" : "抵达对岸"}</p>
        <h3>${title}</h3>
        <span>${text}</span>
        ${actionText ? `<button type="button" id="bridge-result-action">${actionText}</button>` : ""}
      </div>
    `;
  }

  function hideResult() {
    resultEl.hidden = true;
    resultEl.innerHTML = "";
  }

  function spawnFallingTeammate() {
    const img = document.createElement("img");
    img.src = TEAMMATE_FALL;
    img.alt = "";
    img.className = "bridge-teammate-fall";
    img.style.left = `${20 + Math.random() * 60}%`;
    scene.appendChild(img);
    img.addEventListener("animationend", () => img.remove());
  }

  function jolt() {
    bg.classList.remove("bridge-scene__bg--jolt");
    // 强制重排，保证同一个 class 连续加两次也能重新触发动画
    void bg.offsetWidth;
    bg.classList.add("bridge-scene__bg--jolt");
  }

  function pulseScene(className, duration = 300) {
    scene.classList.remove(className);
    void scene.offsetWidth;
    scene.classList.add(className);
    setTimeout(() => scene.classList.remove(className), duration);
  }

  function animateCrawl() {
    crawler.classList.remove("bridge-crawler--crawl");
    void crawler.offsetWidth;
    crawler.classList.add("bridge-crawler--crawl");
  }

  function scheduleFire() {
    if (firedCount >= FIRE_LIMIT) return;
    const gap = MIN_FIRE_GAP_MS + Math.random() * (MAX_FIRE_GAP_MS - MIN_FIRE_GAP_MS);
    fireTimeout = setTimeout(fireShot, gap);
  }

  function fireShot() {
    if (finished || pausedForFact) return;
    firedCount += 1;
    const attackDirection = Math.random() < 0.5 ? "left" : "right";
    const attack = ATTACK_DIRECTIONS[attackDirection];
    awaitingDodge = {
      attackDirection,
      escapeDirection: attack.escape,
    };
    attackEl.className = `bridge-attack bridge-attack--${attackDirection}`;
    attackArrowEl.textContent = attack.arrow;
    attackHelpEl.textContent = `${attack.label}，${attack.escapeLabel}`;
    attackEl.hidden = false;
    warningEl.hidden = false;
    warningEl.className = `bridge-warning bridge-warning--${attack.escape}`;
    warningEl.textContent = `${attack.arrow} 敌军攻击，按${attack.escape === "left" ? " ← " : " → "}反方向逃`;
    crawler.classList.add("bridge-crawler--brace");

    dodgeTimeout = setTimeout(() => {
      if (awaitingDodge) {
        registerHit("没来得及反方向躲开，重新过桥！");
        return;
      }
      warningEl.hidden = true;
      attackEl.hidden = true;
      awaitingDodge = null;
      crawler.classList.remove("bridge-crawler--brace");
      if (finished) return;
      scheduleFire();
    }, DODGE_WINDOW_MS);
  }

  function registerHit(message = "被火力扫中，重新过桥！") {
    hits += 1;
    scene.classList.add("bridge-scene--flash");
    setTimeout(() => scene.classList.remove("bridge-scene--flash"), 200);
    showCaption(message, "hit", 1800);
    spawnFallingTeammate();
    pulseScene("bridge-scene--danger", 420);
    updateHud();

    if (hits >= HIT_LIMIT) {
      failCrossing();
    }
  }

  function failCrossing() {
    finished = true;
    clearTimeout(fireTimeout);
    clearTimeout(dodgeTimeout);
    clearTimeout(videoAdvanceTimeout);
    crawlVideo.pause();
    warningEl.hidden = true;
    attackEl.hidden = true;
    showCaption("冲锋受阻，突击队重新集结。", "fail", 2200);
    showResult("fail", "重新集结", "体力耗尽了。观察火力方向，先闪避，再按空格继续前进。", "再试一次");
  }

  function winCrossing() {
    finished = true;
    clearTimeout(fireTimeout);
    clearTimeout(dodgeTimeout);
    warningEl.hidden = true;
    attackEl.hidden = true;
    controlsEl.hidden = true;
    window.removeEventListener("keydown", onKeyDown);
    controlsEl.querySelectorAll("[data-bridge-command]").forEach((button) => {
      button.removeEventListener("click", onControlClick);
    });
    bg.classList.remove("bridge-scene__bg--sway");
    clearTimeout(videoAdvanceTimeout);
    crawlVideo.pause();
    crawlVideo.hidden = true;
    bg.style.backgroundImage = `url(${VICTORY_IMAGE})`;
    showResult("victory", "成功抵达对岸", "你冲过铁索，打开了继续前进的通道。", "");
    showCaption("两小时激战，泸定城，拿下了。", "victory", 2600);
    setTimeout(() => {
      showCaption("毛主席后来写下：大渡桥横铁索寒", "victory", 2600);
    }, 2000);
    setTimeout(() => resolve("completed"), 4400);
  }

  function advance() {
    if (finished) return;

    if (pausedForFact) {
      if (performance.now() < factCanContinueAt) {
        factCardEl.querySelector("[data-fact-continue]")?.replaceChildren("请先阅读");
        return;
      }
      closeFactCard();
      return;
    }

    if (awaitingDodge) {
      showHint("火力箭头出现了，先按反方向躲开！");
      return;
    }

    const now = performance.now();
    if (now - lastAdvanceAt < ADVANCE_COOLDOWN_MS) return;
    lastAdvanceAt = now;

    if (crawlVideo.hidden || !crawlVideo.duration) {
      progress = Math.min(100, progress + ADVANCE_STEP);
    }
    jolt();
    advanceCrawlVideo();
    if (finished) return;
    animateCrawl();
    updateHud();
    if (progress >= 100) winCrossing();
  }

  function dodge(direction) {
    if (!awaitingDodge || finished) return;

    if (direction !== awaitingDodge.escapeDirection) {
      clearTimeout(dodgeTimeout);
      warningEl.hidden = true;
      attackEl.hidden = true;
      awaitingDodge = null;
      crawler.classList.remove("bridge-crawler--brace");
      registerHit("方向错了！敌军箭头往哪边打，就要往反方向逃。");
      return;
    }

    clearTimeout(dodgeTimeout);
    warningEl.hidden = true;
    attackEl.hidden = true;
    awaitingDodge = null;
    crawler.classList.remove("bridge-crawler--brace");
    crawler.classList.add(`bridge-crawler--dodge-${direction}`);
    setTimeout(() => crawler.classList.remove(`bridge-crawler--dodge-${direction}`), 260);
    showHint("躲开了，继续向前爬！");
    scheduleFire();
  }

  function onKeyDown(event) {
    if (finished) return;

    if (event.code === "Space" || event.key === " ") {
      event.preventDefault();
      if (!event.repeat) advance();
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      dodge(event.key === "ArrowLeft" ? "left" : "right");
    }
  }

  function onControlClick(event) {
    const command = event.currentTarget.dataset.bridgeCommand;
    if (command === "advance") {
      advance();
      return;
    }
    dodge(command);
  }

  window.addEventListener("keydown", onKeyDown);
  controlsEl.querySelectorAll("[data-bridge-command]").forEach((button) => {
    button.addEventListener("click", onControlClick);
  });

  resultEl.addEventListener("click", (event) => {
    if (event.target?.id !== "bridge-result-action") return;
    progress = 0;
    hits = 0;
    firedCount = 0;
    finished = false;
    awaitingDodge = null;
    warningEl.hidden = true;
    crawler.classList.remove("bridge-crawler--brace");
    clearTimeout(videoAdvanceTimeout);
    crawlVideo.currentTime = 0;
    crawlVideo.pause();
    crawlVideo.hidden = false;
    pausedForFact = false;
    factCanContinueAt = 0;
    clearTimeout(showFactCard._t);
    factCardEl.hidden = true;
    factCardEl.innerHTML = "";
    shownBeats.clear();
    lastAdvanceAt = 0;
    hideResult();
    updateHud();
    showHint("先看火力方向，再闪避；没有火力时按空格前进。");
    scheduleFire();
  });

  updateHud();
  showHint("按空格或右下角前进；顶部箭头出现时按反方向躲避");
  scheduleFire();
}
