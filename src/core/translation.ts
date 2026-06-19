import path from "node:path";
import { TranslationMap, TranslationPack } from "./types";
import { readJson } from "../utils/fs";

export function defaultTranslationPath(): string {
  const candidates = [
    path.resolve(__dirname, "../../translations/zh-CN.json"),
    path.resolve(__dirname, "../../../translations/zh-CN.json"),
    path.resolve(process.cwd(), "translations/zh-CN.json")
  ];
  return candidates.find(candidate => require("node:fs").existsSync(candidate)) ?? candidates[0];
}

function validateMap(name: string, map: unknown): asserts map is TranslationMap {
  if (!map || typeof map !== "object" || Array.isArray(map)) throw new Error(`翻译组 ${name} 必须是对象。`);
  for (const [source, target] of Object.entries(map)) {
    if (!source) throw new Error(`翻译组 ${name} 包含空 source。`);
    if (typeof target !== "string" || !target) throw new Error(`翻译 ${name}.${source} 的 target 无效。`);
  }
}

export async function loadTranslationPack(file = defaultTranslationPath()): Promise<TranslationPack> {
  const pack = await readJson<TranslationPack>(file);
  if (!pack.meta || pack.meta.targetExtension !== "anthropic.claude-code") throw new Error("翻译表 meta 无效。 ");
  if (pack.locale !== "zh-CN" || !pack.testedExtensionVersion) throw new Error("翻译表语言或测试版本无效。 ");
  validateMap("ui", pack.ui);
  validateMap("host", pack.host);
  validateMap("rawFragments", pack.rawFragments);
  validateMap("package", pack.package);
  return pack;
}
