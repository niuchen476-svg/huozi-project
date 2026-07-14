import test from "node:test";
import assert from "node:assert/strict";
import { normalizeFeedbackTone } from "./feedbackSystem.js";

test("各关旧反馈名称映射到五类统一语义", () => {
  assert.equal(normalizeFeedbackTone("danger"), "error");
  assert.equal(normalizeFeedbackTone("hit"), "error");
  assert.equal(normalizeFeedbackTone("victory"), "success");
  assert.equal(normalizeFeedbackTone("hint"), "assist");
  assert.equal(normalizeFeedbackTone("fact"), "historical");
  assert.equal(normalizeFeedbackTone("unexpected"), "neutral");
});
