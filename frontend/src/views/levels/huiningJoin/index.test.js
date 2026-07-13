import test from "node:test";
import assert from "node:assert/strict";
import {
  buildHuiningExpressionChoices,
  isCorrectMeetingNode,
} from "./index.js";

test("三路队伍只接受对应的会师节点", () => {
  assert.equal(isCorrectMeetingNode("front-one", "huining-oct9"), true);
  assert.equal(isCorrectMeetingNode("front-four", "huining-oct9"), true);
  assert.equal(isCorrectMeetingNode("front-two", "jiangtaibao-oct22"), true);
  assert.equal(isCorrectMeetingNode("front-two", "huining-oct9"), false);
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
    { id: "routes-assembled", label: "完成三路会合" },
    { id: "theme-people", label: "同行的人" },
    { id: "one", label: "选择一号碎片" },
    { id: "two", label: "选择二号碎片" },
    { id: "three", label: "选择三号碎片" },
  ]);
});
