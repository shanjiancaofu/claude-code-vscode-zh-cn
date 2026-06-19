export type RuntimeMode = "cli" | "vscode";
export type PatchOperation = "apply" | "restore" | "status";

export interface RuntimeOptions {
  mode: RuntimeMode;
  dryRun?: boolean;
  targetPath?: string;
}

export interface TargetExtensionInfo {
  name: string;
  version: string;
  path: string;
  packageJsonPath: string;
}

export type TranslationMap = Record<string, string>;

export interface TranslationPack {
  meta: {
    name: string;
    description: string;
    version: string;
    targetExtension: string;
  };
  locale: string;
  testedExtensionVersion: string;
  ui: TranslationMap;
  host: TranslationMap;
  rawFragments: TranslationMap;
  package: TranslationMap;
}

export interface PatchFileResult {
  relativePath: string;
  absolutePath: string;
  replacementCount: number;
  sha256Before: string;
  sha256After: string;
}

export interface BackupFileEntry extends PatchFileResult {
  backupPath: string;
}

export interface BackupManifest {
  toolVersion: string;
  targetExtension: string;
  targetVersion: string;
  createdAt: string;
  targetPath: string;
  files: BackupFileEntry[];
}

export interface PatchReport {
  operation: PatchOperation;
  targetPath: string;
  targetVersion: string;
  createdAt: string;
  files: PatchFileResult[];
  backupPath?: string;
  dryRun?: boolean;
  patched?: boolean;
  backupFound?: boolean;
  availableReplacements?: number;
  warnings: string[];
  errors: string[];
}

export interface PatchStatus {
  target: TargetExtensionInfo;
  patched: boolean;
  backupFound: boolean;
  latestBackupAt?: string;
  versionMismatch: boolean;
  availableReplacements: number;
  files: PatchFileResult[];
}

export interface ReplacementResult {
  content: string;
  count: number;
}
