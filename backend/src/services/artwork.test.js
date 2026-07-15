import test from "node:test";
import assert from "node:assert/strict";
import {
  buildArtworkPrompt,
  generateLevelArtwork,
  MAX_ARTWORK_PROMPT_CHARACTERS,
  normalizeArtworkInput,
} from "./artwork.js";
import { callAihubmixImage, getImageGenerationUrl, reserveDailyImageCall } from "./aihubmixImageClient.js";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

test("生图输入只接受展台白名单主题和最多三块碎片", async () => {
  const input = await normalizeArtworkInput({
    themeId: "unity",
    fragmentIds: ["departure-map-fragment", "iron-chain-fragment", "snow-grass-fragment"],
    playerText: "我想记住一路上的选择。",
    playerName: "小红军",
  });
  assert.equal(input.theme.id, "unity");
  assert.equal(input.fragmentIds.length, 3);
  await assert.rejects(() => normalizeArtworkInput({ themeId: "unknown" }), /有效/);
});

test("绘画提示词包含主题、玩家表达、史料、碎片含义和署名留白要求", async () => {
  const input = await normalizeArtworkInput({
    themeId: "sacrifice",
    fragmentIds: ["river-crossing-fragment"],
    sourceIds: ["source-xiangjiang-operation-map"],
    expressionText: "每一次抵达都有许多人的坚持。",
  });
  const prompt = buildArtworkPrompt(input);
  assert.match(prompt, /记住牺牲/);
  assert.match(prompt, /全州、兴安方向作战部署图/);
  assert.match(prompt, /渡江军号/);
  assert.match(prompt, /右下角保留/);
  assert.match(prompt, /现代武器/);
  assert.ok(prompt.length <= MAX_ARTWORK_PROMPT_CHARACTERS);
});

test("AIHubMix 使用文档规定的图片生成接口且不自动重试", async () => {
  let requestUrl;
  let requestBody;
  const result = await callAihubmixImage({
    prompt: "测试画面",
    apiBase: "https://aihubmix.com/v1/",
    apiKey: "test-key",
    model: "qianfan/qwen-image-2.0",
    referenceImages: ["https://example.com/fragment.webp"],
    imageEnabled: "true",
    reserveBudget: async () => ({ count: 1, limit: 1 }),
    fetchImpl: async (url, options) => {
      requestUrl = url;
      requestBody = JSON.parse(options.body);
      return new Response(JSON.stringify({ output: [{ url: "https://example.com/result.png" }] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    },
  });
  assert.equal(requestUrl, getImageGenerationUrl("https://aihubmix.com/v1"));
  assert.equal(requestBody.model, "qwen-image-2.0");
  assert.equal(requestBody.n, 1);
  assert.equal(requestBody.size, "1024x576");
  assert.equal(requestBody.watermark, false);
  assert.equal(requestBody.prompt, "测试画面");
  assert.equal(requestBody.images, undefined);
  assert.equal(requestBody.response_format, "url");
  assert.equal(requestBody.prompt_extend, false);
  assert.equal(requestBody.negative_prompt, undefined);
  assert.equal(requestBody.input, undefined);
  assert.deepEqual(result, { url: "https://example.com/result.png" });
});

test("AIHubMix 上游校验错误保留状态和原始详情", async () => {
  await assert.rejects(() => callAihubmixImage({
    prompt: "测试画面",
    apiKey: "test-key",
    imageEnabled: "true",
    reserveBudget: async () => ({ count: 1, limit: 1 }),
    fetchImpl: async () => new Response('{"error":"prompt too long"}', {
      status: 400,
      headers: { "content-type": "application/json" },
    }),
  }), (error) => {
    assert.equal(error.providerStatus, 400);
    assert.match(error.providerDetail, /prompt too long/);
    return true;
  });
});

test("每日预算持久化限制为一张", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "huozi-image-budget-"));
  const filePath = path.join(directory, "usage.json");
  try {
    const first = await reserveDailyImageCall({ limit: 1, filePath, now: new Date("2026-07-14T12:00:00Z") });
    assert.equal(first.count, 1);
    await assert.rejects(
      () => reserveDailyImageCall({ limit: 1, filePath, now: new Date("2026-07-14T18:00:00Z") }),
      /额度已用完/
    );
    assert.match(await readFile(filePath, "utf8"), /"count": 1/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("默认关闭真实生图，避免开发误扣费", async () => {
  await assert.rejects(() => callAihubmixImage({
    prompt: "不会真正发出请求",
    apiKey: "test-key",
    imageEnabled: "false",
    fetchImpl: async () => { throw new Error("不应调用网络"); },
  }), /未产生任何费用/);
});

test("完整生成流程可用模拟图片完成，不调用付费服务", async () => {
  let prompt;
  const result = await generateLevelArtwork({
    themeId: "new-start",
    fragmentIds: ["direction-fragment"],
    expressionText: "会师以后还要走向新的任务。",
    playerName: "测试同学",
  }, {
    callImage: async (request) => {
      prompt = request.prompt;
      return { b64Json: "aW1hZ2U=" };
    },
    persist: async () => "/images/mock.png",
  });
  assert.match(prompt, /新的任务/);
  assert.equal(result.imageUrl, "/images/mock.png");
  assert.equal(result.generatedByAi, true);
  assert.equal(result.playerName, "测试同学");
});
