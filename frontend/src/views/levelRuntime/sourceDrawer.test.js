import test from "node:test";
import assert from "node:assert/strict";
import { normalizeSourceDrawerItems, safeSourceUrl } from "./sourceDrawer.js";

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
