import { detectLatestExtension } from "./detector";
import { saveReport } from "./report";
import { checkPatchStatus } from "./scanner";
import { PatchReport, PatchStatus, RuntimeOptions } from "./types";
import { loadTranslationPack } from "./translation";

export async function getStatus(options: RuntimeOptions): Promise<PatchStatus> {
  const target = await detectLatestExtension(options.targetPath);
  return checkPatchStatus(target, await loadTranslationPack());
}

export async function saveStatusReport(status: PatchStatus): Promise<PatchReport> {
  const warnings: string[] = [];
  if (status.versionMismatch) warnings.push("当前 Claude Code 版本与翻译表测试版本不同。");
  if (!status.backupFound && status.availableReplacements === 0) warnings.push("未找到备份且没有可替换文案，文件可能由旧版工具修改。 ");
  const report: PatchReport = {
    operation: "status",
    targetPath: status.target.path,
    targetVersion: status.target.version,
    createdAt: new Date().toISOString(),
    files: status.files,
    patched: status.patched,
    backupFound: status.backupFound,
    availableReplacements: status.availableReplacements,
    warnings,
    errors: []
  };
  await saveReport(report);
  return report;
}
