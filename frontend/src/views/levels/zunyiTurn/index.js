import { ZUNYI_ASSETS } from "../../../cinematicAssets.js";
import { resumeBgmAfterMedia, suspendBgmForMedia } from "../../../bgm.js";
import {
  CAUSE_CARDS,
  CRISIS_CARDS,
  DECISION_CARDS,
  DECISION_ORDER,
  MEETING_RECORDS,
  REWRITE_SCENES,
  ROUTE_POINTS,
  STEPS,
  ZUNYI_FRAGMENT,
} from "./data.js";

import {
  progressClass,
  renderArchiveImageZoom,
  renderIntro,
  renderRewriteCanvas,
  renderSourceCardZoom,
  renderStep,
} from "./views.js";

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
      recordFeedback: "先听发言，再选择最应该写进记录纸的重点。",
      feedback: "你是会议小记录员。先把桌上的线索整理清楚，再写出会议判断。",
      feedbackTone: "neutral",
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
      ${state.zoomSourceCard ? renderSourceCardZoom(state.zoomSourceCard) : ""}
      ${state.zoomArchiveImage ? renderArchiveImageZoom(state.zoomArchiveImage) : ""}
    </div>
  `;

  attachEvents(root, state);
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
    state.resolve("completed");
  });

  root.querySelectorAll("[data-card]").forEach((button) => {
    button.addEventListener("click", () => {
      const cards = state.step === "crisis" ? CRISIS_CARDS : CAUSE_CARDS;
      const card = cards.find((item) => item.id === button.dataset.card);
      state.selectedCard = card.id;
      state.feedback = `已拿起：${card.label}。现在点右侧记录纸上的栏目。`;
      state.feedbackTone = "neutral";
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
        state.feedbackTone = "error";
        state.hint = "小参谋：转折不是继续原来的路，而是换一种能争取主动的打法。";
        render(root, state);
        return;
      }
      state.completed.add("plan");
      state.step = "decision";
      state.feedback = "判断成立：改变死板打法，采用灵活机动的运动战。现在整理会议决定。";
      state.feedbackTone = "success";
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
        state.feedbackTone = "error";
        state.hint = "小参谋：会议记录要像推理一样，先原因，再调整，再行动。";
      } else if (state.decisions.length === DECISION_ORDER.length) {
        state.completed.add("decision");
        state.step = "route";
        state.feedback = "会议记录整理完成。现在看这次会议为什么能成为转折。";
        state.feedbackTone = "success";
        state.hint = "小参谋：会后的路线亮起来，说明红军开始重新争取主动。";
      } else {
        state.feedback = "这一张贴对了，继续补全会议记录。";
        state.feedbackTone = "success";
      }
      render(root, state);
    });
  });

  root.querySelector("[data-clear-decisions]")?.addEventListener("click", () => {
    state.decisions = [];
    state.feedback = "已清空排序。重新按“原因、调整、行动”的逻辑贴决定卡。";
    state.feedbackTone = "neutral";
    render(root, state);
  });

  root.querySelector("[data-finish]")?.addEventListener("click", () => {
    state.completed.add("route");
    state.resolve("completed");
  });
}

function placeSelectedCard(root, state, zoneId) {
  if (!state.selectedCard) {
    state.feedback = "先点击桌上的一张史料纸，再放到记录纸栏目里。";
    state.feedbackTone = "assist";
    return render(root, state);
  }

  const cards = state.step === "crisis" ? CRISIS_CARDS : CAUSE_CARDS;
  const card = cards.find((item) => item.id === state.selectedCard);

  if (card.type !== zoneId) {
    state.feedback = card.type === "distractor"
      ? "这张更像干扰项。它会影响局面，但不是遵义会议真正要解决的重点。"
      : "再想想这张史料说的是危机、机会，还是原因。";
    state.feedbackTone = "error";
    state.hint = `小参谋：${card.hint}`;
    render(root, state);
    return;
  }

  state.placed[card.id] = zoneId;
  state.selectedCard = null;
  state.feedback = card.hint;
  state.feedbackTone = "historical";

  const required = cards.filter((item) => item.type !== "distractor" || state.step === "cause");
  const complete = required.every((item) => state.placed[item.id] === item.type);

  if (complete) {
    state.completed.add(state.step);
    if (state.step === "crisis") {
      state.step = "cause";
      state.placed = {};
      state.feedback = "局面看清楚了。下一步要判断：问题根源到底是什么？";
      state.feedbackTone = "success";
      state.hint = "小参谋：不要把结果当原因，也不要把战士当问题。看“指挥”和“打法”。";
    } else {
      state.step = "plan";
      state.placed = {};
      state.feedback = "原因找到了：错误军事指挥让红军长期被动。现在选择新的方向。";
      state.feedbackTone = "success";
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
