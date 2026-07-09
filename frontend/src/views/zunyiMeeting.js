import { ZUNYI_ASSETS } from "../cinematicAssets.js";
import { resumeBgmAfterMedia, suspendBgmForMedia } from "../bgm.js";

const STEPS = [
  {
    id: "intro",
    title: "进入会议室",
    prompt: "先听清楚这场会议为什么必须召开。",
  },
  {
    id: "rewrite",
    title: "会场记录",
    prompt: "新的遵义会议游戏逻辑待接入。",
  },
  {
    id: "crisis",
    title: "一、整理当前局面",
    prompt: "点击一张桌上的史料，再点击右侧记录纸上的对应栏目。",
  },
  {
    id: "cause",
    title: "二、判断问题根源",
    prompt: "把真正的原因和干扰项分开。会议不是在否定战士，而是在重新判断指挥和打法。",
  },
  {
    id: "plan",
    title: "三、选择新的方向",
    prompt: "在两种方案里选出能让红军重新争取主动的一种。",
  },
  {
    id: "decision",
    title: "四、完成会议记录",
    prompt: "按逻辑顺序整理会议决定。",
  },
  {
    id: "route",
    title: "转折验证",
    prompt: "看会议后的路线怎样从被动转向主动。",
  },
];

const CRISIS_CARDS = [
  {
    id: "xiangjiang-loss",
    label: "湘江战役损失惨重",
    type: "crisis",
    kind: "report",
    hint: "这是危机事实：队伍已经到了非常危险的关头。",
  },
  {
    id: "number-drop",
    label: "队伍从 8.6 万人减少到约 3 万人",
    type: "crisis",
    kind: "report",
    hint: "这是危机事实：人数锐减说明原来的打法不能再照旧。",
  },
  {
    id: "enemy-chase",
    label: "敌军继续围追堵截",
    type: "crisis",
    kind: "map",
    hint: "这是危机事实：外部压力仍在逼近。",
  },
  {
    id: "zunyi-rest",
    label: "攻占遵义，获得短暂休整",
    type: "chance",
    kind: "telegram",
    hint: "这是暂时机会：终于能坐下来认真解决问题。",
  },
];

const CAUSE_CARDS = [
  {
    id: "rigid-battle",
    label: "死板阵地战",
    type: "cause",
    kind: "record",
    hint: "这是主要原因：打法太死板，容易被敌人牵着走。",
  },
  {
    id: "passive",
    label: "长期被动挨打",
    type: "cause",
    kind: "map",
    hint: "这是主要原因：红军需要重新争取主动。",
  },
  {
    id: "wrong-command",
    label: "错误军事指挥",
    type: "cause",
    kind: "telegram",
    hint: "这是主要原因：会议集中批评的就是错误军事指挥。",
  },
  {
    id: "not-brave",
    label: "战士不勇敢",
    type: "distractor",
    kind: "note",
    hint: "这是干扰项。湘江战役中红军苦战五昼夜，问题不是战士不勇敢。",
  },
  {
    id: "bad-weather",
    label: "天气不好",
    type: "distractor",
    kind: "note",
    hint: "这是干扰项。天气会增加困难，但会议重点讨论的是指挥和打法。",
  },
];

const DECISION_CARDS = [
  { id: "criticize", label: "批评错误军事路线", detail: "先指出为什么原来的打法让红军陷入被动。" },
  { id: "leadership", label: "调整军事领导", detail: "再让新的判断进入核心指挥。" },
  { id: "north", label: "红军继续北上", detail: "最后把新的方向落实到接下来的路线。" },
];

