import test from "node:test";
import assert from "node:assert/strict";
import {
  createClientExpressionFallback,
  createExpressionPayload,
  getExpressionChoices,
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

test("没有玩法选择时使用本关专属表达角度", () => {
  const experience = {
    phases: { expression: { suggestions: [
      { id: "specific-person", label: "记住一个具体的人" },
      { id: "hard-choice", label: "记住艰难的取舍" },
    ] } },
  };
  assert.deepEqual(getExpressionChoices(experience, []), experience.phases.expression.suggestions);
  assert.deepEqual(getExpressionChoices(experience, [{ id: "runtime", label: "玩家刚才的选择" }]), [
    { id: "runtime", label: "玩家刚才的选择" },
  ]);
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
