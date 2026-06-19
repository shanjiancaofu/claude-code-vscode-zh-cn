import * as vscode from "vscode";
import { PatchStatus } from "../core/types";

export function statusMessage(status: PatchStatus): string {
  return [
    `Claude Code ${status.target.version}`,
    status.patched ? "中文补丁：已应用" : "中文补丁：未应用",
    `备份：${status.backupFound ? "已找到" : "未找到"}`,
    `可替换文案：${status.availableReplacements}`,
    status.versionMismatch ? "警告：当前版本未经翻译表测试" : "版本：兼容"
  ].join(" · ");
}

export async function showStatus(status: PatchStatus): Promise<void> {
  const choice = await vscode.window.showInformationMessage(statusMessage(status), "查看详情");
  if (choice === "查看详情") await vscode.commands.executeCommand("claudeCodeZhCnPatch.report");
}
