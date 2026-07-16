import test from "node:test";
import assert from "node:assert/strict";
import { normalizeFragmentCardName } from "./fragmentPrint.js";

test("碎片纪念卡署名会整理空白并限制长度", () => {
  assert.equal(normalizeFragmentCardName("  小   红军  "), "小 红军");
  assert.equal(normalizeFragmentCardName("一".repeat(30)).length, 20);
});
