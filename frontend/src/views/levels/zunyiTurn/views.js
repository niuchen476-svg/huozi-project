import { ZUNYI_ASSETS } from "../../../cinematicAssets.js";
import {
  CAUSE_CARDS,
  CRISIS_CARDS,
  DECISION_CARDS,
  DECISION_ORDER,
  MEETING_RECORDS,
  REWRITE_SCENES,
  ROUTE_POINTS,
  ZUNYI_FRAGMENT,
} from "./data.js";

export function progressClass(item, state) {
  if (item.id === state.step) return "zunyi-progress__dot--active";
  if (state.completed.has(item.id)) return "zunyi-progress__dot--done";
  return "";
}

export function renderIntro(state) {
  const date = state.level.date || "1935 年 1 月 15 日至 17 日";
  const location = state.level.location || "贵州遵义 · 遵义会议会址";

  return `
    <section class="zunyi-intro-scene">
      <div class="zunyi-intro-scene__bg" aria-hidden="true"></div>
      <div class="zunyi-intro-scene__shade" aria-hidden="true"></div>
      <div class="history-intro history-intro--zunyi">
        <p class="history-intro__eyebrow">${date} · ${location}</p>
        <h2 class="history-intro__title">遵义会议</h2>
        <p class="history-intro__text">
          遵义会议是在第五次反“围剿”失败和长征初期严重受挫后召开的中共中央政治局扩大会议。会议集中总结军事指挥上的问题，批评博古、李德等人的错误军事指挥，增选毛泽东为中央政治局常委，并调整了中央军事领导。它使党和红军在极端危急的局面中开始重新掌握主动，成为长征和中国革命的重要转折。
        </p>
        <button type="button" id="history-intro-start" data-next-step data-level-phase="gameplay">开始记录</button>
        <button
          class="zunyi-video-bubble"
          type="button"
          data-show-video
        >
          点击查看相关视频
        </button>
      </div>
      ${state.showVideo ? renderVideoModal() : ""}
      ${state.showRolePrompt ? renderRolePrompt() : ""}
    </section>
  `;
}

export function renderRolePrompt() {
  return `
    <div class="zunyi-role-prompt" role="dialog" aria-modal="true" aria-label="身份提示">
      <div class="zunyi-role-prompt__card">
        <p>身份确认</p>
        <h3>今天，你是这场会议的小记录员。</h3>
        <span>请先听清楚会议为什么召开，再把关键判断写进记录纸。</span>
        <button type="button" data-close-role-prompt>进入会议</button>
      </div>
    </div>
  `;
}

export function renderVideoModal() {
  return `
    <div class="zunyi-video-modal" role="dialog" aria-modal="true" aria-label="遵义会议相关视频">
      <button class="zunyi-video-modal__backdrop" type="button" data-close-video aria-label="关闭视频"></button>
      <div class="zunyi-video-modal__panel">
        <button class="zunyi-video-modal__close" type="button" data-close-video aria-label="关闭视频">关闭</button>
        <video controls autoplay playsinline src="${ZUNYI_ASSETS.cinematic.introVideo}">
          当前浏览器不支持视频播放。
        </video>
      </div>
    </div>
  `;
}

export function renderRewriteCanvas(state) {
  const scene = REWRITE_SCENES[state.rewriteScene] || REWRITE_SCENES[0];
  const isLast = state.rewriteScene >= REWRITE_SCENES.length - 1;
  const noteClass = scene.game === "record" ? "zunyi-rewrite-canvas__note zunyi-rewrite-canvas__note--record" : "zunyi-rewrite-canvas__note";

  return `
    <main class="zunyi-rewrite-canvas" style="--zunyi-rewrite-bg: url('${scene.image}')">
      <div class="zunyi-rewrite-canvas__bg" aria-hidden="true"></div>
      <div class="zunyi-rewrite-canvas__shade" aria-hidden="true"></div>
      ${scene.game === "record" ? renderMeetingSpeakerBubble(state) : ""}
      <section class="${noteClass}" aria-label="遵义会议记录互动">
        <p>${scene.label}</p>
        <h2>${scene.title}</h2>
        <span>${scene.text}</span>
        ${scene.game === "record" ? renderMeetingRecordGame(state) : isLast ? "" : `<button type="button" data-next-rewrite-scene>继续</button>`}
      </section>
    </main>
  `;
}

