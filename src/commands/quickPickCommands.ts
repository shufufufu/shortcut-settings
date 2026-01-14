import * as vscode from 'vscode';
import { getMappings } from '../services/mappingStore';
import { updateBooleanSetting } from '../services/settingToggler';
import { normalizeTitle } from '../utils/helpers';

export function registerPickAndToggleCommand(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.commands.registerCommand('shortcut-settings.pickAndToggle', async () => {
			const mappings = await getMappings();
			if (mappings.length === 0) {
				void vscode.window.showInformationMessage('shortcut-settings: no mappings found in shortcut-settings.mappings');
				return;
			}

			const picked = await vscode.window.showQuickPick(
				mappings.map((m) => ({
					label: normalizeTitle(m.key, m.title),
					description: m.key,
					detail: `target: ${m.target ?? 'user'}`,
					mapping: m,
				})),
				{ title: 'Shortcut Settings: Pick a setting to toggle' }
			);

			if (!picked) {
				return;
			}

			await updateBooleanSetting(
				{ key: picked.mapping.key, title: picked.mapping.title, target: picked.mapping.target ?? 'user' },
				'toggle'
			);
		})
	);
}

export function registerCopyKeybindingSnippetCommand(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.commands.registerCommand('shortcut-settings.copyKeybindingSnippet', async () => {
			const mappings = await getMappings();
			if (mappings.length === 0) {
				void vscode.window.showInformationMessage('shortcut-settings: no mappings found in shortcut-settings.mappings');
				return;
			}

			const picked = await vscode.window.showQuickPick(
				mappings.map((m) => ({
					label: normalizeTitle(m.key, m.title),
					description: m.key,
					detail: `target: ${m.target ?? 'user'}`,
					mapping: m,
				})),
				{ title: 'Shortcut Settings: Pick a mapping to copy keybinding snippet' }
			);

			if (!picked) {
				return;
			}

			const snippet = {
				command: 'shortcut-settings.toggle',
				args: {
					key: picked.mapping.key,
					target: picked.mapping.target ?? 'user',
					title: picked.mapping.title,
				},
				// key: 'ctrl+alt+t' // fill your own
			};

			await vscode.env.clipboard.writeText(JSON.stringify(snippet, null, 2));
			void vscode.window.setStatusBarMessage('Shortcut Settings: keybinding snippet copied to clipboard', 2000);
		})
	);
}
