#!/usr/bin/env node

const path = require("node:path");
const fs = require("node:fs");

const entry = path.resolve(__dirname, "../dist/src/cli/index.js");
if (!fs.existsSync(entry)) {
  console.error("错误：项目尚未编译。请先执行 npm install && npm run compile。");
  process.exitCode = 1;
} else {
  require(entry).runCli(process.argv.slice(2)).catch(error => {
    console.error(`[Claude Code Zh-CN Patch] 执行失败：${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
}
