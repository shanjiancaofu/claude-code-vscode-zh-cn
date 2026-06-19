import { promises as fs } from "node:fs";
import path from "node:path";

export async function pathExists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDirectory(directory: string): Promise<void> {
  await fs.mkdir(directory, { recursive: true });
}

export async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await fs.readFile(file, "utf8")) as T;
}

export async function writeJson(file: string, value: unknown): Promise<void> {
  await ensureDirectory(path.dirname(file));
  await writeFileAtomic(file, `${JSON.stringify(value, null, 2)}\n`);
}

export async function writeFileAtomic(file: string, content: string | Buffer): Promise<void> {
  const temporary = `${file}.zh-cn-patch.tmp-${process.pid}-${Date.now()}`;
  await fs.writeFile(temporary, content);
  await fs.rename(temporary, file);
}