export function renderMeetingSpeakerBubble(state) {
  const records = state.records || MEETING_RECORDS;
  const record = records[state.meetingRecordIndex];
  if (!["lesson", "command", "direction"].includes(record?.id)) return "";
  const positionClass = record.id === "command"
    ? "zunyi-meeting-speaker-bubble--left"
    : record.id === "direction"
      ? "zunyi-meeting-speaker-bubble--right"
      : "zunyi-meeting-speaker-bubble--center";

  return `
    <article class="zunyi-meeting-speaker-bubble ${positionClass}" aria-label="${record.speaker}">
      <small>${record.speaker}</small>
      <strong>${record.line}</strong>
    </article>
  `;
}

export function renderMeetingRecordGame(state) {
  const records = state.records || MEETING_RECORDS;
  const record = records[state.meetingRecordIndex];
  const completed = state.meetingRecords.length >= records.length && !state.activeSourceCard;

  if (completed) {
    return `
      <div class="zunyi-record-game">
        <div class="zunyi-record-game__paper">
          <strong>会议记录纸</strong>
          <b class="zunyi-record-game__status">会议记录完成</b>
          ${records.map((item) => `<em class="is-written">${item.written}</em>`).join("")}
          ${renderArchivedSourceTags(state)}
          <b class="zunyi-record-game__stamp">记录归档</b>
        </div>
        <small class="zunyi-record-game__feedback">你把关键判断记录完整了：这场会议正在把危急局面中的问题、原因和方向写清楚。</small>
        <button type="button" data-finish-rewrite>收好记录纸</button>
      </div>
    `;
  }

  return `
    <div class="zunyi-record-game">
      ${["lesson", "command", "direction"].includes(record.id) ? "" : `
        <article class="zunyi-record-game__speech">
          <small>${record.speaker}</small>
          <strong>${record.line}</strong>
        </article>
      `}
      ${state.activeSourceCard ? renderSourceCard(state.activeSourceCard) : `
        <div class="zunyi-record-game__choices" aria-label="选择记录重点">
          ${record.choices.map((choice) => `<button type="button" data-record-choice="${choice}">${choice}</button>`).join("")}
        </div>
      `}
      <div class="zunyi-record-game__paper">
        <strong>会议记录纸</strong>
        ${records.map((item) => {
          const written = state.meetingRecords.includes(item.id);
          const fresh = state.lastWrittenRecord === item.id;
          return `<em class="${written ? "is-written" : ""} ${fresh ? "is-fresh-written" : ""}">${written ? item.written : "等待记录..."}</em>`;
        }).join("")}
        ${renderArchivedSourceTags(state)}
      </div>
      <small class="zunyi-record-game__feedback">${state.recordFeedback}</small>
    </div>
  `;
}

export function renderArchivedSourceTags(state) {
  if (!state.archivedSources.length) return "";
  const records = state.records || MEETING_RECORDS;

  return `
    <div class="zunyi-record-game__archives" aria-label="已归档史料">
      ${state.archivedSources.map((id, index) => {
        const item = records.find((record) => record.id === id);
        return `<span>史料${index + 1}已归档：${item?.sourceCard.title || "相关史料"}</span>`;
      }).join("")}
    </div>
  `;
}

export function renderSourceCard(card) {
  return `
    <article class="zunyi-source-card" aria-label="史料补充">
      <button class="zunyi-source-card__image" type="button" data-zoom-source-card aria-label="放大查看史料">
        <img src="${card.image}" alt="" />
        <span>点击放大查看</span>
      </button>
      <div class="zunyi-source-card__body">
        <small>史料补充</small>
        <h3>${card.title}</h3>
        <p>${card.text}</p>
        <span class="zunyi-source-card__tip">点左侧图片可放大查看史料</span>
        <button type="button" data-collect-source-card>收进记录夹</button>
      </div>
    </article>
  `;
}

