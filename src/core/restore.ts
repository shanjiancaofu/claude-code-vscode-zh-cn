import { promises as fs } from "node:fs";
import path from "node:path";
import { findLatestBackup } from "./backup";
import { sha256File } from "./checksum";
import { detectLatestExtension } from "./detector";
import { saveReport } from "./report";
import { PatchFileResult, PatchReport, RuntimeOptions } from "./types";
import { writeFileAtomic } from "../utils/fs";

export async function restoreOriginalFiles(options: RuntimeOptions): Promise<PatchReport> {
  const target = await detectLatestExtension(options.targetPath);
  const backup = await findLatestBackup(target);
  if (!backup) throw new Error("找不到与当前扩展路径和版本匹配的备份，无法恢复。");

  const files: PatchFileResult[] = [];
  const originals = new Map<string, Buffer>();
  for (const entry of backup.manifest.files) {
    const targetFile = path.join(target.path, entry.relativePath);
    const currentContent = await fs.readFile(targetFile);
    originals.set(targetFile, currentContent);
    const currentHash = await sha256File(targetFile);
    if (currentHash !== entry.sha256After && currentHash !== entry.sha256Before) {
      throw new Error(`文件已被其他程序修改，拒绝覆盖：${entry.relativePath}`);
    }
  }

  try {
    for (const entry of backup.manifest.files) {
      const targetFile = path.join(target.path, entry.relativePath);
      const currentHash = await sha256File(targetFile);
    if (currentHash === entry.sha256After) {
      const backupContent = await fs.readFile(path.join(backup.directory, entry.backupPath));
      await writeFileAtomic(targetFile, backupContent);
      const restoredHash = await sha256File(targetFile);
      if (restoredHash !== entry.sha256Before) throw new Error(`恢复后校验失败：${entry.relativePath}`);
    }
    files.push({
      relativePath: entry.relativePath,
      absolutePath: targetFile,
      replacementCount: entry.replacementCount,
      sha256Before: currentHash,
      sha256After: entry.sha256Before
    });
    }
  } catch (error) {
    for (const [targetFile, content] of originals) await writeFileAtomic(targetFile, content);
    throw new Error(`恢复失败，已回滚当前文件：${error instanceof Error ? error.message : String(error)}`);
  }
  const report: PatchReport = {
    operation: "restore",
    targetPath: target.path,
    targetVersion: target.version,
    createdAt: new Date().toISOString(),
    files,
    backupPath: backup.directory,
    warnings: [],
    errors: []
  };
  await saveReport(report);
  return report;
}
