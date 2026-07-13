import test from "node:test";
import assert from "node:assert/strict";
import {
  createClientExpressionFallback,
  createExpressionPayload,
  getExpressionSources,
} from "./expressionPanel.js";

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

test("浏览器断网时可以从关卡配置生成同协议兜底结果", () => {
  const experience = {
    phases: {
      sources: { items: [{ id: "source-1", title: "行军地图", availableForAiExpression: true }] },
      expression: {
        outputType: "route-reflection",
        outputLabel: "AI根据玩家选择生成",
        fallbackTemplates: [],
        ai: { maxOutputCharacters: 160 },
      },
    },
  };
  assert.deepEqual(createClientExpressionFallback(experience, {
    sourceIds: ["source-1"],
    choiceIds: [],
    userText: "",
  }), {
    title: "我的路线思考",
    text: "我从《行军地图》中，看见了历史选择背后的责任与坚持。",
    sourceIds: ["source-1"],
    label: "AI根据玩家选择生成",
    usedFallback: true,
  });
});
