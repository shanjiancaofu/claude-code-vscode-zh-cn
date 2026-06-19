import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import test from "node:test";
import { applyPatch } from "../src/core/patcher";
import { restoreOriginalFiles } from "../src/core/restore";
import { cleanupFakeExtension, createFakeExtension } from "./helpers";

async function writePack(file: string, ui: Record<string, string>): Promise<void> {
  await fs.writeFile(file, JSON.stringify({
    meta: {
      name: "zh-CN",
      description: "incremental update test",
      version: "test",
      targetExtension: "anthropic.claude-code"
    },
    locale: "zh-CN",
    testedExtensionVersion: "2.1.183",
    ui,
    host: {},
    rawFragments: {},
    package: {}
  }));
}

test("incremental translation updates preserve the first original backup", async () => {
  const fixture = await createFakeExtension();
  process.env.CLAUDE_CODE_ZH_CN_STATE_DIR = fixture.state;
  const webview = path.join(fixture.root, "webview/index.js");
  const original = await fs.readFile(webview);
  const firstPack = path.join(path.dirname(fixture.root), "first.json");
  const secondPack = path.join(path.dirname(fixture.root), "second.json");
  try {
    await writePack(firstPack, { Accept: "接受" });
    await writePack(secondPack, { Accept: "接受", Model: "模型" });

    const first = await applyPatch({ mode: "cli", targetPath: fixture.root, translationPath: firstPack });
    const second = await applyPatch({ mode: "cli", targetPath: fixture.root, translationPath: secondPack });

    assert.equal(second.backupPath, first.backupPath);
    assert.match(await fs.readFile(webview, "utf8"), /接受.*模型/);
    await restoreOriginalFiles({ mode: "cli", targetPath: fixture.root });
    assert.deepEqual(await fs.readFile(webview), original);
  } finally {
    await cleanupFakeExtension(fixture.root);
  }
});

test("incremental updates refuse unrecognized external file changes", async () => {
  const fixture = await createFakeExtension();
  process.env.CLAUDE_CODE_ZH_CN_STATE_DIR = fixture.state;
  const webview = path.join(fixture.root, "webview/index.js");
  const firstPack = path.join(path.dirname(fixture.root), "first.json");
  const secondPack = path.join(path.dirname(fixture.root), "second.json");
  try {
    await writePack(firstPack, { Accept: "接受" });
    await writePack(secondPack, { Accept: "接受", Model: "模型" });
    await applyPatch({ mode: "cli", targetPath: fixture.root, translationPath: firstPack });
    await fs.appendFile(webview, "// external change\n");

    await assert.rejects(
      applyPatch({ mode: "cli", targetPath: fixture.root, translationPath: secondPack }),
      /补丁之外被修改/
    );
    assert.doesNotMatch(await fs.readFile(webview, "utf8"), /模型/);
  } finally {
    await cleanupFakeExtension(fixture.root);
  }
});
