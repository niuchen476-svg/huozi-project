import { LUDING_ASSETS } from "../cinematicAssets.js";
import { resumeBgmAfterMedia, suspendBgmForMedia } from "../bgm.js";

const ASSET_BASE = "assets/levels/luding-bridge";

const KEYFRAMES = [
  { at: 0, bg: `${ASSET_BASE}/pov-start.jpg` },
  { at: 30, bg: `${ASSET_BASE}/pov-mid.jpg` },
  { at: 65, bg: `${ASSET_BASE}/pov-fire.jpg` },
  { at: 90, bg: `${ASSET_BASE}/pov-arrival.jpg` },
];

const INTRO_BG = `${ASSET_BASE}/reference/assault-painting-wide.png`;
const SQUAD_BG = `${ASSET_BASE}/squad-assembly.jpg`;
const DRAG_SOLDIER = `${ASSET_BASE}/props/assault-drag-soldier.png`;
const TEAMMATE_ICON = `${ASSET_BASE}/teammate-icon.jpg`;
const TEAMMATE_FALL = `${ASSET_BASE}/teammate-fall.png`;
const VICTORY_IMAGE = `${ASSET_BASE}/bridge-victory.jpg`;
const CRAWL_VIDEO = `${ASSET_BASE}/videos/luding-bridge-crawl.mp4`;

// 坐标是在 squad-assembly.jpg 图片里的百分比位置：队伍后排 -> 桥头
const PLAYER_START_POS = { x: 84, y: 58 };
const SQUAD_SLOT_POS = { x: 42, y: 56 };

const NARRATIVE_BEATS = [
  { at: 12, title: "只剩铁索", text: "桥面木板多已被拆除，突击队员只能攀着铁索前进。" },
  { at: 42, title: "打开通道", text: "突击队冒着对岸火力冲锋，为后续部队打开通道。" },
  { at: 72, title: "继续北上", text: "夺下桥头，中央红军才有机会继续北上。" },
];

const ATTACK_DIRECTIONS = {
  left: { arrow: "←", label: "敌军向左扫射", escape: "right", escapeLabel: "向右躲" },
  right: { arrow: "→", label: "敌军向右扫射", escape: "left", escapeLabel: "向左躲" },
};

const HIT_LIMIT = 3;
const ADVANCE_STEP = 3.2;
const ADVANCE_COOLDOWN_MS = 260;
const ADVANCE_VIDEO_MS = 1250;
const DODGE_WINDOW_MS = 850;
const MIN_FIRE_GAP_MS = 1100;
const MAX_FIRE_GAP_MS = 1900;
const FIRE_LIMIT = 9;
const FACT_MIN_READ_MS = 1400;
const LUDING_FRAGMENT = {
  id: "luding-chain",
  title: "铁索碎片",
  mark: "铁索",
  image: "/assets/fragments/fragment-luding-chain.png",
  text: "你跟随突击队冲过铁索，帮助红军打开前进通道。",
  source: {
    title: "史实补充",
    text: "1935 年 5 月 29 日，红军突击队冒着敌人火力夺取泸定桥，为中央红军继续北上争取了重要通道。",
  },
};

export function preloadBridgeActionAssets() {
  [INTRO_BG, SQUAD_BG, DRAG_SOLDIER, TEAMMATE_ICON, KEYFRAMES[0].bg].forEach(preloadImage);
  idle(() => {
    [...KEYFRAMES.slice(1).map((frame) => frame.bg), VICTORY_IMAGE, TEAMMATE_FALL].forEach(preloadImage);
  });
}

