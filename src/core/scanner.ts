import { promises as fs } from "node:fs";
import path from "node:path";
import { PATCH_FILES } from "./constants";
import { sha256 } from "./checksum";
import { replaceFile } from "./replacement";
import { PatchFileResult, PatchStatus, TargetExtensionInfo, TranslationPack } from "./types";
import { findLatestBackup } from "./backup";

export interface ScannedFile extends PatchFileResult {
  originalContent: Buffer;
  patchedContent: Buffer;
}

export async function scanTarget(target: TargetExtensionInfo, pack: TranslationPack): Promise<ScannedFile[]> {
  const results: ScannedFile[] = [];
  for (const relativePath of PATCH_FILES) {
    const absolutePath = path.join(target.path, relativePath);
    const originalContent = await fs.readFile(absolutePath);
    const replacement = replaceFile(relativePath, originalContent.toString("utf8"), pack);
    const patchedContent = Buffer.from(replacement.content, "utf8");
    results.push({
      relativePath,
      absolutePath,
      replacementCount: replacement.count,
      sha256Before: sha256(originalContent),
      sha256After: sha256(patchedContent),
      originalContent,
      patchedContent
    });
  }
  return results;
}

export async function checkPatchStatus(target: TargetExtensionInfo, pack: TranslationPack): Promise<PatchStatus> {
  const files = await scanTarget(target, pack);
  const backup = await findLatestBackup(target);
  let patched = false;
  if (backup) {
    patched = (await Promise.all(backup.manifest.files.map(async entry => {
      try {
        return sha256(await fs.readFile(path.join(target.path, entry.relativePath))) === entry.sha256After;
      } catch {
        return false;
      }
    }))).every(Boolean);
  }
  return {
    target,
    patched,
    backupFound: Boolean(backup),
    latestBackupAt: backup?.manifest.createdAt,
    versionMismatch: pack.testedExtensionVersion !== target.version,
    availableReplacements: files.reduce((sum, file) => sum + file.replacementCount, 0),
    files: files.map(({ originalContent: _original, patchedContent: _patched, ...file }) => file)
  };
}
