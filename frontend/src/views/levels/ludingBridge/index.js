import { LUDING_ASSETS } from "../../../cinematicAssets.js";
import { resumeBgmAfterMedia, suspendBgmForMedia } from "../../../bgm.js";
import {
  ASSET_BASE,
  CRAWL_VIDEO,
  DRAG_SOLDIER,
  INTRO_BG,
  KEYFRAMES,
  PLAYER_START_POS,
  SQUAD_BG,
  SQUAD_SLOT_POS,
  TEAMMATE_ICON,
  VICTORY_IMAGE,
} from "./config.js";
import { startCrossing } from "./crossing.js";
import { setupSquadSelect } from "./squadSelect.js";
export function preloadBridgeActionAssets() {
  [INTRO_BG, SQUAD_BG, DRAG_SOLDIER, TEAMMATE_ICON, KEYFRAMES[0].bg].forEach(preloadImage);
  idle(() => {
    [...KEYFRAMES.slice(1).map((frame) => frame.bg), VICTORY_IMAGE].forEach(preloadImage);
  });
}

export function renderBridgeAction(root, level) {
  preloadBridgeActionAssets();

  return new Promise((resolve) => {
    root.innerHTML = `
      <div class="view view-bridge-action">
          <a class="bridge-action__back" href="#/map">返回路线图</a>
          <div class="bridge-scene bridge-scene--intro" id="bridge-scene">
          <div class="bridge-scene__bg" id="bridge-bg" style="background-image: url('${INTRO_BG}')"></div>
          <video class="bridge-scene__crawl-video" id="bridge-crawl-video" data-src="${CRAWL_VIDEO}" poster="${KEYFRAMES[0].bg}" muted playsinline preload="none" hidden></video>
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
              <img src="${ASSET_BASE}/reference/historic-iron-chains.jpg" alt="泸定桥铁索历史照片" decoding="async" />
              <figcaption>史料线索：桥面木板被拆后，突击队必须面对“只剩铁索”的险境。</figcaption>
            </figure>
            <p class="history-intro__text">${level.scenario}</p>
            <button type="button" id="history-intro-start" data-level-phase="gameplay">开始行动</button>
            <button class="bridge-video-bubble" type="button" id="bridge-video-open">点击查看相关视频</button>
          </div>

          <div class="bridge-video-modal" id="bridge-video-modal" role="dialog" aria-modal="true" aria-label="飞夺泸定桥相关视频" hidden>
            <button class="bridge-video-modal__backdrop" type="button" id="bridge-video-backdrop" aria-label="关闭视频"></button>
            <div class="bridge-video-modal__panel">
              <button class="bridge-video-modal__close" type="button" id="bridge-video-close" aria-label="关闭视频">关闭</button>
              <video id="bridge-video-player" controls playsinline preload="none" data-src="${LUDING_ASSETS.cinematic.introVideo}">
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
      if (!videoPlayer.src) {
        videoPlayer.src = videoPlayer.dataset.src;
        videoPlayer.load();
      }
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
