import os from "node:os";
import path from "node:path";
import { STATE_DIRECTORY_NAME } from "../core/constants";

export function stateRoot(): string {
  return process.env.CLAUDE_CODE_ZH_CN_STATE_DIR
    ? path.resolve(process.env.CLAUDE_CODE_ZH_CN_STATE_DIR)
    : path.join(os.homedir(), STATE_DIRECTORY_NAME);
}

export function backupRoot(): string {
  return path.join(stateRoot(), "backups");
}

export function reportRoot(): string {
  return path.join(stateRoot(), "reports");
}

export function timestampId(date = new Date()): string {
  return date.toISOString().replace(/[:.]/g, "-");
}

export function safeBackupName(relativePath: string): string {
  return relativePath.replace(/[\\/]/g, "__");
}
