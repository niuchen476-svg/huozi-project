import assert from "node:assert/strict";
import test from "node:test";
import { resolveFragmentAsset } from "./fragmentModelViewer.js";

test("GitHub Pages 资源路径不会重复拼接仓库前缀", () => {
  const previousWindow = globalThis.window;
  globalThis.window = { __BASE_PATH__: "/huozi-project/" };
  try {
    assert.equal(
      resolveFragmentAsset("/assets/fragments/models/ruijin-lantern.glb"),
      "/huozi-project/assets/fragments/models/ruijin-lantern.glb",
    );
    assert.equal(
      resolveFragmentAsset("/huozi-project/assets/fragments/models/ruijin-lantern.glb"),
      "/huozi-project/assets/fragments/models/ruijin-lantern.glb",
    );
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

