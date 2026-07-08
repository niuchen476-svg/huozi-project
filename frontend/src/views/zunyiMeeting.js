import { ZUNYI_ASSETS } from "../cinematicAssets.js";

const SCENES = [
  {
    id: "door",
    title: "进入会场",
    objective: "靠近亮着灯的会议室",
    location: "遵义会议会址外",
    primaryBackground: "/assets/levels/zunyi-turn/dora-exterior.png",
    fallbackBackground: ZUNYI_ASSETS.cinematic.exteriorNight,
    mode: "exterior",
    action: "走近门口",
    dialogue: [
      { speaker: "记录员", text: "夜里，遵义会址还亮着灯。你跟着队伍来到门外。" },
      { speaker: "警戒员", text: "声音小一点。屋里正在讨论红军下一步怎么走。" },
      { speaker: "记录员", text: "这不是普通会议。湘江之后，大家都知道不能再照旧打了。" },
    ],
  },
  {
    id: "threshold",
    title: "门口旁听",
    objective: "听清会议真正讨论的问题",
    location: "会议室门口",
    primaryBackground: "/assets/levels/zunyi-turn/dora-doorway.png",
    fallbackBackground: ZUNYI_ASSETS.cinematic.meetingRoomWide,
    mode: "doorway",
    action: "到桌边记录",
    dialogue: [
      { speaker: "会议发言", text: "第五次反“围剿”失利后，红军一路被动。" },
      { speaker: "会议发言", text: "湘江之后，中央红军从 8.6 万人减少到约 3 万人。" },
      { speaker: "会议主持", text: "问题不只是敌人强。军事指挥和打法，必须重新判断。" },
      { speaker: "会议发言", text: "不能再死板硬打，要想办法重新争取主动。" },
    ],
  },
  {
    id: "desk",
    title: "桌边记录",
    objective: "把关键线索记下来",
    location: "会议桌旁",
    primaryBackground: "/assets/levels/zunyi-turn/dora-desk.png",
    fallbackBackground: ZUNYI_ASSETS.cinematic.meetingRoomWide,
    mode: "desk",
    action: "提交会议判断",
    observations: [
      { title: "战损报告", text: "湘江之后，队伍锐减，红军已经到了非常危险的关头。" },
      { title: "作战地图", text: "追兵还在逼近，继续正面硬拼会让队伍更被动。" },
      { title: "会议记录", text: "会议重点批评错误军事指挥，讨论新的领导和新的打法。" },
    ],
  },
  {
    id: "choice",
    title: "会议判断",
    objective: "判断下一步方向",
    location: "会议桌旁",
    primaryBackground: "/assets/levels/zunyi-turn/dora-desk.png",
    fallbackBackground: ZUNYI_ASSETS.cinematic.meetingRoomWide,
    mode: "choice",
    dialogue: [
      { speaker: "会议决定", text: "会议批评了博古、李德在军事指挥上的错误。" },
      { speaker: "会议决定", text: "会议增选毛泽东为中央政治局常委。" },
      { speaker: "会议决定", text: "红军接下来要改变死板打法，继续北上。" },
    ],
  },
  {
    id: "route",
    title: "转折之后",
    objective: "看新的方向怎样影响后面的路线",
    location: "会议后的地图",
    primaryBackground: "/assets/levels/zunyi-turn/dora-desk.png",
    fallbackBackground: ZUNYI_ASSETS.props.meetingMapFallback,
    mode: "route",
    action: "收好会议记录纸",
    dialogue: [
      { speaker: "记录员", text: "遵义会议之后，红军不再只是被动挨打。" },
      { speaker: "记录员", text: "四渡赤水、巧渡金沙江、飞夺泸定桥，都是重新争取主动的路。" },
    ],
  },
];

const ROUTE_POINTS = ["遵义会议", "四渡赤水", "巧渡金沙江", "飞夺泸定桥"];

export function renderZunyiMeeting(root, level) {
  return new Promise((resolve) => {
    const state = {
      index: 0,
      progress: {},
      level,
      resolve,
    };

    root.innerHTML = `
      <div class="zunyi-pov" id="zunyi-pov">
        <div class="zunyi-pov__frame" id="zunyi-frame"></div>
      </div>
    `;

    renderScene(state);
  });
}

function getStep(state) {
  const scene = SCENES[state.index];
  return state.progress[scene.id] || 0;
}

function isSceneComplete(scene, state) {
  const step = getStep(state);
  if (scene.dialogue) return step >= scene.dialogue.length - 1;
  if (scene.observations) return step >= scene.observations.length - 1;
  return true;
}

