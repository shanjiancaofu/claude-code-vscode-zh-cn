# Claude Code Zh-CN Patch Helper

[简体中文](./README.zh-CN.md) | English

An unofficial, user-triggered Simplified Chinese UI patch helper for the official Claude Code VS Code extension.

This project does **not** contain or redistribute Claude Code, modified VSIX packages, or Anthropic source code. It only patches visible UI strings in a locally installed official extension after explicit user confirmation.

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

## Disclaimer

This project is unofficial and is not affiliated with or endorsed by Anthropic. Claude Code and related trademarks belong to Anthropic. Users must install the official Claude Code extension separately.

## License

The helper code and community translation data are licensed under the [MIT License](./LICENSE). This license does not apply to Claude Code itself.
