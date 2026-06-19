import assert from "node:assert/strict";
import test from "node:test";
import { createFakeExtension, cleanupFakeExtension } from "./helpers";
import { applyPatch } from "../src/core/patcher";
import { getStatus } from "../src/core/status";

test("status identifies a patched installation and its backup", async () => {
  const fixture = await createFakeExtension();
  process.env.CLAUDE_CODE_ZH_CN_STATE_DIR = fixture.state;
  try {
    const before = await getStatus({ mode: "cli", targetPath: fixture.root });
    assert.equal(before.patched, false);
    assert.ok(before.availableReplacements > 0);

    await applyPatch({ mode: "cli", targetPath: fixture.root });
    const after = await getStatus({ mode: "cli", targetPath: fixture.root });
    assert.equal(after.patched, true);
    assert.equal(after.backupFound, true);
    assert.equal(after.availableReplacements, 0);
  } finally {
    await cleanupFakeExtension(fixture.root);
  }
});
