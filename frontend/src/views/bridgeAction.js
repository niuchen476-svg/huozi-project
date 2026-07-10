import { LUDING_ASSETS } from "../cinematicAssets.js";

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

// 坐标是在 squad-assembly.jpg 图片里的百分比位置：队伍后排 -> 桥头
const PLAYER_START_POS = { x: 84, y: 58 };
const SQUAD_SLOT_POS = { x: 42, y: 56 };

const NARRATIVE_BEATS = [
  { at: 2, text: "脚下的铁索还带着体温——是刚刚倒下的战友抓过的地方" },
  { at: 35, text: "对岸的机枪一刻不停，火力像雨点一样打在铁链上" },
  { at: 68, text: "敌人点燃了桥头的煤油和木板——大火封住了最后一段路" },
];

const ATTACK_DIRECTIONS = {
  left: { arrow: "←", label: "敌军向左扫射", escape: "right", escapeLabel: "向右躲" },
  right: { arrow: "→", label: "敌军向右扫射", escape: "left", escapeLabel: "向左躲" },
};

const HIT_LIMIT = 1;
const ADVANCE_STEP = 2.25;
const ADVANCE_COOLDOWN_MS = 340;
const DODGE_WINDOW_MS = 1500;
const MIN_FIRE_GAP_MS = 1500;
const MAX_FIRE_GAP_MS = 2400;
const FIRE_LIMIT = 9;

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
          <div class="bridge-crossing-path" id="bridge-crossing-path" hidden>
            <span class="bridge-chain bridge-chain--left"></span>
            <span class="bridge-chain bridge-chain--right"></span>
            <img class="bridge-crawler" id="bridge-crawler" src="${TEAMMATE_ICON}" alt="突击队员" draggable="false" />
          </div>
          <div class="bridge-scene__vignette"></div>

          <div class="bridge-hud" id="bridge-hud" hidden>
            <div class="bridge-hud__progress">
              <div class="bridge-hud__progress-fill" id="bridge-progress-fill"></div>
            </div>
            <div class="bridge-hud__hits" id="bridge-hits"></div>
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
            <button type="button" data-bridge-command="left" aria-label="向左躲"><span>←</span></button>
            <button class="bridge-controls__advance" type="button" data-bridge-command="advance" aria-label="前进"><span>Space</span><small>前进</small></button>
            <button type="button" data-bridge-command="right" aria-label="向右躲"><span>→</span></button>
          </div>

          <div class="history-intro" id="history-intro">
            <p class="history-intro__eyebrow">${level.date || ""}${level.location ? " · " + level.location : ""}</p>
            <h2 class="history-intro__title">${level.title}</h2>
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
    };

    document.querySelector("#bridge-video-open").addEventListener("click", () => {
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

  squadSelect.remove();
  hud.hidden = false;
  crossingPath.hidden = false;
  controlsEl.hidden = false;
  bg.classList.add("bridge-scene__bg--sway");

  let progress = 0;
  let hits = 0;
  let finished = false;
  let awaitingDodge = null; // { attackDirection: "left" | "right", escapeDirection: "left" | "right" } | null
  let dodgeTimeout = null;
  let fireTimeout = null;
  let firedCount = 0;
  let lastAdvanceAt = 0;
  const shownBeats = new Set();

  function updateHud() {
    progressFill.style.width = `${progress}%`;
    hitsEl.textContent = hits ? "重新过桥" : "失误即重来";
    crawler.style.setProperty("--bridge-progress", progress);

    const frame = [...KEYFRAMES].reverse().find((k) => progress >= k.at);
    if (frame) bg.style.backgroundImage = `url(${frame.bg})`;

    const beat = NARRATIVE_BEATS.find((b) => progress >= b.at && !shownBeats.has(b.at));
    if (beat) {
      shownBeats.add(beat.at);
      showCaption(beat.text, "narrative");
    }
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
    if (finished) return;
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
      scheduleFire();
    }, DODGE_WINDOW_MS);
  }

  function registerHit(message = "被火力扫中，重新过桥！") {
    hits += 1;
    scene.classList.add("bridge-scene--flash");
    setTimeout(() => scene.classList.remove("bridge-scene--flash"), 200);
    showCaption(message, "hit", 1800);
    spawnFallingTeammate();
    updateHud();

    if (hits >= HIT_LIMIT) {
      failCrossing();
    }
  }

  function failCrossing() {
    finished = true;
    clearTimeout(fireTimeout);
    clearTimeout(dodgeTimeout);
    warningEl.hidden = true;
    attackEl.hidden = true;
    showCaption("冲锋受阻，突击队重新集结——再过一次桥", "fail", 2200);
    setTimeout(() => {
      progress = 0;
      hits = 0;
      firedCount = 0;
      finished = false;
      shownBeats.clear();
      lastAdvanceAt = 0;
      updateHud();
      scheduleFire();
      showHint("继续前进；看到顶部箭头时，按反方向躲避");
    }, 2400);
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
    bg.style.backgroundImage = `url(${VICTORY_IMAGE})`;
    showCaption("两小时激战，泸定城，拿下了。", "victory", 2600);
    setTimeout(() => {
      showCaption("毛主席后来写下：大渡桥横铁索寒", "victory", 2600);
    }, 2000);
    setTimeout(resolve, 4600);
  }

  function advance() {
    if (finished) return;

    if (awaitingDodge) {
      showHint("火力箭头出现了，先按反方向躲开！");
      return;
    }

    const now = performance.now();
    if (now - lastAdvanceAt < ADVANCE_COOLDOWN_MS) return;
    lastAdvanceAt = now;

    progress = Math.min(100, progress + ADVANCE_STEP);
    jolt();
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

  updateHud();
  showHint("按空格或右下角前进；顶部箭头出现时按反方向躲避");
  scheduleFire();
}
