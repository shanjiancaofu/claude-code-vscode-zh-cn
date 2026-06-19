# 使用说明

## 源码命令

```bash
npm run status
npm run dry-run
npm run apply
npm run report
npm run restore
```

自定义目标路径：

```bash
npm run dry-run -- --target ~/.vscode-server/extensions/anthropic.claude-code-版本
npm run apply -- --target ~/.vscode-server/extensions/anthropic.claude-code-版本
```

同一环境存在多个安装位置时：

```bash
npm run apply -- --all
```

## 远程环境

补丁需要在 Claude Code 扩展实际安装的环境中运行：

- WSL：在 WSL 终端运行；
- Remote SSH：在远程终端运行；
- Dev Container：在容器终端运行；
- 本地扩展：在本地终端运行。

完成后执行 VS Code 命令 `Developer: Reload Window`。
