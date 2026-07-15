import test from "node:test";
import assert from "node:assert/strict";

import { renderKeyCommand } from "./historicalMissionUi.js";

test("历史行动指令默认渲染为可点击按钮", () => {
  const markup = renderKeyCommand("Space", "跟队前进", "", "data-test-command");

  assert.match(markup, /<button type="button"/);
  assert.match(markup, /data-key-command="Space"/);
  assert.match(markup, /data-test-command/);
  assert.match(markup, />跟队前进<\/span>/);
  assert.doesNotMatch(markup, /<kbd/);
  assert.match(markup, /data-key-command="Space"/);
});

test("Enter 主操作保留快捷键但不显示键位标签", () => {
  const markup = renderKeyCommand("Enter", "进入历史现场", "", 'data-mission-action="start"');

  assert.match(markup, /data-mission-action="start"/);
  assert.doesNotMatch(markup, /<kbd/);
});

test("数字选择保留键盘映射但界面只显示行动文字", () => {
  const markup = renderKeyCommand("2", "担架与药箱");

  assert.match(markup, /data-key-command="2"/);
  assert.match(markup, />担架与药箱<\/span>/);
  assert.doesNotMatch(markup, /<kbd/);
});