const DECISION_ORDER = ["criticize", "leadership", "north"];
const ROUTE_POINTS = ["遵义会议", "四渡赤水", "巧渡金沙江", "飞夺泸定桥"];
const ZUNYI_FRAGMENT = {
  id: "zunyi-direction",
  title: "方向碎片",
  mark: "转折",
  image: "/assets/fragments/fragment-zunyi-direction.png",
  text: "你记录下了遵义会议的关键判断。它会放进档案袋，和后面“四渡赤水”“飞夺泸定桥”的路线线索连在一起，说明红军怎样一步步重新争取主动。",
  gallery: [
    {
      image: "/assets/levels/zunyi-turn/site-exterior.png",
      zoomImage: "/assets/levels/zunyi-turn/site-exterior.png",
      title: "会址外景",
    },
    {
      image: "/assets/levels/zunyi-turn/meeting-room-map.png",
      zoomImage: "/assets/levels/zunyi-turn/meeting-room-map.png",
      title: "会场线索",
    },
    {
      image: "/assets/levels/zunyi-turn/handwriting-closeup.png",
      zoomImage: "/assets/levels/zunyi-turn/handwriting-closeup.png",
      title: "记录细节",
    },
  ],
};
const MEETING_RECORDS = [
  {
    id: "lesson",
    speaker: "会场发言一",
    line: "红军损失很大，不能只怪敌人强。我们要认真总结，前面的指挥和打法哪里出了问题。",
    answer: "总结失败教训",
    choices: ["总结失败教训", "天气道路困难", "只记录敌人强大"],
    written: "记录一：会议认真总结第五次反“围剿”失败和长征初期受挫的教训。",
    wrongFeedback: "这句发言不是在说天气，也不是只说敌人强。它最重要的是：先把失败教训总结清楚。",
    sourceCard: {
      title: "《关于反对敌人五次围剿的总结》的决议",
      text: "这份《决议》重点总结第五次反“围剿”和长征初期的失败教训，指出错误不是为了削弱团结，而是为了把问题讲清楚、把队伍重新凝聚起来。",
      image: "/assets/levels/zunyi-turn/source/zunyi-record-summary-cover.png",
      zoomImage: "/assets/levels/zunyi-turn/source/zunyi-record-summary-pages.png",
      sourceName: "《关于反对敌人五次围剿的总结》的决议",
      excerpt: "党在揭发了这种错误之后，不是削弱而是加强了。",
      credit: "中央档案馆藏遵义会议相关决议文献",
      note: "这份《决议》篇幅很长，核心是总结错误军事指挥带来的损失，并强调揭发错误是为了加强党和红军的团结。",
    },
  },
  {
    id: "command",
    speaker: "会场发言二",
    line: "如果指挥脱离实际，打法太死板，红军就会一直被敌人牵着走。",
    answer: "军事指挥问题",
    choices: ["战士不够勇敢", "军事指挥问题", "粮食不够充足"],
    written: "记录二：会议重点讨论当时最紧迫的军事指挥和作战方法问题。",
    wrongFeedback: "这句发言不是批评战士，也不是只讲物资。它指向的是当时最紧迫的军事指挥问题。",
    sourceCard: {
      title: "军事指挥和作战方法",
      text: "遵义会议集中讨论当时最紧迫的军事问题，批评脱离实际的指挥和死板打法。",
      image: "/assets/levels/zunyi-turn/meeting-manuscript.png",
      sourceName: "《（乙）遵义政治局扩大会议》（陈云手稿）",
      excerpt: "检阅在反对五次‘围剿’中与西征中军事指挥上的经验与教训。",
      credit: "中央档案馆藏《（乙）遵义政治局扩大会议》手稿",
      note: "这说明遵义会议不是简单开会，而是在认真总结军事指挥上的经验和教训。",
    },
  },
  {
    id: "direction",
    speaker: "会场发言三",
    line: "这次会议增选毛泽东同志为中央政治局常委，让他参加中央军事指挥的领导工作。红军要用更灵活的办法，重新争取主动。",
    answer: "调整领导，争取主动",
    choices: ["继续原来打法", "原地长期休整", "调整领导，争取主动"],
    written: "记录三：会议增选毛泽东同志为中央政治局常委，推动红军调整领导和指挥方式，重新争取主动。",
    wrongFeedback: "会议不是要继续原来的打法，也不是原地停下来。关键是调整领导和指挥方式，重新争取主动。",
    sourceCard: {
      title: "重要组织调整",
      text: "会议增选毛泽东同志为中央政治局常委，并让他参加中央军事指挥的领导工作，红军开始重新争取主动。",
      image: "/assets/levels/zunyi-turn/zunyi-leadership-adjustment-detail.png",
      zoomImage: "/assets/levels/zunyi-turn/zunyi-leadership-adjustment-thumb.png",
      sourceName: "遵义会议后的重要组织调整",
      excerpt: "增选毛泽东同志为中央政治局常委，并让他参加中央军事指挥的领导工作。",
      credit: "根据遵义会议相关史实整理",
      note: "这条史实要表达的是领导和军事指挥方式的调整。对小记录员来说，重点不是背人名，而是理解红军为什么能重新争取主动。",
    },
  },
];
const REWRITE_SCENES = [
  {
    id: "arrival-crisis",
    label: "第一幕 1/3",
    title: "为什么必须开这次会？",
    text: "长征刚开始时，中央红军连续遭到敌人围追堵截。特别是湘江战役后，队伍损失很大，大家都意识到：如果继续照旧走下去，红军会越来越危险。",
    image: ZUNYI_ASSETS.cinematic.exteriorNight,
  },
  {
    id: "arrival-question",
    label: "第一幕 2/3",
    title: "问题出在哪里？",
    text: "当时最需要弄清楚的，不是谁勇不勇敢，而是前面的军事指挥和打法有没有问题。红军需要停下来认真讨论：为什么会被动，下一步怎样才能争取主动。",
    image: ZUNYI_ASSETS.cinematic.exteriorNight,
  },
  {
    id: "arrival-chance",
    label: "第一幕 3/3",
    title: "遵义给了短暂机会",
    text: "1935 年 1 月，红军攻占贵州遵义，终于获得短暂休整。于是，中共中央在这里召开政治局扩大会议，重新总结经验，调整方向。这就是遵义会议召开的重要背景。",
    image: ZUNYI_ASSETS.cinematic.exteriorNight,
  },
  {
    id: "doorway-crisis",
    label: "第二幕 1/3",
    title: "会议即将开始",
    text: "你来到会场门口，屋里的人神色凝重。第五次反“围剿”失利后，中央红军被迫开始长征；湘江战役又让队伍遭受严重损失，敌人的围追堵截还没有停止。",
    image: ZUNYI_ASSETS.cinematic.doorwayEntry,
  },
  {
    id: "doorway-turning-point",
    label: "第二幕 2/3",
    title: "已经到了关键关头",
    text: "大家担忧的不只是一路行军的艰苦，更是党和红军接下来该往哪里走、怎样摆脱被动。如果再不能认真总结错误、调整方向，前途命运都会面临更大的危险。",
    image: ZUNYI_ASSETS.cinematic.doorwayEntry,
  },
  {
    id: "doorway-recorder",
    label: "第二幕 3/3",
    title: "记录员，请准备好",
    text: "作为这场会议的小记录员，你要仔细听清每一次发言：哪些是在总结失败教训，哪些是在讨论军事指挥和组织调整。把这些记准确，才能理解遵义会议为什么是生死攸关的转折点。",
    image: ZUNYI_ASSETS.cinematic.doorwayEntry,
  },
  {
    id: "desk",
    label: "第三幕",
    title: "坐到会议桌前",
    text: "纸笔已经摆好，发言声在屋里低低响起。请把每一句话里最重要的意思写进会议记录纸。",
    image: ZUNYI_ASSETS.cinematic.recorderDesk,
    game: "record",
  },
];

