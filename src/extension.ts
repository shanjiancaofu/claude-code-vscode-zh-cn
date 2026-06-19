import * as vscode from "vscode";
import { registerCommands } from "./vscode/commands";
import { disposeOutput } from "./vscode/output";

export function activate(context: vscode.ExtensionContext): void {
  registerCommands(context);
}

export function deactivate(): void {
  disposeOutput();
}
