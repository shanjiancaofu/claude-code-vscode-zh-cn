import { promises as fs } from "node:fs";
import path from "node:path";
import { TOOL_VERSION, TARGET_EXTENSION_ID } from "./constants";
import { BackupFileEntry, BackupManifest, TargetExtensionInfo } from "./types";
import type { ScannedFile } from "./scanner";
import { backupRoot, safeBackupName, timestampId } from "../utils/path";
import { ensureDirectory, pathExists, readJson, writeJson } from "../utils/fs";

export interface BackupHandle {
  directory: string;
  manifest: BackupManifest;
}

export async function createBackup(target: TargetExtensionInfo, files: ScannedFile[]): Promise<BackupHandle> {
  const directory = path.join(backupRoot(), `${timestampId()}-${process.pid}`);
  const fileDirectory = path.join(directory, "files");
  await ensureDirectory(fileDirectory);
  const entries: BackupFileEntry[] = [];
  try {
    for (const file of files) {
      const backupPath = path.join("files", safeBackupName(file.relativePath));
      const absoluteBackupPath = path.join(directory, backupPath);
      await fs.copyFile(file.absolutePath, absoluteBackupPath);
      entries.push({
        relativePath: file.relativePath,
        absolutePath: file.absolutePath,
        backupPath,
        replacementCount: file.replacementCount,
        sha256Before: file.sha256Before,
        sha256After: file.sha256After
      });
    }
  } catch (error) {
    await fs.rm(directory, { recursive: true, force: true });
    throw new Error(`备份失败，补丁未应用：${error instanceof Error ? error.message : String(error)}`);
  }
  return {
    directory,
    manifest: {
      toolVersion: TOOL_VERSION,
      targetExtension: TARGET_EXTENSION_ID,
      targetVersion: target.version,
      createdAt: new Date().toISOString(),
      targetPath: target.path,
      files: entries
    }
  };
}

export async function finalizeBackup(backup: BackupHandle): Promise<void> {
  await writeJson(path.join(backup.directory, "manifest.json"), backup.manifest);
}

export async function discardBackup(backup: BackupHandle): Promise<void> {
  await fs.rm(backup.directory, { recursive: true, force: true });
}

export async function findLatestBackup(target: TargetExtensionInfo): Promise<BackupHandle | undefined> {
  let directories: string[];
  try {
    directories = await fs.readdir(backupRoot());
  } catch {
    return undefined;
  }
  const matches: BackupHandle[] = [];
  for (const name of directories) {
    const directory = path.join(backupRoot(), name);
    const manifestFile = path.join(directory, "manifest.json");
    if (!(await pathExists(manifestFile))) continue;
    try {
      const manifest = await readJson<BackupManifest>(manifestFile);
      if (path.resolve(manifest.targetPath) === path.resolve(target.path) && manifest.targetVersion === target.version) {
        matches.push({ directory, manifest });
      }
    } catch {
      continue;
    }
  }
  return matches.sort((a, b) => b.manifest.createdAt.localeCompare(a.manifest.createdAt))[0];
}
