import * as vscode from 'vscode';
import { Mapping } from '../types';
import { getMappings, updateMapping, removeMapping, removeMappings } from '../services/mappingStore';
import { updateBooleanSetting } from '../services/settingToggler';
import { normalizeTitle } from '../utils/helpers';

export function registerListMappingsCommand(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.commands.registerCommand('shortcut-settings.listMappings', async () => {
			const mappings = await getMappings();
			if (mappings.length === 0) {
				void vscode.window.showInformationMessage('Shortcut Settings: no mappings found. Use "Pick Boolean Setting" to add one.');
				return;
			}

			const config = vscode.workspace.getConfiguration();
			const items = mappings.map((m) => {
				const currentValue = config.get(m.key);
				const valueText = typeof currentValue === 'boolean' ? (currentValue ? 'ON' : 'OFF') : 'N/A';
				return {
					label: `${normalizeTitle(m.key, m.title)}`,
					description: m.key,
					detail: `[${valueText}] target: ${m.target ?? 'user'}`,
					mapping: m,
				};
			});

			const picked = await vscode.window.showQuickPick(items, {
				title: 'Shortcut Settings: Manage Mappings',
				matchOnDescription: true,
			});

			if (!picked) {
				return;
			}

			const action = await vscode.window.showQuickPick(
				[
					{ label: '$(debug-start) Toggle', action: 'toggle' as const },
					{ label: '$(edit) Edit', action: 'edit' as const },
					{ label: '$(copy) Copy Keybinding Snippet', action: 'copy' as const },
					{ label: '$(trash) Remove', action: 'remove' as const },
				],
				{ title: `${picked.mapping.key}` }
			);

			if (!action) {
				return;
			}

			switch (action.action) {
				case 'toggle':
					await updateBooleanSetting(
						{ key: picked.mapping.key, title: picked.mapping.title, target: picked.mapping.target },
						'toggle'
					);
					break;
				case 'edit':
					await vscode.commands.executeCommand('shortcut-settings.editMapping', picked.mapping);
					break;
				case 'copy': {
					const snippet = {
						command: 'shortcut-settings.toggle',
						args: {
							key: picked.mapping.key,
							target: picked.mapping.target ?? 'user',
							title: picked.mapping.title,
						},
					};
					await vscode.env.clipboard.writeText(JSON.stringify(snippet, null, 2));
					void vscode.window.setStatusBarMessage('Shortcut Settings: keybinding snippet copied to clipboard', 2000);
					break;
				}
				case 'remove':
					await vscode.commands.executeCommand('shortcut-settings.removeMapping', picked.mapping);
					break;
			}
		})
	);
}

export function registerAddMappingCommand(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.commands.registerCommand('shortcut-settings.addMapping', async () => {
			// Reuse Pick Boolean Setting flow
			await vscode.commands.executeCommand('shortcut-settings.pickBooleanSetting');
		})
	);
}

export function registerEditMappingCommand(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.commands.registerCommand('shortcut-settings.editMapping', async (mappingArg?: Mapping) => {
			let mappingToEdit: Mapping | undefined = mappingArg;

			if (!mappingToEdit) {
				const mappings = await getMappings();
				if (mappings.length === 0) {
					void vscode.window.showInformationMessage('Shortcut Settings: no mappings to edit');
					return;
				}

				const picked = await vscode.window.showQuickPick(
					mappings.map((m) => ({
						label: normalizeTitle(m.key, m.title),
						description: m.key,
						detail: `target: ${m.target ?? 'user'}`,
						mapping: m,
					})),
					{ title: 'Shortcut Settings: Pick a mapping to edit' }
				);

				if (!picked) {
					return;
				}
				mappingToEdit = picked.mapping;
			}

			const newTitle = await vscode.window.showInputBox({
				title: 'Edit Mapping: Title',
				prompt: 'Enter a new title (or leave empty to use key as title)',
				value: mappingToEdit.title ?? '',
			});

			if (newTitle === undefined) {
				return; // user cancelled
			}

			const newTargetPicked = await vscode.window.showQuickPick(
				[
					{ label: 'User', description: 'Write to user settings', target: 'user' as const },
					{ label: 'Workspace', description: 'Write to workspace settings', target: 'workspace' as const },
				],
				{ title: 'Edit Mapping: Target' }
			);

			if (!newTargetPicked) {
				return;
			}

			try {
				await updateMapping(mappingToEdit.id, {
					title: newTitle.trim().length > 0 ? newTitle.trim() : undefined,
					target: newTargetPicked.target,
				});
				void vscode.window.setStatusBarMessage(`Shortcut Settings: mapping "${mappingToEdit.key}" updated`, 2000);
			} catch (error) {
				void vscode.window.showErrorMessage(`Shortcut Settings: ${error instanceof Error ? error.message : String(error)}`);
			}
		})
	);
}

export function registerRemoveMappingCommand(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.commands.registerCommand('shortcut-settings.removeMapping', async (mappingArg?: Mapping) => {
			let mappingToRemove: Mapping | undefined = mappingArg;

			if (!mappingToRemove) {
				const mappings = await getMappings();
				if (mappings.length === 0) {
					void vscode.window.showInformationMessage('Shortcut Settings: no mappings to remove');
					return;
				}

				const picked = await vscode.window.showQuickPick(
					mappings.map((m) => ({
						label: normalizeTitle(m.key, m.title),
						description: m.key,
						detail: `target: ${m.target ?? 'user'}`,
						mapping: m,
					})),
					{ title: 'Shortcut Settings: Pick a mapping to remove', canPickMany: true }
				);

				if (!picked || picked.length === 0) {
					return;
				}

				const toRemove = picked.map((p) => p.mapping);
				const confirm = await vscode.window.showWarningMessage(
					`Remove ${toRemove.length} mapping(s)?`,
					{ modal: true },
					'Remove'
				);

				if (confirm !== 'Remove') {
					return;
				}

				await removeMappings(toRemove.map((m) => m.id));
				void vscode.window.setStatusBarMessage(`Shortcut Settings: removed ${toRemove.length} mapping(s)`, 2000);
				return;
			}

			// Single mapping removal (called from listMappings)
			const confirm = await vscode.window.showWarningMessage(
				`Remove mapping for "${mappingToRemove.key}"?`,
				{ modal: true },
				'Remove'
			);

			if (confirm !== 'Remove') {
				return;
			}

			await removeMapping(mappingToRemove.id);
			void vscode.window.setStatusBarMessage(`Shortcut Settings: removed mapping for "${mappingToRemove.key}"`, 2000);
		})
	);
}
