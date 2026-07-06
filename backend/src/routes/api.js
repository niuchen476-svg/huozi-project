import { Router } from "express";
import { loadLevelsIndex, loadLevelCards } from "../services/levelsData.js";
import { verifyInference } from "../services/verify.js";

const router = Router();

const MAX_INFERENCE_LENGTH = 2000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 12; // 每个 IP 每 10 分钟最多提交这么多次核验（会实际调用计费的 LLM 接口）
const verifyRequestLog = new Map();

function verifyRateLimit(req, res, next) {
  const key = req.ip;
  const now = Date.now();
  const recent = (verifyRequestLog.get(key) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX) {
    return res.status(429).json({ error: "请求过于频繁，请稍后再试" });
  }

  recent.push(now);
  verifyRequestLog.set(key, recent);
  next();
}

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
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

router.post("/levels/:id/verify", verifyRateLimit, async (req, res) => {
  const { inference } = req.body;
  if (!inference || typeof inference !== "string") {
    return res.status(400).json({ error: "缺少 inference 字段" });
  }
  if (inference.length > MAX_INFERENCE_LENGTH) {
    return res.status(400).json({ error: `推断内容过长，请控制在 ${MAX_INFERENCE_LENGTH} 字以内` });
  }

  try {
    const result = await verifyInference(req.params.id, inference);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
