import { callMimoTts } from "./mimoClient.js";

export const MAX_SPEECH_CHARACTERS = 220;
const SAFE_ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/;

function cleanSpeechText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export async function generateLevelSpeech(levelId, body = {}, { callTts = callMimoTts } = {}) {
  if (!SAFE_ID.test(levelId)) {
    throw Object.assign(new Error("关卡 ID 不合法"), { statusCode: 400 });
  }
  const text = cleanSpeechText(body.text);
  if (!text) {
    throw Object.assign(new Error("缺少需要朗读的文字"), { statusCode: 400 });
  }
  if (text.length > MAX_SPEECH_CHARACTERS) {
    throw Object.assign(new Error(`朗读文字不能超过 ${MAX_SPEECH_CHARACTERS} 字`), { statusCode: 400 });
  }

  const audio = await callTts({ text });
  return {
    audioDataUrl: `data:audio/mpeg;base64,${audio.data}`,
    mimeType: "audio/mpeg",
    voice: audio.voice,
    usedFallback: false,
  };
}
