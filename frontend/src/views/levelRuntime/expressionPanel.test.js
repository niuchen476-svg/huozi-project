import test from "node:test";
import assert from "node:assert/strict";
import { createExpressionPayload, getExpressionSources } from "./expressionPanel.js";

test("表达面板只列出允许用于 AI 表达的史料", () => {
  const experience = {
    phases: { sources: { items: [
      { id: "allowed", availableForAiExpression: true },
      { id: "drawer-only", availableForAiExpression: false },
    ] } },
  };
  assert.deepEqual(getExpressionSources(experience).map((item) => item.id), ["allowed"]);
});

test("表达面板生成固定的接口载荷", () => {
  const payload = createExpressionPayload({
    selectedSourceIds: ["one", "one", "two"],
    selectedChoiceIds: ["route-a"],
    userText: "  我的判断  ",
    config: { sourceSelectionLimit: 1, outputType: "memory-card" },
  });
  assert.deepEqual(payload, {
    sourceIds: ["one"],
    choiceIds: ["route-a"],
    userText: "我的判断",
    outputType: "memory-card",
  });
});