export function renderSourceCardZoom(card) {
  const image = card.zoomImage || card.image;

  return `
    <div class="zunyi-source-zoom" role="dialog" aria-modal="true" aria-label="史料放大查看">
      <button class="zunyi-source-zoom__backdrop" type="button" data-close-source-zoom aria-label="关闭史料查看"></button>
      <article class="zunyi-source-zoom__card">
        <button class="zunyi-source-zoom__close" type="button" data-close-source-zoom aria-label="关闭史料查看">关闭</button>
        <div class="zunyi-source-zoom__image">
          <img src="${image}" alt="${card.title}" />
        </div>
        <div class="zunyi-source-zoom__body">
          <small>史料补充</small>
          <h2>${card.title}</h2>
          ${renderSourceDetail(card)}
        </div>
      </article>
    </div>
  `;
}

export function renderSourceDetail(card) {
  return `
    <div class="zunyi-source-detail">
      <section>
        <h3>史料名称</h3>
        <p>${card.sourceName}</p>
      </section>
      <section>
        <h3>原文摘录</h3>
        <blockquote>“${card.excerpt}”</blockquote>
        <cite>——${card.credit}</cite>
      </section>
      <p class="zunyi-source-detail__note">${card.note}</p>
    </div>
  `;
}

export function renderArchiveFragment(fragment) {
  return `
    <div class="archive-fragment" role="dialog" aria-modal="true" aria-label="获得档案碎片">
      <div class="archive-fragment__card">
        <p class="archive-fragment__eyebrow">获得档案碎片</p>
        ${renderArchiveFragmentPiece(fragment, "paper")}
        <h2>${fragment.title}</h2>
        <p class="archive-fragment__text">${fragment.text}</p>
        ${renderArchiveFragmentGallery(fragment)}
        <button type="button" data-collect-fragment>收进档案袋</button>
      </div>
    </div>
  `;
}

export function renderArchiveFragmentPiece(fragment, type) {
  if (fragment.image) {
    return `
      <div class="archive-fragment__piece archive-fragment__piece--image archive-fragment__piece--${type}">
        <img src="${fragment.image}" alt="${fragment.title}" />
      </div>
    `;
  }

  return `
    <div class="archive-fragment__piece archive-fragment__piece--${type}">
      <span>${fragment.mark}</span>
    </div>
  `;
}

export function renderArchiveFragmentGallery(fragment) {
  if (!fragment.gallery?.length) return "";

  return `
    <div class="archive-fragment__gallery" aria-label="会址云端一览">
      <small>会址云端一览</small>
      <p>点击图片，可以放大查看会址与记录细节。</p>
      <div>
        ${fragment.gallery.map((item, index) => `
          <figure>
            <button type="button" data-archive-image="${index}" aria-label="放大查看${item.title}">
              <img src="${item.image}" alt="${item.title}" />
            </button>
            <figcaption>${item.title}</figcaption>
          </figure>
        `).join("")}
      </div>
    </div>
  `;
}

export function renderArchiveImageZoom(item) {
  const image = item.zoomImage || item.image;

  return `
    <div class="archive-image-zoom" role="dialog" aria-modal="true" aria-label="${item.title}放大查看">
      <button class="archive-image-zoom__backdrop" type="button" data-close-archive-image aria-label="关闭图片查看"></button>
      <article class="archive-image-zoom__card">
        <button class="archive-image-zoom__close" type="button" data-close-archive-image aria-label="关闭图片查看">关闭</button>
        <img src="${image}" alt="${item.title}" />
        <p>${item.title}</p>
      </article>
    </div>
  `;
}

