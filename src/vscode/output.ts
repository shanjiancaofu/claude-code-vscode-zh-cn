import * as vscode from "vscode";
import { PatchReport, PatchStatus } from "../core/types";

let channel: vscode.OutputChannel | undefined;

export function outputChannel(): vscode.OutputChannel {
  channel ??= vscode.window.createOutputChannel("Claude Code Zh-CN Patch");
  return channel;
}

export function writeReport(report: PatchReport): void {
  const output = outputChannel();
  output.appendLine(`[${report.createdAt}] ${report.operation}${report.dryRun ? " (dry-run)" : ""}`);
  output.appendLine(`Target: ${report.targetPath}`);
  output.appendLine(`Version: ${report.targetVersion}`);
  report.files.forEach(file => output.appendLine(`- ${file.relativePath}: ${file.replacementCount} replacements`));
  if (report.backupPath) output.appendLine(`Backup: ${report.backupPath}`);
  report.warnings.forEach(warning => output.appendLine(`Warning: ${warning}`));
  report.errors.forEach(error => output.appendLine(`Error: ${error}`));
  output.appendLine("");
}

export function writeStatus(status: PatchStatus): void {
  const output = outputChannel();
  output.appendLine("Claude Code Zh-CN Patch status");
  output.appendLine(`Path: ${status.target.path}`);
  output.appendLine(`Version: ${status.target.version}`);
  output.appendLine(`Patched: ${status.patched}`);
  output.appendLine(`Backup found: ${status.backupFound}`);
  output.appendLine(`Available replacements: ${status.availableReplacements}`);
  output.appendLine("");
}

export function disposeOutput(): void {
  channel?.dispose();
  channel = undefined;
}
