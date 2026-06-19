import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import test from "node:test";
import { createFakeExtension, cleanupFakeExtension } from "./helpers";
import { applyPatch } from "../src/core/patcher";
import { restoreOriginalFiles } from "../src/core/restore";

test("restore returns every patched file to its original bytes", async () => {
  const fixture = await createFakeExtension();
  process.env.CLAUDE_CODE_ZH_CN_STATE_DIR = fixture.state;
  const webview = path.join(fixture.root, "webview/index.js");
  const before = await fs.readFile(webview);
  try {
    await applyPatch({ mode: "cli", targetPath: fixture.root });
    await restoreOriginalFiles({ mode: "cli", targetPath: fixture.root });
    assert.deepEqual(await fs.readFile(webview), before);
  } finally {
    await cleanupFakeExtension(fixture.root);
  }
});
