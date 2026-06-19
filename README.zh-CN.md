# Claude Code VS Code 简体中文补丁辅助工具

[English](./README.md) | 简体中文

这是一个非官方、由用户主动触发的 Claude Code VS Code 扩展中文 UI 补丁工具。

本项目不包含、不分发 Claude Code 插件本体、修改后的 VSIX 或 Anthropic 源码。用户需要自行安装官方 Claude Code 扩展；工具只在用户确认后替换本地扩展中的可见 UI 文案。

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

## 文档

- [使用说明](./docs/usage.md)
- [兼容性](./docs/compatibility.md)
- [常见问题](./docs/faq.md)

## 免责声明

本项目是非官方 Claude Code VS Code 插件中文 UI 补丁辅助工具。

本项目不包含、不分发 Claude Code 插件本体。本项目仅在用户主动确认后，对本地已安装的官方 Claude Code 扩展进行 UI 文案替换。

Claude Code 及相关商标归 Anthropic 所有。本项目与 Anthropic 无关，不代表官方立场，也未获得 Anthropic 官方认可。

## License

本工具代码和社区翻译采用 [MIT License](./LICENSE)。此许可证不适用于 Claude Code 插件本身。
