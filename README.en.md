# Claude Code Zh-CN Patch Helper

[简体中文](./README.md) | English

An unofficial, user-triggered Simplified Chinese UI patch helper for the official Claude Code VS Code extension.

[![CI](https://github.com/shanjiancaofu/claude-code-vscode-zh-cn/actions/workflows/ci.yml/badge.svg)](https://github.com/shanjiancaofu/claude-code-vscode-zh-cn/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/shanjiancaofu/claude-code-vscode-zh-cn?display_name=tag)](https://github.com/shanjiancaofu/claude-code-vscode-zh-cn/releases)
[![License](https://img.shields.io/github/license/shanjiancaofu/claude-code-vscode-zh-cn)](./LICENSE)

This project does **not** contain or redistribute Claude Code, modified VSIX packages, or Anthropic source code. It only patches visible UI strings in a locally installed official extension after explicit user confirmation.

## Preview

> 📸 Screenshots and a GIF are being prepared. See [the media guide](./docs/screenshots.md) for the planned before/after and backup/restore demos.

## Features

- Shared TypeScript core for both CLI and VS Code commands
- Detects VS Code, Remote SSH, WSL, Dev Containers, Cursor, Windsurf, VSCodium and code-server installations
- Dry-run preview before writing
- External timestamped backups with SHA-256 manifests
- Safe restore with version and checksum validation
- Status checks and JSON patch reports
- No telemetry, uploads, or access to project source code

## Source usage

```bash
git clone https://github.com/shanjiancaofu/claude-code-vscode-zh-cn.git
cd claude-code-vscode-zh-cn
npm install
npm run status
npm run dry-run
npm run apply
```

Restore the original files before uninstalling this tool:

```bash
npm run restore
```

Pass a non-standard extension location after `--`:

```bash
npm run apply -- --target /path/to/anthropic.claude-code-version
```

## VSIX usage

Download the latest `.vsix` from [GitHub Releases](https://github.com/shanjiancaofu/claude-code-vscode-zh-cn/releases), or build it locally:

```bash
npm run compile
npm run package
code --install-extension claude-code-zh-cn-patch-helper-0.1.0.vsix
```

Then open the Command Palette and run:

- `Claude Code Zh-CN Patch: Apply Patch`
- `Claude Code Zh-CN Patch: Restore Original Files`
- `Claude Code Zh-CN Patch: Restore Before Uninstall`
- `Claude Code Zh-CN Patch: Check Status`
- `Claude Code Zh-CN Patch: Show Patch Report`

## Important behavior

The helper modifies only these files inside a validated `anthropic.claude-code-*` directory:

- `extension.js`
- `webview/index.js`
- `package.json`

Backups and reports are stored outside extension directories under `~/.claude-code-zh-cn-patch/`. Updating Claude Code normally creates a new extension directory, so the patch must be applied again. Uninstalling this helper does not automatically undo an existing patch.

## Documentation

- [Usage](./docs/usage.md)
- [Compatibility](./docs/compatibility.md)
- [FAQ](./docs/faq.md)
- [Contributing](./CONTRIBUTING.md)
- [Screenshot and GIF guide](./docs/screenshots.md)

If this project helps, consider giving it a ⭐ Star so more Chinese Claude Code users can find it.

## Disclaimer

This project is unofficial and is not affiliated with or endorsed by Anthropic. Claude Code and related trademarks belong to Anthropic. Users must install the official Claude Code extension separately.

## License

The helper code and community translation data are licensed under the [MIT License](./LICENSE). This license does not apply to Claude Code itself.
