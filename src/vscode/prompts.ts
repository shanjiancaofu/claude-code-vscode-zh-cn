import * as vscode from "vscode";
import { PatchReport } from "../core/types";
import { outputChannel, writeReport } from "./output";

export async function confirmApply(report: PatchReport, showPreview = true): Promise<boolean> {
  const replacements = report.files.reduce((sum, file) => sum + file.replacementCount, 0);
  const detail = showPreview ? `并替换 ${replacements} 处 UI 文案` : "并应用中文 UI 补丁";
  const message = `检测到 Claude Code ${report.targetVersion}：\n${report.targetPath}\n\n将备份原始文件${detail}。是否继续？`;
  const choice = await vscode.window.showWarningMessage(message, { modal: true }, "应用补丁", "查看详情");
  if (choice === "查看详情") {
    writeReport(report);
    outputChannel().show(true);
    return (await vscode.window.showWarningMessage("确认应用中文 UI 补丁？", { modal: true }, "应用补丁")) === "应用补丁";
  }
  return choice === "应用补丁";
}

export async function confirmRestore(targetPath: string): Promise<boolean> {
  const choice = await vscode.window.showWarningMessage(
    `将从最近备份恢复 Claude Code 原始文件：\n${targetPath}\n\n恢复后 UI 会回到英文原版。是否继续？`,
    { modal: true },
    "恢复"
  );
  return choice === "恢复";
}

export async function offerReload(message: string, showReport: () => Promise<void>): Promise<void> {
  const choice = await vscode.window.showInformationMessage(message, "Reload Window", "查看报告", "关闭");
  if (choice === "Reload Window") await vscode.commands.executeCommand("workbench.action.reloadWindow");
  if (choice === "查看报告") await showReport();
}
