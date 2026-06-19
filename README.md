# Claude Code VS Code 简体中文补丁辅助工具

简体中文 | [English](./README.en.md)

> 一键汉化 Claude Code VS Code，支持修改预览、自动备份、安全恢复、WSL、SSH 和 Windows。

[![CI](https://github.com/shanjiancaofu/claude-code-vscode-zh-cn/actions/workflows/ci.yml/badge.svg)](https://github.com/shanjiancaofu/claude-code-vscode-zh-cn/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/shanjiancaofu/claude-code-vscode-zh-cn?display_name=tag)](https://github.com/shanjiancaofu/claude-code-vscode-zh-cn/releases)
[![License](https://img.shields.io/github/license/shanjiancaofu/claude-code-vscode-zh-cn)](./LICENSE)

这是一个非官方、由用户主动触发的 Claude Code VS Code 扩展中文 UI 补丁工具。

本项目不包含、不分发 Claude Code 插件本体、修改后的 VSIX 或 Anthropic 源码。用户需要自行安装官方 Claude Code 扩展；工具只在用户确认后替换本地扩展中的可见 UI 文案。

## 效果预览

> 📸 截图与 GIF 正在制作。媒体文件约定见 [docs/screenshots.md](./docs/screenshots.md)，后续将展示汉化前后对比和完整备份恢复流程。

## 功能

- CLI 与 VS Code 命令共用同一套 TypeScript core
- 自动检测 VS Code、Remote SSH、WSL、Dev Container、Cursor、Windsurf、VSCodium 和 code-server
- 修改前 dry-run 预览
- 在扩展目录外创建带时间戳、SHA-256 校验的备份
- 恢复时校验路径、版本和文件哈希，避免误覆盖
- 提供状态检查和 JSON 补丁报告
- 不收集遥测，不上传文件，不读取用户项目代码

## 方式一：源码直跑

```bash
git clone https://github.com/shanjiancaofu/claude-code-vscode-zh-cn.git
cd claude-code-vscode-zh-cn
npm install
npm run status
npm run dry-run
npm run apply
```

恢复英文原版：

```bash
npm run restore
```

查看最近报告：

```bash
npm run report
```

指定非标准扩展目录：

```bash
npm run apply -- --target /path/to/anthropic.claude-code-version
```

## 方式二：安装 VSIX

普通用户可从 [Releases](https://github.com/shanjiancaofu/claude-code-vscode-zh-cn/releases) 下载最新 `.vsix`，然后在 VS Code 中执行 `Extensions: Install from VSIX...`。

开发者构建：

```bash
npm install
npm run compile
npm run package
```

安装生成的 VSIX：

```bash
code --install-extension claude-code-zh-cn-patch-helper-0.1.0.vsix
```

随后打开 VS Code 命令面板，执行：

- `Claude Code Zh-CN Patch: Apply Patch`
- `Claude Code Zh-CN Patch: Restore Original Files`
- `Claude Code Zh-CN Patch: Restore Before Uninstall`
- `Claude Code Zh-CN Patch: Check Status`
- `Claude Code Zh-CN Patch: Show Patch Report`

## 方式三：Marketplace

发布后可在扩展市场搜索 `Claude Code Zh-CN Patch Helper`。安装不会自动修改 Claude Code；必须由用户主动执行 `Apply Patch` 并确认目标路径和修改数量。

## 配置项

- `claudeCodeZhCnPatch.customClaudeCodePath`：手动指定 Claude Code 扩展目录
- `claudeCodeZhCnPatch.showReportAfterPatch`：操作完成后显示报告
- `claudeCodeZhCnPatch.dryRunBeforeApply`：应用前显示预览

## 安全与备份

工具只允许处理经过清单校验的 `anthropic.claude-code-*` 目录，且当前只修改：

- `extension.js`
- `webview/index.js`
- `package.json`

备份和报告保存在 `~/.claude-code-zh-cn-patch/`，不放入 Claude Code 或本工具的扩展目录。恢复前会验证当前文件哈希；若文件被其他程序修改，工具会拒绝强制覆盖。

## 卸载说明

卸载本工具不会自动撤销已经写入 Claude Code 目录的补丁。卸载前必须先执行：

```text
Claude Code Zh-CN Patch: Restore Before Uninstall
```

源码用户执行：

```bash
npm run restore
```

## 更新日志

### 2026-06-20（v0.1.0，适配 Claude Code VS Code 2.1.183）

- `translations/zh-CN.json`：共 1,422 条分组映射，覆盖 510 条不重复英文文案
  - `ui`：447 条 Webview UI 翻译
  - `host`：465 条扩展主程序与命令翻译
  - `rawFragments`：14 条动态模板片段翻译
  - `package`：496 条设置、命令和扩展清单翻译
- 支持修改 `webview/index.js`、`extension.js` 和 `package.json` 中的可见 UI 文案
- 新增 TypeScript 共享 Core，CLI 与 VS Code 命令共用检测、扫描、替换和恢复逻辑
- 新增 dry-run、状态检查、JSON 报告、外置时间戳备份和 SHA-256 安全恢复
- 新增 Windows、macOS、Linux、WSL、Remote SSH、Dev Container 等环境检测
- 新增 Apply、Restore、Restore Before Uninstall、Check Status 和 Show Report 命令
- 新增 GitHub Actions CI、标签触发 Release、VSIX 构建及 SHA-256 校验文件
- 新增 Bug、遗漏翻译 Issue 模板、PR 模板、贡献指南和安全说明

完整版本记录见 [CHANGELOG.md](./CHANGELOG.md)。

## 文档

- [使用说明](./docs/usage.md)
- [兼容性](./docs/compatibility.md)
- [常见问题](./docs/faq.md)
- [参与贡献](./CONTRIBUTING.md)
- [截图与 GIF 规范](./docs/screenshots.md)

如果这个项目帮你解决了英文界面问题，欢迎点一个 ⭐ Star。它能帮助更多中文用户发现这个工具。

## 免责声明

本项目是非官方 Claude Code VS Code 插件中文 UI 补丁辅助工具。

本项目不包含、不分发 Claude Code 插件本体。本项目仅在用户主动确认后，对本地已安装的官方 Claude Code 扩展进行 UI 文案替换。

Claude Code 及相关商标归 Anthropic 所有。本项目与 Anthropic 无关，不代表官方立场，也未获得 Anthropic 官方认可。

## License

本工具代码和社区翻译采用 [MIT License](./LICENSE)。此许可证不适用于 Claude Code 插件本身。
