import * as vscode from 'vscode';
import { CommandArgs } from '../types';
import { toConfigurationTarget, normalizeTitle } from '../utils/helpers';

export async function updateBooleanSetting(args: CommandArgs, mode: 'toggle' | 'setTrue' | 'setFalse'): Promise<void> {
	if (!args || typeof args.key !== 'string' || args.key.trim().length === 0) {
		void vscode.window.showErrorMessage('shortcut-settings: missing args.key');
		return;
	}

	const key = args.key.trim();
	const title = normalizeTitle(key, args.title);
	const config = vscode.workspace.getConfiguration();
	const currentValue = config.get(key);

	if (typeof currentValue !== 'boolean') {
		void vscode.window.showErrorMessage(
			`shortcut-settings: setting "${key}" is not boolean (current type: ${typeof currentValue})`
		);
		return;
	}

	let nextValue: boolean;
	switch (mode) {
		case 'toggle':
			nextValue = !currentValue;
			break;
		case 'setTrue':
			nextValue = true;
			break;
		case 'setFalse':
			nextValue = false;
			break;
		default:
			return;
	}

	const target = toConfigurationTarget(args.target);
	await config.update(key, nextValue, target);

	void vscode.window.setStatusBarMessage(`${title}: ${nextValue ? 'ON' : 'OFF'}`, 2000);
}
