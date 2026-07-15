import test from "node:test";
import assert from "node:assert/strict";
import { createArtworkRequest, normalizePlayerName } from "./artworkPanel.js";

test("玩家署名会去除多余空白并限制长度", () => {
  assert.equal(normalizePlayerName("  小   红军  "), "小 红军");
  assert.equal(normalizePlayerName("一".repeat(30)).length, 20);
});

test("画作请求只携带玩家表达、MiMo结果和署名", () => {
  assert.deepEqual(createArtworkRequest({
    expression: { title: "从抵达到会合", text: "不同队伍最终汇聚。" },
    expressionPayload: { userText: "我想记住团结。", sourceIds: ["source-a", "source-b"], ignored: "no" },
    playerName: " 小明 ",
    favoriteFragmentId: "iron-chain-fragment",
  }), {
    playerName: "小明",
    playerText: "我想记住团结。",
    expressionTitle: "从抵达到会合",
    expressionText: "不同队伍最终汇聚。",
    sourceIds: ["source-a", "source-b"],
    favoriteFragmentId: "iron-chain-fragment",
  });
});
