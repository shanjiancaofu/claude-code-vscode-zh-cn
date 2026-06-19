import { ReplacementResult, TranslationMap, TranslationPack } from "./types";

function replaceAll(source: string, from: string, to: string): ReplacementResult {
  const parts = source.split(from);
  return parts.length === 1 ? { content: source, count: 0 } : { content: parts.join(to), count: parts.length - 1 };
}

export function replaceJavaScript(source: string, translations: TranslationMap): ReplacementResult {
  let content = source;
  let count = 0;
  for (const [english, chinese] of Object.entries(translations)) {
    const forms: Array<[string, string]> = [
      [JSON.stringify(english), JSON.stringify(chinese)],
      [`'${english.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`, `'${chinese.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`],
      [`\`${english.replace(/\\/g, "\\\\").replace(/`/g, "\\`")}\``, `\`${chinese.replace(/\\/g, "\\\\").replace(/`/g, "\\`")}\``]
    ];
    for (const [from, to] of forms) {
      const result = replaceAll(content, from, to);
      content = result.content;
      count += result.count;
    }
  }
  return { content, count };
}

export function replaceRawFragments(source: string, translations: TranslationMap): ReplacementResult {
  let content = source;
  let count = 0;
  for (const [english, chinese] of Object.entries(translations)) {
    const result = replaceAll(content, english, chinese);
    content = result.content;
    count += result.count;
  }
  return { content, count };
}

function translateJson(value: unknown, translations: TranslationMap): { value: unknown; count: number } {
  if (typeof value === "string") {
    const target = translations[value];
    return target === undefined ? { value, count: 0 } : { value: target, count: 1 };
  }
  if (Array.isArray(value)) {
    let count = 0;
    const translated = value.map(item => {
      const result = translateJson(item, translations);
      count += result.count;
      return result.value;
    });
    return { value: translated, count };
  }
  if (value && typeof value === "object") {
    let count = 0;
    const translated: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      const result = translateJson(item, translations);
      translated[key] = result.value;
      count += result.count;
    }
    return { value: translated, count };
  }
  return { value, count: 0 };
}

export function replacePackageJson(source: string, translations: TranslationMap): ReplacementResult {
  const parsed = JSON.parse(source) as unknown;
  const result = translateJson(parsed, translations);
  return { content: `${JSON.stringify(result.value, null, "\t")}\n`, count: result.count };
}

export function replaceFile(relativePath: string, source: string, pack: TranslationPack): ReplacementResult {
  if (relativePath === "webview/index.js") {
    const strings = replaceJavaScript(source, pack.ui);
    const fragments = replaceRawFragments(strings.content, pack.rawFragments);
    return { content: fragments.content, count: strings.count + fragments.count };
  }
  if (relativePath === "extension.js") return replaceJavaScript(source, pack.host);
  if (relativePath === "package.json") return replacePackageJson(source, pack.package);
  throw new Error(`不允许修改非白名单文件：${relativePath}`);
}
