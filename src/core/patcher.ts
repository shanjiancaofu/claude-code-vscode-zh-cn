import { promises as fs } from "node:fs";
import path from "node:path";
import { createBackup, discardBackup, finalizeBackup } from "./backup";
import { detectLatestExtension } from "./detector";
import { saveReport } from "./report";
import { scanTarget } from "./scanner";
import { PatchReport, RuntimeOptions } from "./types";
import { loadTranslationPack } from "./translation";
import { writeFileAtomic } from "../utils/fs";

export async function applyPatch(options: RuntimeOptions): Promise<PatchReport> {
  const target = await detectLatestExtension(options.targetPath);
  const pack = await loadTranslationPack();
  const scanned = await scanTarget(target, pack);
  const files = scanned.map(({ originalContent: _original, patchedContent: _patched, ...file }) => file);
  const warnings: string[] = [];
  if (target.version !== pack.testedExtensionVersion) {
    warnings.push(`翻译表在 ${pack.testedExtensionVersion} 测试，当前版本为 ${target.version}。`);
  }
  const replacements = files.reduce((sum, file) => sum + file.replacementCount, 0);
  if (!replacements) warnings.push("未找到可替换文案；扩展可能已汉化或当前版本不兼容。");
  const report: PatchReport = {
    operation: "apply",
    targetPath: target.path,
    targetVersion: target.version,
    createdAt: new Date().toISOString(),
    files,
    dryRun: Boolean(options.dryRun),
    availableReplacements: replacements,
    warnings,
    errors: []
  };
  if (options.dryRun || !replacements) {
    await saveReport(report);
    return report;
  }

  const changed = scanned.filter(file => file.replacementCount > 0);
  const backup = await createBackup(target, changed);
  report.backupPath = backup.directory;
  try {
    for (const file of changed) await writeFileAtomic(file.absolutePath, file.patchedContent);
    await finalizeBackup(backup);
  } catch (error) {
    for (const entry of backup.manifest.files) {
      await fs.copyFile(path.join(backup.directory, entry.backupPath), path.join(target.path, entry.relativePath));
    }
    await discardBackup(backup);
    report.errors.push(error instanceof Error ? error.message : String(error));
    await saveReport(report);
    throw new Error(`应用补丁失败，已回滚原文件：${report.errors[0]}`);
  }
  await saveReport(report);
  return report;
}