export function renderStep(step, state) {
  return `
    <main class="zunyi-table">
      <section class="zunyi-stage">
        <header class="zunyi-stage__header">
          <p class="zunyi-stage__step">${step.title}</p>
          <h2>${step.prompt}</h2>
          <p>${state.level.location || "贵州遵义 · 遵义会议会址"}</p>
        </header>
        ${renderWorkspace(state)}
        <p class="zunyi-feedback" data-level-feedback data-feedback-tone="${state.feedbackTone || "neutral"}" aria-live="polite">${state.feedback}</p>
      </section>

      <aside class="zunyi-note">
        <p class="zunyi-note__label">会议记录纸</p>
        <h3>已写入的判断</h3>
        <ol>
          <li>${state.completed.has("crisis") ? "当前危机：红军损失惨重，继续被敌军追击；遵义提供了短暂休整机会。" : "当前危机：等待整理"}</li>
          <li>${state.completed.has("cause") ? "问题根源：错误军事指挥让红军长期被动。" : "问题根源：等待判断"}</li>
          <li>${state.completed.has("plan") ? "新方向：改变死板打法，采用灵活机动的运动战。" : "新方向：等待选择"}</li>
          <li>${state.completed.has("decision") ? "会议决定：批评错误路线，调整军事领导，继续北上。" : "会议决定：等待排序"}</li>
        </ol>
        <div class="zunyi-ai">
          <p class="zunyi-ai__label">小参谋</p>
          <p>${state.hint}</p>
          <button type="button" data-hint>问小参谋</button>
        </div>
      </aside>
    </main>
  `;
}

export function renderWorkspace(state) {
  if (state.step === "crisis") {
    return renderSortingWorkspace(state, CRISIS_CARDS, [
      { id: "crisis", title: "危机事实", desc: "损失、追击、被动局面" },
      { id: "chance", title: "暂时机会", desc: "攻占遵义后获得的休整时间" },
    ]);
  }

  if (state.step === "cause") {
    return renderSortingWorkspace(state, CAUSE_CARDS, [
      { id: "cause", title: "主要原因", desc: "会议真正要解决的问题" },
      { id: "distractor", title: "干扰原因", desc: "看似有关，但不是会议重点" },
    ]);
  }

  if (state.step === "plan") return renderPlanWorkspace();
  if (state.step === "decision") return renderDecisionWorkspace(state);
  return renderRouteWorkspace();
}

