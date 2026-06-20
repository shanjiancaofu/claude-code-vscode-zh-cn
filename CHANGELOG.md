# 更新日志 / Changelog

## 0.1.2

### 中文

- 新增 VS Code Marketplace 扩展图标，并优化 README 的 Marketplace 安装与首次使用说明。

### English

- Added a Marketplace extension icon and improved the README installation and first-use instructions.

## 0.1.1

### 中文

- 补齐模型设置、终端提示、CLAUDE.md 引导和输入框快捷键等可见文案。
- 增量更新翻译时保留首次可信的原始备份，确保能够完整恢复英文文件。
- 当受管理文件包含无法识别的外部改动时拒绝应用补丁，避免覆盖用户修改。
- 新增增量更新、外部修改保护和逐字节恢复回归测试。

### English

- Completed visible translations for model settings, terminal prompts, CLAUDE.md guidance, and input shortcuts.
- Preserved the first trusted original backup across incremental translation updates.
- Refused patching when managed files contain unrecognized external changes.
- Added regression tests for incremental updates, external-change protection, and byte-for-byte restore.

## 0.1.0

### 中文

- 新增 CLI 与 VS Code 命令共用的 TypeScript Core。
- 新增 dry-run、状态检查、外置备份、SHA-256 校验、安全恢复和 JSON 报告。
- 新增应用补丁、恢复原文件、卸载前恢复、检查状态和查看报告命令。
- 新增跨环境扩展检测和首版简体中文翻译包。
- 新增 CI、Git 标签触发的 GitHub Release 自动化、Issue 模板、贡献指南和媒体素材规范。

### English

- Added a shared TypeScript core for CLI and VS Code commands.
- Added dry-run, status, external backups, SHA-256 validation, safe restore, and JSON reports.
- Added Apply, Restore, Restore Before Uninstall, Check Status, and Show Report commands.
- Added cross-environment extension detection and the initial zh-CN translation pack.
- Added CI, tagged GitHub Release automation, issue forms, contribution guidance, and media preparation docs.
