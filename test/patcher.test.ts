import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import test from "node:test";
import { createFakeExtension, cleanupFakeExtension } from "./helpers";
import { applyPatch } from "../src/core/patcher";

test("dry-run does not write and apply creates an external backup", async () => {
  const fixture = await createFakeExtension();
  process.env.CLAUDE_CODE_ZH_CN_STATE_DIR = fixture.state;
  const webview = path.join(fixture.root, "webview/index.js");
  const before = await fs.readFile(webview, "utf8");
  try {
    const preview = await applyPatch({ mode: "cli", dryRun: true, targetPath: fixture.root });
    assert.ok((preview.availableReplacements ?? 0) > 0);
    assert.equal(await fs.readFile(webview, "utf8"), before);

    const report = await applyPatch({ mode: "cli", targetPath: fixture.root });
    assert.ok(report.backupPath);
    assert.match(await fs.readFile(webview, "utf8"), /接受/);
    assert.ok(await fs.stat(path.join(report.backupPath!, "manifest.json")));
  } finally {
    await cleanupFakeExtension(fixture.root);
  }
});
