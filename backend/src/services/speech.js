import { callMimoTts } from "./mimoClient.js";

export const MAX_SPEECH_CHARACTERS = 220;
export const MAX_SPEECH_CHUNK_CHARACTERS = 42;
const SAFE_ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/;

function cleanSpeechText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function splitSpeechText(text, maxCharacters = MAX_SPEECH_CHUNK_CHARACTERS) {
  const sentences = String(text).match(/[^。！？；!?;]+[。！？；!?;]?/g) || [];
  const chunks = [];
  let current = "";

  for (const sentence of sentences) {
    if (sentence.length > maxCharacters) {
      if (current) chunks.push(current);
      current = "";
      for (let index = 0; index < sentence.length; index += maxCharacters) {
        chunks.push(sentence.slice(index, index + maxCharacters));
      }
    } else if (!current || current.length + sentence.length <= maxCharacters) {
      current += sentence;
    } else {
      chunks.push(current);
      current = sentence;
    }
  }
  if (current) chunks.push(current);
  return chunks.filter(Boolean);
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

  const chunks = splitSpeechText(text);
  const audioParts = await Promise.all(chunks.map((chunk) => callTts({ text: chunk })));
  const audioDataUrls = audioParts.map((audio) => `data:audio/mpeg;base64,${audio.data}`);
  return {
    audioDataUrl: audioDataUrls[0],
    audioDataUrls,
    mimeType: "audio/mpeg",
    voice: audioParts[0]?.voice,
    segmentCount: audioDataUrls.length,
    usedFallback: false,
  };
}