export function renderZunyiMeeting(root, level) {
  return new Promise((resolve) => {
    const state = {
      level,
      resolve,
      step: "intro",
      selectedCard: null,
      placed: {},
      decisions: [],
      completed: new Set(),
      showVideo: false,
      showRolePrompt: true,
      rewriteScene: 0,
      meetingRecordIndex: 0,
      meetingRecords: [],
      archivedSources: [],
      lastWrittenRecord: null,
      activeSourceCard: null,
      zoomSourceCard: null,
      zoomArchiveImage: null,
      showFragment: false,
      recordFeedback: "先听发言，再选择最应该写进记录纸的重点。",
      feedback: "你是会议小记录员。先把桌上的线索整理清楚，再写出会议判断。",
      hint: "小参谋：别急着背结论，先看见危机，再找原因。",
    };

    render(root, state);
  });
}

function render(root, state) {
  const step = STEPS.find((item) => item.id === state.step);

  root.innerHTML = `
    <div class="view-zunyi">
      <div class="zunyi-room ${state.step === "intro" ? "zunyi-room--intro" : state.step === "rewrite" ? "zunyi-room--rewrite" : ""}">
        <div class="zunyi-room__lamp"></div>
        <div class="zunyi-topbar">
          <a class="zunyi-back" href="#/map">返回路线图</a>
          <div class="zunyi-progress" aria-label="关卡进度">
            ${STEPS.map((item) => `<span class="zunyi-progress__dot ${progressClass(item, state)}"></span>`).join("")}
          </div>
        </div>

        ${state.step === "intro" ? renderIntro(state) : state.step === "rewrite" ? renderRewriteCanvas(state) : renderStep(step, state)}
      </div>
      ${state.showFragment ? renderArchiveFragment(ZUNYI_FRAGMENT) : ""}
      ${state.zoomSourceCard ? renderSourceCardZoom(state.zoomSourceCard) : ""}
      ${state.zoomArchiveImage ? renderArchiveImageZoom(state.zoomArchiveImage) : ""}
    </div>
  `;

  attachEvents(root, state);
}

