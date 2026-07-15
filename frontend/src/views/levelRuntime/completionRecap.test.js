import assert from "node:assert/strict";
import test from "node:test";
import { getCompletionRecapData } from "./completionRecap.js";

test("复盘优先使用关卡配置中的标题、碎片意义和行动总结", () => {
  const recap = getCompletionRecapData({
    level: { title: "测试关", scenario: "历史背景" },
    experience: {
      phases: { completion: { reviewTitle: "配置复盘标题" } },
      fragment: { historicalMeaning: "碎片承载的历史意义" },
    },
    debrief: "玩家刚刚完成的行动",
  });
  assert.equal(recap.title, "配置复盘标题");
  assert.equal(recap.debrief, "玩家刚刚完成的行动");
  assert.equal(recap.historicalMeaning, "碎片承载的历史意义");
});

test("配置暂缺时仍能使用一期内容形成稳定复盘", () => {
  const recap = getCompletionRecapData({
    level: { title: "测试关", scenario: "一期历史背景", date: "1935", location: "遵义" },
  });
  assert.equal(recap.title, "测试关：回到历史现场");
  assert.equal(recap.historicalMeaning, "一期历史背景");
  assert.equal(recap.date, "1935");
  assert.equal(recap.location, "遵义");
});
