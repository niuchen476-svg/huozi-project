import test from "node:test";
import assert from "node:assert/strict";
import {
  buildHuiningExpressionChoices,
  buildHuiningSourceCatalog,
  isCorrectMeetingNode,
  isCorrectTimelineOrder,
} from "./index.js";

test("三路队伍只接受对应的会师节点", () => {
  assert.equal(isCorrectMeetingNode("front-one", "huining-oct9"), true);
  assert.equal(isCorrectMeetingNode("front-four", "huining-oct9"), true);
  assert.equal(isCorrectMeetingNode("front-two", "jiangtaibao-oct22"), true);
  assert.equal(isCorrectMeetingNode("front-two", "huining-oct9"), false);
});

test("四个会师节点必须按跨日进程排列", () => {
  const events = [
    { id: "capture" },
    { id: "first-fourth" },
    { id: "jiangtaibao" },
    { id: "xinglong" },
  ];
  assert.equal(isCorrectTimelineOrder(
    ["capture", "first-fourth", "jiangtaibao", "xinglong"],
    events
  ), true);
  assert.equal(isCorrectTimelineOrder(
    ["first-fourth", "capture", "jiangtaibao", "xinglong"],
    events
  ), false);
});

test("数字展台选择会被整理为统一表达选项并限制三块碎片", () => {
  const theme = { id: "people", shortLabel: "同行的人" };
  const fragments = [
    { id: "one", name: "一号碎片" },
    { id: "two", name: "二号碎片" },
    { id: "three", name: "三号碎片" },
    { id: "four", name: "四号碎片" },
  ];
  assert.deepEqual(buildHuiningExpressionChoices(theme, fragments), [
    { id: "whole-journey", label: "回望七关行程" },
    { id: "theme-people", label: "同行的人" },
    { id: "one", label: "选择一号碎片" },
    { id: "two", label: "选择二号碎片" },
    { id: "three", label: "选择三号碎片" },
  ]);
});

test("会宁综合展台会汇集七关中允许用于表达的史料", () => {
  const levels = [
    { id: "ruijin-departure", title: "瑞金出发" },
    { id: "huining-join", title: "会宁会师" },
  ];
  const experiences = [
    { phases: { sources: { items: [
      { id: "source-a", title: "行动日程", availableForAiExpression: true },
      { id: "source-hidden", title: "未审核材料", availableForAiExpression: false },
    ] } } },
    { phases: { sources: { items: [
      { id: "source-b", title: "会师计划", availableForAiExpression: true },
    ] } } },
  ];
  assert.deepEqual(buildHuiningSourceCatalog(levels, experiences).map((source) => ({
    id: source.id,
    levelId: source.levelId,
    levelTitle: source.levelTitle,
  })), [
    { id: "source-a", levelId: "ruijin-departure", levelTitle: "瑞金出发" },
    { id: "source-b", levelId: "huining-join", levelTitle: "会宁会师" },
  ]);
});
