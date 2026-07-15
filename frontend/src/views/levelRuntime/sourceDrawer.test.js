import test from "node:test";
import assert from "node:assert/strict";
import { normalizeSourceDrawerItems, safeSourceImage, safeSourceUrl } from "./sourceDrawer.js";

test("史料抽屉只保留明确可见的史料并遵守数量上限", () => {
  const sources = [
    { id: "a", visibleInSourceDrawer: true },
    { id: "b", visibleInSourceDrawer: false },
    { id: "c", visibleInSourceDrawer: true },
  ];
  assert.deepEqual(normalizeSourceDrawerItems(sources, 1).map((source) => source.id), ["a"]);
  assert.deepEqual(normalizeSourceDrawerItems(sources, 8).map((source) => source.id), ["a", "c"]);
});

test("史料链接只允许 http 和 https", () => {
  assert.equal(safeSourceUrl("https://example.com/source"), "https://example.com/source");
  assert.equal(safeSourceUrl("javascript:alert(1)"), null);
  assert.equal(safeSourceUrl(""), null);
});

test("史料图片允许项目内相对路径和 http 地址，拒绝危险协议", () => {
  assert.equal(safeSourceImage("assets/sources/map.png"), "assets/sources/map.png");
  assert.equal(safeSourceImage("https://example.com/map.png"), "https://example.com/map.png");
  assert.equal(safeSourceImage("javascript:alert(1)"), null);
  assert.equal(safeSourceImage("data:image/png;base64,abc"), null);
});
