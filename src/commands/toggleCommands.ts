import * as vscode from 'vscode';
import { CommandArgs } from '../types';
import { updateBooleanSetting } from '../services/settingToggler';

export function registerToggleCommand(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.commands.registerCommand('shortcut-settings.toggle', async (args: CommandArgs) => {
			await updateBooleanSetting(args, 'toggle');
		})
	);
}

export function registerSetTrueCommand(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.commands.registerCommand('shortcut-settings.setTrue', async (args: CommandArgs) => {
			await updateBooleanSetting(args, 'setTrue');
		})
	);
}

export function registerSetFalseCommand(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.commands.registerCommand('shortcut-settings.setFalse', async (args: CommandArgs) => {
			await updateBooleanSetting(args, 'setFalse');
		})
	);
}
