import "dotenv/config";

const MIMO_API_BASE = process.env.MIMO_API_BASE;
const MIMO_API_KEY = process.env.MIMO_API_KEY;
const MIMO_MODEL = process.env.MIMO_MODEL || "mimo-v2.5";

export async function callMimo({ system, prompt, maxTokens = 4096 }) {
  if (!MIMO_API_BASE || !MIMO_API_KEY) {
    throw new Error("缺少 MIMO_API_BASE 或 MIMO_API_KEY，请检查 backend/.env");
  }

  const res = await fetch(`${MIMO_API_BASE}/v1/messages`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": MIMO_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MIMO_MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MiMo API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const textBlock = data.content?.find((block) => block.type === "text");
  if (!textBlock) {
    throw new Error("MiMo API 返回内容中没有可解析的文本块");
  }
  return textBlock.text;
}
