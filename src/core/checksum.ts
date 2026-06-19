import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";

export function sha256(content: string | Buffer): string {
  return createHash("sha256").update(content).digest("hex");
}

export async function sha256File(file: string): Promise<string> {
  return sha256(await fs.readFile(file));
}
