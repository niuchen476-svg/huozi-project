const TONE_ALIASES = Object.freeze({
  neutral: "neutral",
  info: "neutral",
  success: "success",
  ok: "success",
  victory: "success",
  error: "error",
  danger: "error",
  fail: "error",
  hit: "error",
  no: "error",
  assist: "assist",
  hint: "assist",
  help: "assist",
  historical: "historical",
  fact: "historical",
});

export function normalizeFeedbackTone(value) {
  return TONE_ALIASES[value] || "neutral";
}

export function applyLevelFeedback(element, {
  message = "",
  tone = "neutral",
  visible = true,
} = {}) {
  if (!element) return null;
  const normalizedTone = normalizeFeedbackTone(tone);
  element.dataset.levelFeedback = "";
  element.dataset.feedbackTone = normalizedTone;
  element.setAttribute("role", normalizedTone === "error" ? "alert" : "status");
  element.setAttribute("aria-live", normalizedTone === "error" ? "assertive" : "polite");
  element.textContent = message;
  element.hidden = !visible;
  return normalizedTone;
}
