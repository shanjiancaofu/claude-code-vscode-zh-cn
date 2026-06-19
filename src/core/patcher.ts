import { promises as fs } from "node:fs";
import path from "node:path";
import { createBackup, discardBackup, extendBackup, finalizeBackup, findLatestBackup, isBackupCompatible } from "./backup";
import { detectLatestExtension } from "./detector";
import { saveReport } from "./report";
import { scanTarget } from "./scanner";
import { PatchReport, RuntimeOptions } from "./types";
import { loadTranslationPack } from "./translation";
import { writeFileAtomic, writeJson } from "../utils/fs";

export async function applyPatch(options: RuntimeOptions): Promise<PatchReport> {
  const target = await detectLatestExtension(options.targetPath);
  const pack = await loadTranslationPack(options.translationPath);
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
  const latestBackup = await findLatestBackup(target);
  const reuseBackup = latestBackup ? await isBackupCompatible(latestBackup, target) : false;
  if (latestBackup && !reuseBackup) {
    throw new Error("检测到插件文件在补丁之外被修改。为保护原始备份，请先恢复或重新安装 Claude Code 后再应用补丁。");
  }
  const backup = reuseBackup && latestBackup ? latestBackup : await createBackup(target, changed);
  const previousManifest = reuseBackup ? structuredClone(backup.manifest) : undefined;
  let addedBackupPaths: string[] = [];
  report.backupPath = backup.directory;
  try {
    if (reuseBackup) {
      addedBackupPaths = await extendBackup(backup, changed);
      warnings.push("已沿用首次应用补丁时的原始备份，可完整恢复英文原文件。");
    }
    for (const file of changed) await writeFileAtomic(file.absolutePath, file.patchedContent);
    await finalizeBackup(backup);
  } catch (error) {
    for (const file of changed) await writeFileAtomic(file.absolutePath, file.originalContent);
    if (previousManifest) {
      backup.manifest = previousManifest;
      await writeJson(path.join(backup.directory, "manifest.json"), previousManifest);
      for (const backupPath of addedBackupPaths) await fs.rm(path.join(backup.directory, backupPath), { force: true });
    } else {
      await discardBackup(backup);
    }
    report.errors.push(error instanceof Error ? error.message : String(error));
    await saveReport(report);
    throw new Error(`应用补丁失败，已回滚原文件：${report.errors[0]}`);
  }
  await saveReport(report);
  return report;
}
