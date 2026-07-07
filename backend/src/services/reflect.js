import { callMimo } from "./mimoClient.js";
import { loadLevelCards } from "./levelsData.js";

const SYSTEM_PROMPT =
  "你是一位精通中国古典诗词创作与近代史的文学顾问。你要点评玩家对历史情境的感悟，并据此创作一首贴合玩家感悟和真实历史背景的古典诗词。你的输出必须是合法 JSON，不能包含 JSON 之外的任何文字。";

const FORM_GUIDE = {
  七律: "七言律诗，共八句，每句七字，中间颔联、颈联要对仗",
  绝句: "七言绝句，共四句，每句七字，讲究起承转合",
  词: "词，选择一个适合悲壮/激昂历史题材的词牌（如《满江红》《念奴娇》），按词牌本身的字数与句读格式创作",
};

function buildPrompt(level, reflection, form) {
  const guide = FORM_GUIDE[form] || FORM_GUIDE["绝句"];

  return `【历史背景】
${level.scenario}

【历史意义】
${level.significance || ""}

【玩家的感悟】
${reflection}

【任务】
1. 用两到三句话点评玩家这段感悟里体现出的历史理解或情感共鸣，语气真诚自然，不要说教。
2. 创作一首${form}（${guide}），题材围绕这段真实历史，尽量呼应玩家感悟里提到的具体意象或情绪。

只返回如下 JSON，不要任何多余文字：
{
  "commentary": "点评文字",
  "poemForm": "${form}",
  "poemTitle": "诗词标题",
  "poemBody": "诗词正文，每句之间用换行符分隔"
}`;
}

export async function generateReflection(levelId, reflection, form) {
  const level = await loadLevelCards(levelId);
  const prompt = buildPrompt(level, reflection, form);
  const raw = await callMimo({ system: SYSTEM_PROMPT, prompt });

  const jsonStart = raw.indexOf("{");
  const jsonEnd = raw.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error(`AI 返回内容无法解析为 JSON：${raw}`);
  }

  try {
    return JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
  } catch (err) {
    throw new Error(`AI 返回内容无法解析为 JSON：${raw}`);
  }
}
