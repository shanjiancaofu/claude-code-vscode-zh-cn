import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

export async function createFakeExtension(version = "2.1.183"): Promise<{ root: string; state: string }> {
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), "claude-zh-test-"));
  const root = path.join(temporary, `anthropic.claude-code-${version}`);
  const state = path.join(temporary, "state");
  await fs.mkdir(path.join(root, "webview"), { recursive: true });
  await fs.writeFile(path.join(root, "package.json"), JSON.stringify({
    name: "claude-code",
    publisher: "Anthropic",
    version,
    displayName: "Claude Code for VS Code",
    contributes: { commands: [{ title: "Claude Code: Show Logs" }] }
  }, null, 2));
  await fs.writeFile(path.join(root, "extension.js"), 'const title="Claude Code: Show Logs";\n');
  await fs.writeFile(path.join(root, "webview/index.js"), 'createElement("button",null,"Accept");createElement("h2",null,"Model");\n');
  return { root, state };
}

export async function cleanupFakeExtension(root: string): Promise<void> {
  await fs.rm(path.dirname(root), { recursive: true, force: true });
}
