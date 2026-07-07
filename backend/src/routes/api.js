import { Router } from "express";
import { loadLevelsIndex, loadLevelCards } from "../services/levelsData.js";
import { generateReflection } from "../services/reflect.js";

const router = Router();

const MAX_REFLECTION_LENGTH = 2000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 12; // 每个 IP 每 10 分钟最多提交这么多次（会实际调用计费的 LLM 接口）
const aiRequestLog = new Map();

function aiRateLimit(req, res, next) {
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

export default router;
