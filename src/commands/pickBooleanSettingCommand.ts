import * as vscode from 'vscode';
import { BooleanSettingMeta, WriteTarget } from '../types';
import { getAllBooleanSettingsMetaFromAllExtensions } from '../services/settingsMetadata';
import { addMapping } from '../services/mappingStore';
import { deriveIdFromKey } from '../utils/helpers';

async function addMappingForSetting(setting: BooleanSettingMeta, target: WriteTarget): Promise<void> {
	try {
		await addMapping({
			id: deriveIdFromKey(setting.key),
			key: setting.key,
			title: setting.title,
			target,
		});
		void vscode.window.setStatusBarMessage(`Shortcut Settings: added mapping for ${setting.key}`, 2000);
	} catch (error) {
		void vscode.window.showInformationMessage(`Shortcut Settings: ${error instanceof Error ? error.message : String(error)}`);
	}
}

async function copyKeybindingSnippetForSetting(setting: BooleanSettingMeta): Promise<void> {
	const snippet = {
		command: 'shortcut-settings.toggle',
		args: {
			key: setting.key,
			target: 'user',
			title: setting.title,
		},
		// key: 'ctrl+alt+t' // fill your own
	};

	await vscode.env.clipboard.writeText(JSON.stringify(snippet, null, 2));
	void vscode.window.setStatusBarMessage('Shortcut Settings: keybinding snippet copied to clipboard', 2000);
}

export function registerPickBooleanSettingCommand(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.commands.registerCommand('shortcut-settings.pickBooleanSetting', async () => {
			const allSettings = getAllBooleanSettingsMetaFromAllExtensions();
			const uniq = new Map<string, BooleanSettingMeta>();
			for (const s of allSettings) {
				if (!uniq.has(s.key)) {
					uniq.set(s.key, s);
				}
			}

			const config = vscode.workspace.getConfiguration();
			const items = Array.from(uniq.values()).map((s) => {
				const currentValue = config.get(s.key);
				const valueText = typeof currentValue === 'boolean' ? (currentValue ? 'ON' : 'OFF') : 'N/A';
				return {
					label: s.title ? s.title : s.key,
					description: s.key,
					detail: `[${valueText}] ${s.description ?? ''}`.trim(),
					setting: s,
				};
			});

			const picked = await vscode.window.showQuickPick(items, {
				title: 'Shortcut Settings: Pick a boolean setting',
				matchOnDescription: true,
				matchOnDetail: true,
			});

			if (!picked) {
				return;
			}

			const action = await vscode.window.showQuickPick(
				[
					{ label: 'Add to mappings', action: 'add' as const },
					{ label: 'Copy keybinding snippet', action: 'copy' as const },
				],
				{ title: `Shortcut Settings: ${picked.setting.key}` }
			);

			if (!action) {
				return;
			}

			if (action.action === 'add') {
				const targetPicked = await vscode.window.showQuickPick(
					[
						{ label: 'User', description: 'Write to user settings', target: 'user' as const },
						{ label: 'Workspace', description: 'Write to workspace settings', target: 'workspace' as const },
					],
					{ title: 'Shortcut Settings: Choose target for this mapping' }
				);
				if (!targetPicked) {
					return;
				}
				await addMappingForSetting(picked.setting, targetPicked.target);
			} else {
				await copyKeybindingSnippetForSetting(picked.setting);
			}
		})
	);
}
