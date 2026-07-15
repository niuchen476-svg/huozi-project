import test from "node:test";
import assert from "node:assert/strict";

import { getGameplaySourceIds, getLevelSource, resolveLevelSource } from "./sourceRegistry.js";

const experience = {
  phases: {
    gameplay: { sourceIds: ["source-a"] },
    sources: { items: [{ id: "source-a", title: "史料 A" }] },
  },
};

test("gameplay source references resolve to the canonical drawer item", () => {
  assert.equal(getLevelSource(experience, "source-a")?.title, "史料 A");
  assert.equal(resolveLevelSource(experience, "source-a")?.id, "source-a");
  assert.deepEqual(getGameplaySourceIds(experience), ["source-a"]);
});
