import * as vscode from "vscode";
import { applyPatch } from "../core/patcher";
import { restoreOriginalFiles } from "../core/restore";
import { latestReportPath, showLatestReport } from "../core/report";
import { getStatus, saveStatusReport } from "../core/status";
import { confirmApply, confirmRestore, offerReload } from "./prompts";
import { outputChannel, writeReport, writeStatus } from "./output";
import { showStatus } from "./status";

function configuration(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration("claudeCodeZhCnPatch");
}

function targetPath(): string | undefined {
  return configuration().get<string>("customClaudeCodePath")?.trim() || undefined;
}

async function handleError(error: unknown): Promise<void> {
  const message = error instanceof Error ? error.message : String(error);
  outputChannel().appendLine(`Error: ${message}`);
  const choice = await vscode.window.showErrorMessage(`Claude Code Zh-CN Patch：${message}`, "打开设置", "查看日志");
  if (choice === "打开设置") await vscode.commands.executeCommand("workbench.action.openSettings", "claudeCodeZhCnPatch");
  if (choice === "查看日志") outputChannel().show(true);
}

async function showReportCommand(): Promise<void> {
  const report = await showLatestReport();
  if (!report) {
    await vscode.window.showInformationMessage("尚未生成补丁报告。");
    return;
  }
  writeReport(report);
  outputChannel().show(true);
  const document = await vscode.workspace.openTextDocument(vscode.Uri.file(latestReportPath()));
  await vscode.window.showTextDocument(document, { preview: true });
}

export function registerCommands(context: vscode.ExtensionContext): void {
  const register = (name: string, callback: () => Promise<void>) => {
    context.subscriptions.push(vscode.commands.registerCommand(name, async () => {
      try {
        await callback();
      } catch (error) {
        await handleError(error);
      }
    }));
  };

  register("claudeCodeZhCnPatch.apply", async () => {
    const options = { mode: "vscode" as const, targetPath: targetPath() };
    const preview = await applyPatch({ ...options, dryRun: true });
    writeReport(preview);
    if (!preview.availableReplacements) {
      await vscode.window.showInformationMessage("没有可应用的中文文案。补丁可能已应用，或当前 Claude Code 版本不兼容。");
      return;
    }
    if (!(await confirmApply(preview, configuration().get<boolean>("dryRunBeforeApply", true)))) return;
    const report = await applyPatch(options);
    writeReport(report);
    if (configuration().get<boolean>("showReportAfterPatch", true)) outputChannel().show(true);
    await offerReload("中文补丁已应用。建议重新加载 VS Code 窗口以生效。", showReportCommand);
  });

  register("claudeCodeZhCnPatch.restore", async () => {
    const status = await getStatus({ mode: "vscode", targetPath: targetPath() });
    if (!(await confirmRestore(status.target.path))) return;
    const report = await restoreOriginalFiles({ mode: "vscode", targetPath: status.target.path });
    writeReport(report);
    if (configuration().get<boolean>("showReportAfterPatch", true)) outputChannel().show(true);
    await offerReload("已恢复 Claude Code 原始文件。建议重新加载 VS Code 窗口。", showReportCommand);
  });

  register("claudeCodeZhCnPatch.restoreBeforeUninstall", async () => {
    const status = await getStatus({ mode: "vscode", targetPath: targetPath() });
    if (!(await confirmRestore(status.target.path))) return;
    const report = await restoreOriginalFiles({ mode: "vscode", targetPath: status.target.path });
    writeReport(report);
    await vscode.window.showInformationMessage("原始文件已恢复，现在可以安全卸载本工具。", "打开扩展面板").then(async choice => {
      if (choice === "打开扩展面板") await vscode.commands.executeCommand("workbench.view.extensions");
    });
  });

  register("claudeCodeZhCnPatch.status", async () => {
    const status = await getStatus({ mode: "vscode", targetPath: targetPath() });
    writeStatus(status);
    await saveStatusReport(status);
    await showStatus(status);
  });

  register("claudeCodeZhCnPatch.report", showReportCommand);
}