export function renderSortingWorkspace(state, cards, zones) {
  const placedIds = new Set(Object.keys(state.placed));

  return `
    <div class="zunyi-workspace">
      <div class="zunyi-cinematic-desk">
        <div class="zunyi-desk-perspective">
          <div class="zunyi-object-bank">
            ${renderDeskProps()}
            ${cards
              .filter((card) => !placedIds.has(card.id))
              .map((card) => renderEvidenceCard(card, state.selectedCard === card.id))
              .join("")}
          </div>
          <div class="zunyi-record-sheet">
            <span class="zunyi-record-sheet__clip"></span>
            <div class="zunyi-zones">
              ${zones.map((zone) => renderZone(zone, cards, state)).join("")}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderDeskProps() {
  return `
    <div class="zunyi-table-props">
      <img class="zunyi-prop zunyi-prop--lamp" src="${ZUNYI_ASSETS.props.keroseneLamp}" alt="" />
      <img class="zunyi-prop zunyi-prop--letter-stack" src="${ZUNYI_ASSETS.props.letterStack}" alt="" />
      <img class="zunyi-prop zunyi-prop--hand-letter" src="${ZUNYI_ASSETS.props.handwrittenLetter}" alt="" />
      <img class="zunyi-prop zunyi-prop--cap" src="${ZUNYI_ASSETS.props.redStarCap}" alt="" />
      <img class="zunyi-prop zunyi-prop--satchel" src="${ZUNYI_ASSETS.props.clothSatchel}" alt="" />
      <img class="zunyi-prop zunyi-prop--canteen" src="${ZUNYI_ASSETS.props.canteen}" alt="" />
      <span class="zunyi-prop zunyi-prop--cup"></span>
      <span class="zunyi-prop zunyi-prop--pencil"></span>
    </div>
  `;
}

export function renderEvidenceCard(card, selected) {
  return `
    <button
      type="button"
      class="zunyi-card zunyi-card--button ${cardClass(card)} ${selected ? "zunyi-card--selected" : ""}"
      data-card="${card.id}"
    >
      <span class="zunyi-card__pin"></span>
      <small>${card.kind === "map" ? "作战地图" : card.kind === "telegram" ? "电报纸" : card.kind === "record" ? "会议发言" : "史料纸"}</small>
      <span>${card.label}</span>
      <span class="zunyi-card__label">档</span>
    </button>
  `;
}

export function cardClass(card) {
  if (card.kind === "map") return "zunyi-object--meeting-map";
  if (card.kind === "telegram") return "zunyi-card--telegram";
  if (card.kind === "record") return "zunyi-object--record-book";
  if (card.kind === "note") return "zunyi-card--note";
  return "zunyi-card--report";
}

export function renderZone(zone, cards, state) {
  const placedCards = Object.entries(state.placed)
    .filter(([, target]) => target === zone.id)
    .map(([id]) => cards.find((card) => card.id === id))
    .filter(Boolean);

  return `
    <section class="zunyi-zone" data-zone="${zone.id}">
      <div class="zunyi-zone__heading">
        <h3>${zone.title}</h3>
      </div>
      <p>${zone.desc}</p>
      <div class="zunyi-zone__cards">
        ${placedCards
          .map(
            (card) => `
              <article class="zunyi-card zunyi-card--placed ${cardClass(card)}">
                <small>已归档</small>
                <span>${card.label}</span>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

export function renderPlanWorkspace() {
  return `
    <div class="zunyi-choice zunyi-choice--desk">
      <button class="zunyi-plan zunyi-plan--warn" type="button" data-plan="rigid">
        <span>继续正面硬拼</span>
        <small>沿用旧办法，在敌军优势兵力前继续被动消耗。</small>
      </button>
      <button class="zunyi-plan zunyi-plan--right" type="button" data-plan="mobile">
        <span>灵活机动，寻找机会</span>
        <small>避开敌人的优势，重新争取战场主动。</small>
      </button>
    </div>
  `;
}

export function renderDecisionWorkspace(state) {
  const used = new Set(state.decisions);

  return `
    <div class="zunyi-order">
      <div class="zunyi-order__track">
        ${DECISION_ORDER.map((_, index) => `<span>${state.decisions[index] ? `${index + 1}. ${labelForDecision(state.decisions[index])}` : `${index + 1}. 等待贴入决定卡`}</span>`).join("")}
      </div>
      <div class="zunyi-order__cards">
        ${DECISION_CARDS.map(
          (card) => `
            <button class="zunyi-card zunyi-card--button zunyi-card--decision" type="button" data-decision="${card.id}" ${used.has(card.id) ? "disabled" : ""}>
              <small>决定卡</small>
              <span>${card.label}</span>
              <em>${card.detail}</em>
            </button>
          `
        ).join("")}
      </div>
      <button class="zunyi-next" type="button" data-clear-decisions>重新排序</button>
    </div>
  `;
}

export function renderRouteWorkspace() {
  return `
    <div class="zunyi-turn-map" style="--zunyi-desk-bg: url('/assets/levels/zunyi-turn/meeting-table-room.jpg')">
      <img class="zunyi-turn-map__paper" src="/assets/levels/zunyi-turn/meeting-room-map.jpg" alt="会议后的路线图" />
      <div class="zunyi-turn-map__route">
        ${ROUTE_POINTS.map(
          (point, index) => `
            <article class="zunyi-turn-map__point" style="--point-index:${index}; --x:${10 + index * 27}%; --y:${index % 2 ? 62 : 34}%">
              <span>${index + 1}</span>
              <strong>${point}</strong>
            </article>
          `
        ).join("")}
      </div>
      <img class="zunyi-prop zunyi-prop--lamp zunyi-prop--turn-lamp" src="${ZUNYI_ASSETS.props.keroseneLamp}" alt="" />
      <button class="zunyi-next" type="button" data-finish>收好会议记录纸</button>
    </div>
  `;
}

export function labelForDecision(id) {
  return DECISION_CARDS.find((card) => card.id === id)?.label || "";
}

