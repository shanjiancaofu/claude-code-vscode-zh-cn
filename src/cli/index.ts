#!/usr/bin/env node

import { applyPatch } from "../core/patcher";
import { restoreOriginalFiles } from "../core/restore";
import { showLatestReport } from "../core/report";
import { getStatus, saveStatusReport } from "../core/status";
import { detectExtensions } from "../core/detector";
import { PatchReport, PatchStatus } from "../core/types";

function optionValue(args: string[], ...names: string[]): string | undefined {
  for (const name of names) {
    const index = args.indexOf(name);
    if (index >= 0) {
      if (!args[index + 1] || args[index + 1].startsWith("--")) throw new Error(`${name} 后需要提供目录。`);
      return args[index + 1];
    }
  }
  return undefined;
}

function printReport(report: PatchReport): void {
  console.log("\nClaude Code Zh-CN Patch Helper\n");
  console.log(`Operation: ${report.operation}${report.dryRun ? " (dry-run)" : ""}`);
  console.log(`Target: ${report.targetPath}`);
  console.log(`Version: ${report.targetVersion}`);
  console.log(`Files: ${report.files.length}`);
  console.log(`Replacements: ${report.files.reduce((sum, file) => sum + file.replacementCount, 0)}`);
  if (report.backupPath) console.log(`Backup: ${report.backupPath}`);
  report.warnings.forEach(warning => console.warn(`Warning: ${warning}`));
  report.errors.forEach(error => console.error(`Error: ${error}`));
  if (report.operation !== "status" && !report.dryRun) console.log("\nDone. Please reload the VS Code window.");
}

function printStatus(status: PatchStatus): void {
  console.log("\nClaude Code Zh-CN Patch Helper\n");
  console.log("Status:");
  console.log(`- Claude Code extension: found`);
  console.log(`- Extension path: ${status.target.path}`);
  console.log(`- Version: ${status.target.version}`);
  console.log(`- Patched: ${status.patched}`);
  console.log(`- Backup: ${status.backupFound ? status.latestBackupAt : "not found"}`);
  console.log(`- Version mismatch: ${status.versionMismatch}`);
  console.log(`- Available replacements: ${status.availableReplacements}`);
}

function printHelp(): void {
  console.log(`Claude Code Zh-CN Patch Helper

Usage:
  npm run status
  npm run dry-run
  npm run apply
  npm run restore
  npm run report

Direct CLI:
  claude-code-zh-cn-patch <apply|restore|status|report|list> [options]

Options:
  --dry-run          Preview without writing files
  --target <path>    Use a specific Claude Code extension directory
  --all              Process every detected installation (apply only)
`);
}

export async function runCli(args = process.argv.slice(2)): Promise<void> {
  let command = args[0];
  if (!command || command.startsWith("--")) {
    if (args.includes("--restore")) command = "restore";
    else if (args.includes("--list")) command = "list";
    else command = "apply";
  }
  if (command === "--help" || command === "help" || args.includes("--help")) return printHelp();
  const targetPath = optionValue(args, "--target", "--path");

  if (command === "list") {
    const targets = await detectExtensions(targetPath);
    if (!targets.length) console.log("未检测到 Claude Code 扩展。");
    targets.forEach(target => console.log(`${target.version}\t${target.path}`));
    return;
  }
  if (command === "report") {
    const report = await showLatestReport();
    if (!report) throw new Error("尚未生成补丁报告。");
    return printReport(report);
  }
  if (command === "status") {
    const status = await getStatus({ mode: "cli", targetPath });
    printStatus(status);
    await saveStatusReport(status);
    return;
  }
  if (command === "restore") {
    return printReport(await restoreOriginalFiles({ mode: "cli", targetPath }));
  }
  if (command !== "apply") throw new Error(`未知命令：${command}`);

  const dryRun = args.includes("--dry-run");
  if (args.includes("--all") && !targetPath) {
    const targets = await detectExtensions();
    if (!targets.length) throw new Error("未检测到 Claude Code 扩展。");
    for (const target of targets) printReport(await applyPatch({ mode: "cli", dryRun, targetPath: target.path }));
    return;
  }
  printReport(await applyPatch({ mode: "cli", dryRun, targetPath }));
}

if (require.main === module) {
  runCli().catch(error => {
    console.error(`[Claude Code Zh-CN Patch] 执行失败：${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
}
