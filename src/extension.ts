// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { registerToggleCommand, registerSetTrueCommand, registerSetFalseCommand } from './commands/toggleCommands';
import { registerPickAndToggleCommand, registerCopyKeybindingSnippetCommand } from './commands/quickPickCommands';
import { registerPickBooleanSettingCommand } from './commands/pickBooleanSettingCommand';
import {
	registerListMappingsCommand,
	registerAddMappingCommand,
	registerEditMappingCommand,
	registerRemoveMappingCommand,
	registerBindKeyToMappingCommand,
	registerDeleteKeybindingCommand,
} from './commands/mappingManagementCommands';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "shortcut-settings" is now active!');

	// Register all commands
	registerToggleCommand(context);
	registerSetTrueCommand(context);
	registerSetFalseCommand(context);
	registerPickAndToggleCommand(context);
	registerCopyKeybindingSnippetCommand(context);
	registerPickBooleanSettingCommand(context);
	registerListMappingsCommand(context);
	registerAddMappingCommand(context);
	registerEditMappingCommand(context);
	registerRemoveMappingCommand(context);
	registerBindKeyToMappingCommand(context);
	registerDeleteKeybindingCommand(context);
}

// This method is called when your extension is deactivated
export function deactivate() {}
