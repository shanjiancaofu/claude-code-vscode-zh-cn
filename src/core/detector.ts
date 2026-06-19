import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { TARGET_DIRECTORY_PREFIX } from "./constants";
import { TargetExtensionInfo } from "./types";
import { pathExists, readJson } from "../utils/fs";

interface ExtensionManifest {
  name?: string;
  publisher?: string;
  version?: string;
}

export async function inspectExtension(directory: string): Promise<TargetExtensionInfo | undefined> {
  const resolved = path.resolve(directory);
  if (!path.basename(resolved).startsWith(TARGET_DIRECTORY_PREFIX)) return undefined;
  const packageJsonPath = path.join(resolved, "package.json");
  const required = [packageJsonPath, path.join(resolved, "extension.js"), path.join(resolved, "webview/index.js")];
  if (!(await Promise.all(required.map(pathExists))).every(Boolean)) return undefined;
  try {
    const manifest = await readJson<ExtensionManifest>(packageJsonPath);
    if (manifest.name !== "claude-code" || manifest.publisher?.toLowerCase() !== "anthropic") return undefined;
    return {
      name: "anthropic.claude-code",
      version: String(manifest.version ?? "unknown"),
      path: resolved,
      packageJsonPath
    };
  } catch {
    return undefined;
  }
}

function extensionParents(): string[] {
  const home = os.homedir();
  const xdgData = process.env.XDG_DATA_HOME || path.join(home, ".local/share");
  const envParents = [process.env.VSCODE_EXTENSIONS, process.env.VSCODE_EXTENSIONS_DIR, process.env.CURSOR_EXTENSIONS]
    .flatMap(value => value ? value.split(path.delimiter) : []);
  return [
    ...envParents,
    path.join(home, ".vscode/extensions"),
    path.join(home, ".vscode-server/extensions"),
    path.join(home, ".vscode-insiders/extensions"),
    path.join(home, ".vscode-server-insiders/extensions"),
    path.join(home, ".vscode-oss/extensions"),
    path.join(home, ".vscodium/extensions"),
    path.join(home, ".vscodium-server/extensions"),
    path.join(home, ".cursor/extensions"),
    path.join(home, ".cursor-server/extensions"),
    path.join(home, ".windsurf/extensions"),
    path.join(home, ".windsurf-server/extensions"),
    path.join(home, ".openvscode-server/extensions"),
    path.join(xdgData, "code-server/extensions"),
    path.join(xdgData, "openvscode-server/extensions"),
    process.env.VSCODE_AGENT_FOLDER ? path.join(process.env.VSCODE_AGENT_FOLDER, "extensions") : "",
    process.env.VSCODE_PORTABLE ? path.join(process.env.VSCODE_PORTABLE, "extensions") : ""
  ];
}

function compareVersions(left: string, right: string): number {
  const a = left.split(/[.-]/).map(value => /^\d+$/.test(value) ? Number(value) : value);
  const b = right.split(/[.-]/).map(value => /^\d+$/.test(value) ? Number(value) : value);
  for (let index = 0; index < Math.max(a.length, b.length); index++) {
    const x = a[index] ?? 0;
    const y = b[index] ?? 0;
    if (x === y) continue;
    if (typeof x === "number" && typeof y === "number") return x - y;
    return String(x).localeCompare(String(y));
  }
  return 0;
}

export async function detectExtensions(customPath?: string): Promise<TargetExtensionInfo[]> {
  if (customPath) {
    const target = await inspectExtension(customPath);
    if (!target) throw new Error(`不是有效的 Claude Code 扩展目录：${path.resolve(customPath)}`);
    return [target];
  }
  const parents = [...new Set(extensionParents().filter(Boolean).map(value => path.resolve(value)))];
  const found: TargetExtensionInfo[] = [];
  for (const parent of parents) {
    let entries: import("node:fs").Dirent[];
    try {
      entries = await fs.readdir(parent, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || !entry.name.startsWith(TARGET_DIRECTORY_PREFIX)) continue;
      const target = await inspectExtension(path.join(parent, entry.name));
      if (target) found.push(target);
    }
  }
  return found.sort((a, b) => compareVersions(b.version, a.version));
}

export async function detectLatestExtension(customPath?: string): Promise<TargetExtensionInfo> {
  const found = await detectExtensions(customPath);
  if (!found.length) {
    throw new Error("未检测到 Claude Code VS Code 扩展。请先安装官方扩展，或使用 --target 指定目录。");
  }
  return found[0];
}