function renderScene(state) {
  const scene = SCENES[state.index];
  const level = state.level;
  const frame = document.querySelector("#zunyi-frame");
  const complete = isSceneComplete(scene, state);

  frame.className = `zunyi-pov__frame zunyi-pov__frame--${scene.mode}`;
  frame.style.setProperty("--zunyi-bg-primary", `url("${scene.primaryBackground}")`);
  frame.style.setProperty("--zunyi-bg-fallback", `url("${scene.fallbackBackground}")`);
  frame.innerHTML = `
    <div class="zunyi-pov__image"></div>
    <div class="zunyi-pov__grain"></div>
    <div class="zunyi-pov__vignette"></div>

    <a class="zunyi-pov__back" href="#/map">返回路线图</a>

    <div class="zunyi-pov__topline">
      <span>${level.date || "1935 年 1 月"}</span>
      <div class="zunyi-pov__compass" aria-label="任务进度">
        ${SCENES.map((item, index) => `<i class="${index <= state.index ? "is-lit" : ""}"></i>`).join("")}
      </div>
      <span>${scene.location}</span>
    </div>

    ${renderSceneBody(scene, state)}

    <section class="zunyi-pov__brief">
      <p>${scene.objective}</p>
      <h1>${scene.title}</h1>
    </section>

    <div class="zunyi-pov__hud">
      <strong>${level.title || "遵义转折"}</strong>
      <span>会议记录员视角</span>
    </div>

    ${scene.action && complete ? `
      <button class="zunyi-pov__action" type="button">${scene.action}</button>
    ` : ""}
  `;

  setupSceneEvents(scene, state);
}

function renderSceneBody(scene, state) {
  if (scene.dialogue) {
    return renderDialogue(scene, state);
  }

  if (scene.observations) {
    return renderObservations(scene, state);
  }

  return "";
}

function renderDialogue(scene, state) {
  const step = getStep(state);
  const line = scene.dialogue[step];
  const complete = step >= scene.dialogue.length - 1;

  return `
    <div class="zunyi-pov__dialogue">
      <p>${line.speaker}</p>
      <strong>${line.text}</strong>
      ${complete ? "" : `<button type="button" data-next-line>继续听</button>`}
    </div>
    ${scene.id === "choice" ? renderChoicePanel(complete) : ""}
    ${scene.id === "route" ? renderRoutePanel() : ""}
  `;
}

function renderObservations(scene, state) {
  const step = getStep(state);
  const item = scene.observations[step];
  const complete = step >= scene.observations.length - 1;

  return `
    <div class="zunyi-pov__observation">
      <p>正在记录：${item.title}</p>
      <strong>${item.text}</strong>
      ${complete ? "" : `<button type="button" data-next-line>继续观察</button>`}
    </div>
  `;
}

function renderChoicePanel(showChoices) {
  if (!showChoices) return "";

  return `
    <div class="zunyi-pov__choice">
      <button type="button" data-choice="rigid">
        <strong>继续正面硬拼</strong>
        <span>旧办法，会继续陷入被动。</span>
      </button>
      <button type="button" data-choice="mobile">
        <strong>灵活机动，寻找机会</strong>
        <span>新方向，重新争取主动。</span>
      </button>
    </div>
    <p class="zunyi-pov__feedback" id="zunyi-feedback">选择会议建议。</p>
  `;
}

function renderRoutePanel() {
  return `
    <div class="zunyi-pov__route">
      ${ROUTE_POINTS.map((point, index) => `
        <article style="--x:${4 + index * 27}%; --delay:${index * 0.18}s">
          <span>${index + 1}</span>
          <strong>${point}</strong>
        </article>
      `).join("")}
    </div>
    <p class="zunyi-pov__route-note">会议后的路线开始变得主动。</p>
  `;
}

function setupSceneEvents(scene, state) {
  document.querySelector("[data-next-line]")?.addEventListener("click", () => {
    state.progress[scene.id] = getStep(state) + 1;
    renderScene(state);
  });

  document.querySelector(".zunyi-pov__action")?.addEventListener("click", () => {
    if (scene.id === "route") {
      state.resolve();
      return;
    }
    state.index += 1;
    renderScene(state);
  });

  document.querySelectorAll("[data-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const feedback = document.querySelector("#zunyi-feedback");
      if (button.dataset.choice === "rigid") {
        feedback.textContent = "这个判断还是旧打法。会议真正要改变的是被动硬拼。";
        button.classList.add("is-wrong");
        return;
      }

      button.classList.add("is-right");
      feedback.textContent = "判断成立：改变死板打法，采用灵活机动的运动战。";
      setTimeout(() => {
        state.index += 1;
        renderScene(state);
      }, 650);
    });
  });
}
