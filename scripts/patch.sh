#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PATCH_SCRIPT="$SCRIPT_DIR/../bin/patch.js"

if command -v node >/dev/null 2>&1; then
  exec node "$PATCH_SCRIPT" "$@"
fi

for parent in "$HOME/.vscode-server/bin" "$HOME/.vscode-server-insiders/bin" "$HOME/.cursor-server/bin" "$HOME/.windsurf-server/bin"; do
  if [ ! -d "$parent" ]; then
    continue
  fi
  for candidate in "$parent"/*/node; do
    if [ -x "$candidate" ]; then
      NODE_BIN=$candidate
    fi
  done
done

if [ "${NODE_BIN:-}" ]; then
  exec "$NODE_BIN" "$PATCH_SCRIPT" "$@"
fi

for runtime in \
  /usr/share/code/code \
  /usr/share/code-insiders/code-insiders \
  /opt/visual-studio-code/code \
  /opt/visual-studio-code-insiders/code-insiders \
  /Applications/Visual\ Studio\ Code.app/Contents/MacOS/Electron \
  /Applications/Visual\ Studio\ Code\ -\ Insiders.app/Contents/MacOS/Electron \
  /Applications/Cursor.app/Contents/MacOS/Cursor; do
  if [ -x "$runtime" ]; then
    ELECTRON_RUN_AS_NODE=1 exec "$runtime" "$PATCH_SCRIPT" "$@"
  fi
done

echo "错误：未找到 Node.js 或可用的编辑器运行时。请安装 Node.js 18 或使用 node bin/patch.js。" >&2
exit 1
