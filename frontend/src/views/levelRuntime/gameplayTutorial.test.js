import test from "node:test";
import assert from "node:assert/strict";

import { normalizeGameplayTutorial } from "./gameplayTutorial.js";

test("normalizeGameplayTutorial filters invalid steps and caps the sequence", () => {
  const tutorial = normalizeGameplayTutorial({
    enabled: true,
    autoShow: true,
    steps: [
      { title: "第一步", text: "说明" },
      { title: "缺少说明" },
      ...Array.from({ length: 8 }, (_, index) => ({ title: `步骤${index}`, text: "说明" })),
    ],
  });
  assert.equal(tutorial.enabled, true);
  assert.equal(tutorial.autoShow, true);
  assert.equal(tutorial.steps.length, 6);
});

test("normalizeGameplayTutorial disables an empty tutorial", () => {
  assert.equal(normalizeGameplayTutorial({ steps: [] }).enabled, false);
});
