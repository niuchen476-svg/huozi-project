import { Router } from "express";
import {
  loadExhibition,
  loadLevelCards,
  loadLevelExperience,
  loadLevelsIndex,
} from "../services/levelsData.js";
import { generateReflection } from "../services/reflect.js";
import { generateLevelExpression } from "../services/expression.js";
import { generateLevelSpeech } from "../services/speech.js";
import { generateLevelArtwork } from "../services/artwork.js";
import { classifyAiFailure, createAiRequestId, getLocalAiStatus } from "../services/aiDiagnostics.js";

const router = Router();

const MAX_REFLECTION_LENGTH = 2000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 12; // 每个 IP 每 10 分钟最多提交这么多次（会实际调用计费的 LLM 接口）
const aiRequestLog = new Map();

function aiRateLimit(req, res, next) {
  // 本地展馆调试会频繁重玩关卡，回环请求不计入公网计费限流。
  if (["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(req.ip)) return next();

  const key = req.ip;
  const now = Date.now();
  const recent = (aiRequestLog.get(key) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX) {
    return res.status(429).json({ error: "请求过于频繁，请稍后再试" });
  }

  recent.push(now);
  aiRequestLog.set(key, recent);
  next();
}

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.get("/ai/status", (req, res) => {
  res.json({ status: "ok", ...getLocalAiStatus() });
});

router.get("/levels", async (req, res) => {
  const levels = await loadLevelsIndex();
  res.json(levels);
});

router.get("/levels/:id", async (req, res) => {
  try {
    const level = await loadLevelCards(req.params.id);
    res.json(level);
  } catch (err) {
    res.status(404).json({ error: "关卡不存在" });
  }
});

router.get("/levels/:id/experience", async (req, res) => {
  try {
    const experience = await loadLevelExperience(req.params.id);
    res.json(experience);
  } catch (err) {
    res.status(404).json({ error: "该关卡尚未配置第二期体验协议" });
  }
});

router.get("/exhibition", async (req, res) => {
  try {
    const exhibition = await loadExhibition();
    res.json(exhibition);
  } catch (err) {
    res.status(404).json({ error: "数字展台尚未配置" });
  }
});

router.post("/levels/:id/reflect", aiRateLimit, async (req, res) => {
  const { reflection, form } = req.body;
  if (!reflection || typeof reflection !== "string") {
    return res.status(400).json({ error: "缺少 reflection 字段" });
  }
  if (reflection.length > MAX_REFLECTION_LENGTH) {
    return res.status(400).json({ error: `感悟内容过长，请控制在 ${MAX_REFLECTION_LENGTH} 字以内` });
  }
  if (!["七律", "绝句", "词"].includes(form)) {
    return res.status(400).json({ error: "诗词形式必须是 七律 / 绝句 / 词 之一" });
  }

  try {
    const result = await generateReflection(req.params.id, reflection, form);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/levels/:id/expression", aiRateLimit, async (req, res) => {
  try {
    const result = await generateLevelExpression(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || "表达生成失败" });
  }
});

router.post("/levels/:id/speech", aiRateLimit, async (req, res) => {
  try {
    const result = await generateLevelSpeech(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(err.statusCode || 502).json({ error: err.message || "语音生成失败" });
  }
});

router.post("/levels/:id/artwork", async (req, res) => {
  if (req.params.id !== "huining-join") {
    return res.status(409).json({ error: "AI 画作目前仅在会宁数字展台开放" });
  }
  try {
    const result = await generateLevelArtwork(req.body);
    res.json(result);
  } catch (err) {
    const requestId = err.requestId || createAiRequestId("artwork");
    res.status(err.statusCode || 502).json({
      error: err.message || "画作生成失败",
      code: err.failureReason || classifyAiFailure(err),
      requestId,
      providerStatus: err.providerStatus || null,
      providerDetail: err.providerDetail || null,
    });
  }
});

export default router;
