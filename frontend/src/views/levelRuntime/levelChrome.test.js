import test from "node:test";
import assert from "node:assert/strict";
import { getLevelPhaseIndex, normalizeLevelPhase } from "./levelChrome.js";

test("统一阶段只接受五段式协议中的阶段", () => {
  assert.equal(normalizeLevelPhase("gameplay"), "gameplay");
  assert.equal(normalizeLevelPhase("sources"), "sources");
  assert.equal(normalizeLevelPhase("unknown"), "briefing");
});

test("统一阶段顺序固定", () => {
  assert.equal(getLevelPhaseIndex("briefing"), 0);
  assert.equal(getLevelPhaseIndex("expression"), 3);
  assert.equal(getLevelPhaseIndex("completion"), 4);
});
