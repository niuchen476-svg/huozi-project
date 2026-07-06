import { callMimo } from "./mimoClient.js";
import { loadLevelCards } from "./levelsData.js";

const SYSTEM_PROMPT =
  "你是一个严谨的历史推断验证助手。你只能依据用户提供的档案资料对玩家的推断进行核验，绝不能使用档案之外的历史知识来支持或反驳论点。你的输出必须是合法 JSON，不能包含 JSON 之外的任何文字。";

function buildPrompt(level, inference) {
  const cardsText = level.cards
    .map((card, i) => `${i + 1}. 【${card.title}】(id: ${card.id}) ${card.rawText}`)
    .join("\n");

  return `【历史情境】
${level.scenario}

【玩家看到的问题】
${level.playerQuestion}

【档案资料，仅可依据以下内容判断，禁止引入档案之外的知识】
${cardsText}

【玩家的推断】
${inference}

请将玩家的推断拆解为若干条独立论点，逐条对照上述档案资料判断真伪，只返回如下 JSON，不要任何多余文字：
{
  "points": [
    { "claim": "论点概括", "verdict": "supported|partial|refuted", "evidence": "对应的档案原文依据", "cardId": "对应档案卡id" }
  ],
  "overallPassed": true 或 false,
  "summary": "一句话总结这次推断是否站得住脚，以及主要问题"
}`;
}

export async function verifyInference(levelId, inference) {
  const level = await loadLevelCards(levelId);
  const prompt = buildPrompt(level, inference);
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