function progressClass(item, state) {
  if (item.id === state.step) return "zunyi-progress__dot--active";
  if (state.completed.has(item.id)) return "zunyi-progress__dot--done";
  return "";
}

function renderIntro(state) {
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
        <button type="button" id="history-intro-start" data-next-step>开始记录</button>
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

function renderRolePrompt() {
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

function renderVideoModal() {
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

function renderRewriteCanvas(state) {
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

function renderMeetingSpeakerBubble(state) {
  const record = MEETING_RECORDS[state.meetingRecordIndex];
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

function renderMeetingRecordGame(state) {
  const record = MEETING_RECORDS[state.meetingRecordIndex];
  const completed = state.meetingRecords.length >= MEETING_RECORDS.length && !state.activeSourceCard;

  if (completed) {
    return `
      <div class="zunyi-record-game">
        <div class="zunyi-record-game__paper">
          <strong>会议记录纸</strong>
          <b class="zunyi-record-game__status">会议记录完成</b>
          ${MEETING_RECORDS.map((item) => `<em class="is-written">${item.written}</em>`).join("")}
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
        ${MEETING_RECORDS.map((item) => {
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

function renderArchivedSourceTags(state) {
  if (!state.archivedSources.length) return "";

  return `
    <div class="zunyi-record-game__archives" aria-label="已归档史料">
      ${state.archivedSources.map((id, index) => {
        const item = MEETING_RECORDS.find((record) => record.id === id);
        return `<span>史料${index + 1}已归档：${item?.sourceCard.title || "相关史料"}</span>`;
      }).join("")}
    </div>
  `;
}

function renderSourceCard(card) {
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

function renderSourceCardZoom(card) {
  const image = card.zoomImage || card.image;

  return `
    <div class="zunyi-source-zoom" role="dialog" aria-modal="true" aria-label="史料放大查看">
      <button class="zunyi-source-zoom__backdrop" type="button" data-close-source-zoom aria-label="关闭史料查看"></button>
      <article class="zunyi-source-zoom__card">
        <button class="zunyi-source-zoom__close" type="button" data-close-source-zoom aria-label="关闭史料查看">关闭</button>
        <div class="zunyi-source-zoom__image" style="background-image: url('${image}')"></div>
        <div class="zunyi-source-zoom__body">
          <small>史料补充</small>
          <h2>${card.title}</h2>
          ${renderSourceDetail(card)}
        </div>
      </article>
    </div>
  `;
}

function renderSourceDetail(card) {
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

function renderArchiveFragment(fragment) {
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

function renderArchiveFragmentPiece(fragment, type) {
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

function renderArchiveFragmentGallery(fragment) {
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

function renderArchiveImageZoom(item) {
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

function renderStep(step, state) {
  return `
    <main class="zunyi-table">
      <section class="zunyi-stage">
        <header class="zunyi-stage__header">
          <p class="zunyi-stage__step">${step.title}</p>
          <h2>${step.prompt}</h2>
          <p>${state.level.location || "贵州遵义 · 遵义会议会址"}</p>
        </header>
        ${renderWorkspace(state)}
        <p class="zunyi-feedback" aria-live="polite">${state.feedback}</p>
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

function renderWorkspace(state) {
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

function renderSortingWorkspace(state, cards, zones) {
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

function renderDeskProps() {
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

function renderEvidenceCard(card, selected) {
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

function cardClass(card) {
  if (card.kind === "map") return "zunyi-object--meeting-map";
  if (card.kind === "telegram") return "zunyi-card--telegram";
  if (card.kind === "record") return "zunyi-object--record-book";
  if (card.kind === "note") return "zunyi-card--note";
  return "zunyi-card--report";
}

function renderZone(zone, cards, state) {
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

function renderPlanWorkspace() {
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

function renderDecisionWorkspace(state) {
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

function renderRouteWorkspace() {
  return `
    <div class="zunyi-turn-map" style="--zunyi-desk-bg: url('/assets/levels/zunyi-turn/meeting-table-room.png')">
      <img class="zunyi-turn-map__paper" src="/assets/levels/zunyi-turn/meeting-room-map.png" alt="会议后的路线图" />
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

function labelForDecision(id) {
  return DECISION_CARDS.find((card) => card.id === id)?.label || "";
}

function attachEvents(root, state) {
  root.querySelector("[data-next-step]")?.addEventListener("click", () => {
    state.completed.add("intro");
    state.step = "rewrite";
    state.showVideo = false;
    resumeBgmAfterMedia();
    render(root, state);
  });

  root.querySelector("[data-show-video]")?.addEventListener("click", () => {
    suspendBgmForMedia();
    state.showVideo = true;
    render(root, state);
  });

  root.querySelectorAll("[data-close-video]").forEach((button) => {
    button.addEventListener("click", () => {
      state.showVideo = false;
      resumeBgmAfterMedia();
      render(root, state);
    });
  });

  root.querySelector("[data-close-role-prompt]")?.addEventListener("click", () => {
    state.showRolePrompt = false;
    render(root, state);
  });

  root.querySelector("[data-next-rewrite-scene]")?.addEventListener("click", () => {
    state.rewriteScene = Math.min(REWRITE_SCENES.length - 1, state.rewriteScene + 1);
    render(root, state);
  });

  root.querySelectorAll("[data-record-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const record = MEETING_RECORDS[state.meetingRecordIndex];
      if (!record || state.activeSourceCard) return;

      if (button.dataset.recordChoice !== record.answer) {
        state.recordFeedback = record.wrongFeedback || "这条还不是发言里最关键的意思。再听一遍，重点在会议要解决的问题和方向。";
        render(root, state);
        return;
      }

      state.meetingRecords.push(record.id);
      state.lastWrittenRecord = record.id;
      state.activeSourceCard = record.sourceCard;
      state.recordFeedback = "记录正确。先把这份相关史料收进记录夹。";
      render(root, state);
    });
  });

  root.querySelector("[data-collect-source-card]")?.addEventListener("click", () => {
    const currentRecord = MEETING_RECORDS[state.meetingRecordIndex];
    if (currentRecord && !state.archivedSources.includes(currentRecord.id)) {
      state.archivedSources.push(currentRecord.id);
    }
    state.activeSourceCard = null;
    state.zoomSourceCard = null;
    state.meetingRecordIndex = Math.min(MEETING_RECORDS.length, state.meetingRecordIndex + 1);
    state.recordFeedback = state.meetingRecordIndex >= MEETING_RECORDS.length
      ? "三份史料已经归档，会议记录可以收好了。"
      : "史料已归档。继续听下一句发言。";
    render(root, state);
  });

  root.querySelector("[data-zoom-source-card]")?.addEventListener("click", () => {
    state.zoomSourceCard = state.activeSourceCard;
    render(root, state);
  });

  root.querySelectorAll("[data-close-source-zoom]").forEach((button) => {
    button.addEventListener("click", () => {
      state.zoomSourceCard = null;
      render(root, state);
    });
  });

  root.querySelectorAll("[data-archive-image]").forEach((button) => {
    button.addEventListener("click", () => {
      const image = ZUNYI_FRAGMENT.gallery?.[Number(button.dataset.archiveImage)];
      if (!image) return;
      state.zoomArchiveImage = image;
      render(root, state);
    });
  });

  root.querySelectorAll("[data-close-archive-image]").forEach((button) => {
    button.addEventListener("click", () => {
      state.zoomArchiveImage = null;
      render(root, state);
    });
  });

  root.querySelector("[data-finish-rewrite]")?.addEventListener("click", () => {
    state.completed.add("rewrite");
    state.showFragment = true;
    render(root, state);
  });

  root.querySelector("[data-collect-fragment]")?.addEventListener("click", () => {
    saveArchiveFragment(ZUNYI_FRAGMENT.id);
    state.resolve();
  });

  root.querySelectorAll("[data-card]").forEach((button) => {
    button.addEventListener("click", () => {
      const cards = state.step === "crisis" ? CRISIS_CARDS : CAUSE_CARDS;
      const card = cards.find((item) => item.id === button.dataset.card);
      state.selectedCard = card.id;
      state.feedback = `已拿起：${card.label}。现在点右侧记录纸上的栏目。`;
      state.hint = `小参谋：${card.hint}`;
      render(root, state);
    });
  });

  root.querySelectorAll("[data-zone]").forEach((zone) => {
    zone.addEventListener("click", () => placeSelectedCard(root, state, zone.dataset.zone));
  });

  root.querySelector("[data-hint]")?.addEventListener("click", () => {
    state.hint = hintForStep(state);
    render(root, state);
  });

  root.querySelectorAll("[data-plan]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.plan !== "mobile") {
        state.feedback = "这个判断还是旧打法。红军已经损失严重，继续硬拼会再次陷入被动。";
        state.hint = "小参谋：转折不是继续原来的路，而是换一种能争取主动的打法。";
        render(root, state);
        return;
      }
      state.completed.add("plan");
      state.step = "decision";
      state.feedback = "判断成立：改变死板打法，采用灵活机动的运动战。现在整理会议决定。";
      state.hint = "小参谋：先指出错误，再调整领导，最后确定接下来的方向。";
      render(root, state);
    });
  });

  root.querySelectorAll("[data-decision]").forEach((button) => {
    button.addEventListener("click", () => {
      if (state.decisions.length >= DECISION_ORDER.length) return;
      state.decisions.push(button.dataset.decision);
      const correctSoFar = state.decisions.every((id, index) => id === DECISION_ORDER[index]);
      if (!correctSoFar) {
        state.feedback = "顺序还不稳：先要批评错误路线，再调整军事领导，最后决定继续北上。";
        state.hint = "小参谋：会议记录要像推理一样，先原因，再调整，再行动。";
      } else if (state.decisions.length === DECISION_ORDER.length) {
        state.completed.add("decision");
        state.step = "route";
        state.feedback = "会议记录整理完成。现在看这次会议为什么能成为转折。";
        state.hint = "小参谋：会后的路线亮起来，说明红军开始重新争取主动。";
      } else {
        state.feedback = "这一张贴对了，继续补全会议记录。";
      }
      render(root, state);
    });
  });

  root.querySelector("[data-clear-decisions]")?.addEventListener("click", () => {
    state.decisions = [];
    state.feedback = "已清空排序。重新按“原因、调整、行动”的逻辑贴决定卡。";
    render(root, state);
  });

  root.querySelector("[data-finish]")?.addEventListener("click", () => {
    state.completed.add("route");
    state.showFragment = true;
    render(root, state);
  });
}

function saveArchiveFragment(id) {
  const key = "huozi.archiveFragments";
  const fragments = JSON.parse(window.localStorage.getItem(key) || "[]");
  if (!fragments.includes(id)) {
    fragments.push(id);
    window.localStorage.setItem(key, JSON.stringify(fragments));
  }
}

function placeSelectedCard(root, state, zoneId) {
  if (!state.selectedCard) {
    state.feedback = "先点击桌上的一张史料纸，再放到记录纸栏目里。";
    return render(root, state);
  }

  const cards = state.step === "crisis" ? CRISIS_CARDS : CAUSE_CARDS;
  const card = cards.find((item) => item.id === state.selectedCard);

  if (card.type !== zoneId) {
    state.feedback = card.type === "distractor"
      ? "这张更像干扰项。它会影响局面，但不是遵义会议真正要解决的重点。"
      : "再想想这张史料说的是危机、机会，还是原因。";
    state.hint = `小参谋：${card.hint}`;
    render(root, state);
    return;
  }

  state.placed[card.id] = zoneId;
  state.selectedCard = null;
  state.feedback = card.hint;

  const required = cards.filter((item) => item.type !== "distractor" || state.step === "cause");
  const complete = required.every((item) => state.placed[item.id] === item.type);

  if (complete) {
    state.completed.add(state.step);
    if (state.step === "crisis") {
      state.step = "cause";
      state.placed = {};
      state.feedback = "局面看清楚了。下一步要判断：问题根源到底是什么？";
      state.hint = "小参谋：不要把结果当原因，也不要把战士当问题。看“指挥”和“打法”。";
    } else {
      state.step = "plan";
      state.placed = {};
      state.feedback = "原因找到了：错误军事指挥让红军长期被动。现在选择新的方向。";
      state.hint = "小参谋：如果继续硬拼，就是没有转折。";
    }
  }

  render(root, state);
}

function hintForStep(state) {
  if (state.step === "crisis") return "小参谋：人数锐减、敌军追击放进危机；攻占遵义带来的休整放进机会。";
  if (state.step === "cause") return "小参谋：会议重点是军事指挥和打法，不是说战士不勇敢。";
  if (state.step === "plan") return "小参谋：能让红军重新争取主动的方案，才是新的方向。";
  if (state.step === "decision") return "小参谋：顺序是批评错误路线、调整军事领导、继续北上。";
  return "小参谋：四渡赤水、巧渡金沙江、飞夺泸定桥，都是转向主动后的路线。";
}
