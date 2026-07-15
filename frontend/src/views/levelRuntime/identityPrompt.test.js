import test from "node:test";
import assert from "node:assert/strict";

import { getLevelIdentity } from "./identityPrompt.js";

test("除遵义样板外六关都使用统一身份提示", () => {
  const levels = [
    "ruijin-departure",
    "xiangjiang-battle",
    "sidu-chishui",
    "luding-bridge",
    "snow-grassland",
    "huining-join",
  ];

  levels.forEach((levelId) => {
    const identity = getLevelIdentity(levelId);
    assert.ok(identity?.title);
    assert.ok(identity?.description);
    assert.ok(identity?.action);
  });
  assert.equal(getLevelIdentity("zunyi-turn"), null);
});
