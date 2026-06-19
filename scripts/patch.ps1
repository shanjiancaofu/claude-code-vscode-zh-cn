$ErrorActionPreference = "Stop"
$PatchScript = Join-Path $PSScriptRoot "../bin/patch.js"

$NodeCommand = Get-Command node -ErrorAction SilentlyContinue
if ($NodeCommand) {
    & $NodeCommand.Source $PatchScript @args
    exit $LASTEXITCODE
}

$ServerRoots = @(
    "$HOME/.vscode-server/bin",
    "$HOME/.vscode-server-insiders/bin",
    "$HOME/.cursor-server/bin",
    "$HOME/.windsurf-server/bin"
)

foreach ($Root in $ServerRoots) {
    if (-not (Test-Path $Root)) { continue }
    $NodeRuntime = Get-ChildItem -Path $Root -Filter node -File -Recurse -ErrorAction SilentlyContinue |
        Select-Object -First 1
    if ($NodeRuntime) {
        & $NodeRuntime.FullName $PatchScript @args
        exit $LASTEXITCODE
    }
}

$EditorRuntimes = @(
    "$env:LOCALAPPDATA\Programs\Microsoft VS Code\Code.exe",
    "$env:LOCALAPPDATA\Programs\Microsoft VS Code Insiders\Code - Insiders.exe",
    "$env:LOCALAPPDATA\Programs\Cursor\Cursor.exe",
    "$env:LOCALAPPDATA\Programs\Windsurf\Windsurf.exe",
    "$env:ProgramFiles\Microsoft VS Code\Code.exe",
    "$env:ProgramFiles\Microsoft VS Code Insiders\Code - Insiders.exe",
    "$env:ProgramFiles\Cursor\Cursor.exe",
    "$env:ProgramFiles\Windsurf\Windsurf.exe"
)

foreach ($Runtime in $EditorRuntimes) {
    if (-not $Runtime -or -not (Test-Path $Runtime)) { continue }
    $env:ELECTRON_RUN_AS_NODE = "1"
    & $Runtime $PatchScript @args
    exit $LASTEXITCODE
}

Write-Error "未找到 Node.js 或可用的编辑器运行时。请安装 Node.js 18 或更高版本。"