export function renderBridgeAction(root, level) {
  preloadBridgeActionAssets();

  return new Promise((resolve) => {
    root.innerHTML = `
      <div class="view view-bridge-action">
          <div class="bridge-scene bridge-scene--intro" id="bridge-scene">
          <div class="bridge-scene__bg" id="bridge-bg" style="background-image: url('${INTRO_BG}')"></div>
          <video class="bridge-scene__crawl-video" id="bridge-crawl-video" src="${CRAWL_VIDEO}" poster="${KEYFRAMES[0].bg}" muted playsinline preload="auto" hidden></video>
          <div class="bridge-crossing-path" id="bridge-crossing-path" hidden>
            <span class="bridge-chain bridge-chain--left"></span>
            <span class="bridge-chain bridge-chain--right"></span>
            <img class="bridge-crawler" id="bridge-crawler" src="${TEAMMATE_ICON}" alt="突击队员" draggable="false" />
          </div>
          <div class="bridge-scene__vignette"></div>

          <div class="bridge-hud" id="bridge-hud" hidden>
            <div class="bridge-hud__block">
              <span>前进进度</span>
              <div class="bridge-hud__progress">
                <div class="bridge-hud__progress-fill" id="bridge-progress-fill"></div>
              </div>
            </div>
            <div class="bridge-hud__block bridge-hud__block--stamina">
              <span>体力值</span>
              <div class="bridge-hud__hits" id="bridge-hits"></div>
            </div>
          </div>

          <div class="bridge-warning" id="bridge-warning" hidden></div>
          <div class="bridge-attack" id="bridge-attack" hidden>
            <span>敌军攻击方向</span>
            <strong id="bridge-attack-arrow">→</strong>
            <small id="bridge-attack-help">向反方向躲避</small>
          </div>
          <div class="bridge-caption" id="bridge-caption" hidden></div>
          <div class="bridge-hint" id="bridge-hint" hidden></div>
          <div class="bridge-controls" id="bridge-controls" hidden aria-label="过桥键盘">
            <button type="button" data-bridge-command="left" aria-label="向左躲">←</button>
            <button class="bridge-controls__advance" type="button" data-bridge-command="advance">前进</button>
            <button type="button" data-bridge-command="right" aria-label="向右躲">→</button>
          </div>
          <div class="bridge-fact-card" id="bridge-fact-card" hidden></div>
          <div class="bridge-result" id="bridge-result" hidden></div>

          <div class="history-intro" id="history-intro">
            <p class="history-intro__eyebrow">${level.date || ""}${level.location ? " · " + level.location : ""}</p>
            <h2 class="history-intro__title">${level.title}</h2>
            <figure class="bridge-intro-source">
              <img src="${ASSET_BASE}/reference/historic-iron-chains.png" alt="泸定桥铁索历史照片" />
              <figcaption>史料线索：桥面木板被拆后，突击队必须面对“只剩铁索”的险境。</figcaption>
            </figure>
            <p class="history-intro__text">${level.scenario}</p>
            <button type="button" id="history-intro-start">开始行动</button>
            <button class="bridge-video-bubble" type="button" id="bridge-video-open">点击查看相关视频</button>
          </div>

          <div class="bridge-video-modal" id="bridge-video-modal" role="dialog" aria-modal="true" aria-label="飞夺泸定桥相关视频" hidden>
            <button class="bridge-video-modal__backdrop" type="button" id="bridge-video-backdrop" aria-label="关闭视频"></button>
            <div class="bridge-video-modal__panel">
              <button class="bridge-video-modal__close" type="button" id="bridge-video-close" aria-label="关闭视频">关闭</button>
              <video id="bridge-video-player" controls playsinline src="${LUDING_ASSETS.cinematic.introVideo}">
                当前浏览器不支持视频播放。
              </video>
            </div>
          </div>

          <div class="bridge-role-prompt" id="bridge-role-prompt" role="dialog" aria-modal="true" aria-label="身份提示">
            <div class="bridge-role-prompt__card">
              <p>身份确认</p>
              <h3>今天，你是这场战役的突击队员。</h3>
              <span>听清任务，报名上桥，在枪火和铁索之间夺下泸定桥。</span>
              <button type="button" id="bridge-role-prompt-close">进入战场</button>
            </div>
          </div>

          <div class="squad-select" id="squad-select" hidden>
            <div class="squad-select__bg" style="background-image: url('${SQUAD_BG}')"></div>
            <div class="squad-select__scrim"></div>
            <p class="squad-select__title">团长喊话：桥板已经被敌人拆光，只剩下十三根光铁索！<br />但泸定桥，在天黑之前必须拿下。这事关我们党、我们红军的前途命运，同志们，跟我一起上啊！</p>
            <div class="squad-select__slot" id="squad-slot" style="left: ${SQUAD_SLOT_POS.x}%; top: ${SQUAD_SLOT_POS.y}%;">拖到桥头前方</div>
            <div class="squad-select__player" id="squad-player" style="left: ${PLAYER_START_POS.x}%; top: ${PLAYER_START_POS.y}%;">
              <img src="${DRAG_SOLDIER}" alt="你" draggable="false" />
            </div>
            <p class="squad-select__hint">你就是这名突击队员，请拖动他报名，随团长一起冲锋</p>
          </div>

          <div class="bridge-instruction" id="bridge-instruction" role="dialog" aria-modal="true" aria-label="行动说明" hidden>
            <div class="bridge-instruction__card">
              <p>行动说明</p>
              <h3>你已经爬上了铁索。</h3>
              <span>按空格或右下角“前进”沿铁索爬行。顶部出现敌军攻击箭头时，立刻按反方向键躲避：箭头向左就向右逃，箭头向右就向左逃。没躲开就要重新过桥。</span>
              <button type="button" id="bridge-instruction-start">开始爬行</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.querySelector("#bridge-role-prompt-close").addEventListener("click", () => {
      document.querySelector("#bridge-role-prompt")?.remove();
    });

    const videoModal = document.querySelector("#bridge-video-modal");
    const videoPlayer = document.querySelector("#bridge-video-player");
    const closeVideo = () => {
      videoPlayer.pause();
      videoModal.hidden = true;
      resumeBgmAfterMedia();
    };

    document.querySelector("#bridge-video-open").addEventListener("click", () => {
      suspendBgmForMedia();
      videoModal.hidden = false;
      videoPlayer.currentTime = 0;
      videoPlayer.play().catch(() => {});
    });
    document.querySelector("#bridge-video-close").addEventListener("click", closeVideo);
    document.querySelector("#bridge-video-backdrop").addEventListener("click", closeVideo);

    document.querySelector("#history-intro-start").addEventListener("click", () => {
      KEYFRAMES.forEach((frame) => preloadImage(frame.bg));
      closeVideo();
      document.querySelector("#bridge-scene").classList.remove("bridge-scene--intro");
      document.querySelector("#history-intro").remove();
      const squadSelect = document.querySelector("#squad-select");
      squadSelect.hidden = false;
      setupSquadSelect(() => {
        const instruction = document.querySelector("#bridge-instruction");
        instruction.hidden = false;
        document.querySelector("#bridge-instruction-start").addEventListener("click", () => {
          instruction.hidden = true;
          startCrossing(resolve);
        }, { once: true });
      });
    });
  });
}

function preloadImage(src) {
  const image = new Image();
  image.decoding = "async";
  image.src = src;
}

function idle(callback) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback, { timeout: 1500 });
    return;
  }
  window.setTimeout(callback, 250);
}

function setupSquadSelect(onSelected) {
  const player = document.querySelector("#squad-player");
  const slot = document.querySelector("#squad-slot");
  const select = document.querySelector("#squad-select");

  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  function toPoint(event) {
    if (event.touches && event.touches[0]) {
      return { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }
    return { x: event.clientX, y: event.clientY };
  }

  function onDown(event) {
    dragging = true;
    const rect = player.getBoundingClientRect();
    const point = toPoint(event);
    offsetX = point.x - rect.left;
    offsetY = point.y - rect.top;
    player.style.position = "fixed";
    player.style.transform = "none";
    player.style.animation = "none";
    player.style.zIndex = "50";
    moveTo(point);
  }

  function moveTo(point) {
    player.style.left = `${point.x - offsetX}px`;
    player.style.top = `${point.y - offsetY}px`;
  }

  function onMove(event) {
    if (!dragging) return;
    event.preventDefault();
    moveTo(toPoint(event));
  }

  function onUp() {
    if (!dragging) return;
    dragging = false;

    const playerRect = player.getBoundingClientRect();
    const slotRect = slot.getBoundingClientRect();
    const overlap =
      playerRect.left < slotRect.right &&
      playerRect.right > slotRect.left &&
      playerRect.top < slotRect.bottom &&
      playerRect.bottom > slotRect.top;

    if (overlap) {
      player.classList.add("squad-select__player--locked");
      const rect = slot.getBoundingClientRect();
      player.style.left = `${rect.left + rect.width / 2 - playerRect.width / 2}px`;
      player.style.top = `${rect.top + rect.height / 2 - playerRect.height / 2}px`;
      slot.textContent = "我去！";
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
      setTimeout(() => {
        select.classList.add("squad-select--fadeout");
        setTimeout(onSelected, 500);
      }, 500);
    }
  }

  player.addEventListener("pointerdown", onDown);
  player.addEventListener("touchstart", onDown, { passive: true });
  window.addEventListener("pointermove", onMove, { passive: false });
  window.addEventListener("touchmove", onMove, { passive: false });
  window.addEventListener("pointerup", onUp);
  window.addEventListener("touchend", onUp);
}

function startCrossing(resolve) {
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
    captionEl.textContent = text;
    captionEl.className = `bridge-caption bridge-caption--${type}`;
    captionEl.hidden = false;
    clearTimeout(showCaption._t);
    showCaption._t = setTimeout(() => {
      captionEl.hidden = true;
    }, duration);
  }

  function showHint(text) {
    hintEl.textContent = text;
    hintEl.hidden = false;
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
    setTimeout(() => showArchiveFragment(scene, LUDING_FRAGMENT, resolve), 4600);
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

function showArchiveFragment(container, fragment, onCollect) {
  const modal = document.createElement("div");
  modal.className = "archive-fragment";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", "获得档案碎片");
  modal.innerHTML = `
    <div class="archive-fragment__card">
      <p class="archive-fragment__eyebrow">获得档案碎片</p>
      ${renderArchiveFragmentPiece(fragment)}
      <h2>${fragment.title}</h2>
      <p class="archive-fragment__text">${fragment.text}</p>
      ${fragment.source ? renderBridgeSourceNote(fragment.source) : ""}
      <button type="button">收进档案袋</button>
    </div>
  `;
  container.appendChild(modal);
  modal.querySelector("button").addEventListener("click", () => {
    saveArchiveFragment(fragment.id);
    onCollect();
  });
}

function renderArchiveFragmentPiece(fragment) {
  if (fragment.image) {
    return `
      <div class="archive-fragment__piece archive-fragment__piece--image archive-fragment__piece--chain">
        <img src="${fragment.image}" alt="${fragment.title}" />
      </div>
    `;
  }

  return `
    <div class="archive-fragment__piece archive-fragment__piece--chain">
      <span>${fragment.mark}</span>
    </div>
  `;
}

function renderBridgeSourceNote(source) {
  return `
    <div class="bridge-source-note">
      <small>${source.title}</small>
      <p>${source.text}</p>
    </div>
  `;
}

function saveArchiveFragment(id) {
  const key = "huozi.archiveFragments";
  const fragments = JSON.parse(window.localStorage.getItem(key) || "[]");
  if (!fragments.includes(id)) {
    fragments.push(id);
    window.localStorage.setItem(key, JSON.stringify(fragments));
  }
}
