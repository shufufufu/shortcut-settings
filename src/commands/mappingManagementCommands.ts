import * as vscode from 'vscode';
import { Mapping } from '../types';
import { getMappings, updateMapping, removeMapping, removeMappings } from '../services/mappingStore';
import { updateBooleanSetting } from '../services/settingToggler';
import { normalizeTitle } from '../utils/helpers';
import { showKeybindingRecorder } from '../ui/keybindingRecorder';
import { insertKeybindingToFile, copyKeybindingSnippet, deleteKeybindingFromFile, listAllKeybindings } from '../services/keybindingWriter';

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
			}				const action = await vscode.window.showQuickPick(
					[
						{ label: '$(debug-start) Toggle', action: 'toggle' as const },
						{ label: '$(keyboard) Bind Key', action: 'bind' as const },
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
				case 'bind':
					await vscode.commands.executeCommand('shortcut-settings.bindKeyToMapping', picked.mapping);
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
			}		await removeMapping(mappingToRemove.id);
		void vscode.window.setStatusBarMessage(`Shortcut Settings: removed mapping for "${mappingToRemove.key}"`, 2000);
	})
);
}

export function registerBindKeyToMappingCommand(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.commands.registerCommand('shortcut-settings.bindKeyToMapping', async (mappingArg?: Mapping) => {
			let mappingToBind: Mapping | undefined = mappingArg;

			if (!mappingToBind) {
				const mappings = await getMappings();
				if (mappings.length === 0) {
					void vscode.window.showInformationMessage('Shortcut Settings: no mappings to bind');
					return;
				}

				const picked = await vscode.window.showQuickPick(
					mappings.map((m) => ({
						label: normalizeTitle(m.key, m.title),
						description: m.key,
						detail: `target: ${m.target ?? 'user'}`,
						mapping: m,
					})),
					{ title: 'Shortcut Settings: Pick a mapping to bind a keybinding' }
				);

				if (!picked) {
					return;
				}
				mappingToBind = picked.mapping;
			}

			// Show keybinding recorder
			const result = await showKeybindingRecorder();

			console.log('[Shortcut Settings] Recorder returned:', result);

			if (!result || result.cancelled) {
				console.log('[Shortcut Settings] User cancelled or no result');
				return;
			}

			const args = {
				key: mappingToBind.key,
				target: mappingToBind.target ?? 'user',
				title: mappingToBind.title,
			};

			console.log('[Shortcut Settings] About to insert keybinding:', result.keybinding, 'mode:', result.mode);

			// Directly insert to keybindings.json
			try {
				await insertKeybindingToFile(
					result.keybinding, 
					'shortcut-settings.toggle', 
					args,
					result.mode || 'replace'
				);
				const modeText = result.mode === 'add' ? '添加' : '覆盖';
				void vscode.window.showInformationMessage(
					`快捷键 "${result.keybinding}" 已${modeText}到 keybindings.json`
				);
				console.log('[Shortcut Settings] Success message shown');
			} catch (error) {
				console.error('[Shortcut Settings] Error inserting keybinding:', error);
				void vscode.window.showErrorMessage(
					`添加快捷键失败: ${error instanceof Error ? error.message : String(error)}`
				);
			}
		})
	);
}

export function registerDeleteKeybindingCommand(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.commands.registerCommand('shortcut-settings.deleteKeybinding', async () => {
			// Get all keybindings from keybindings.json
			const keybindings = await listAllKeybindings();
			
			if (keybindings.length === 0) {
				void vscode.window.showInformationMessage('keybindings.json 中没有找到快捷键配置');
				return;
			}

			// Filter only shortcut-settings.toggle commands
			const ourKeybindings = keybindings.filter(kb => kb.command === 'shortcut-settings.toggle');
			
			if (ourKeybindings.length === 0) {
				void vscode.window.showInformationMessage('keybindings.json 中没有找到 Shortcut Settings 的快捷键配置');
				return;
			}

			// Create QuickPick items
			const items = ourKeybindings.map(kb => {
				const title = kb.args?.title || kb.args?.key || '未知';
				const key = kb.key;
				const target = kb.args?.target || 'user';
				
				return {
					label: `$(keyboard) ${key}`,
					description: kb.args?.key || '',
					detail: `${title} (target: ${target})`,
					keybinding: kb,
				};
			});

			const picked = await vscode.window.showQuickPick(items, {
				title: 'Shortcut Settings: 选择要删除的快捷键',
				matchOnDescription: true,
				matchOnDetail: true,
				canPickMany: true,
			});

			if (!picked || picked.length === 0) {
				return;
			}

			// Confirm deletion
			const confirm = await vscode.window.showWarningMessage(
				`确定要删除 ${picked.length} 个快捷键配置吗？`,
				{ modal: true },
				'删除'
			);

			if (confirm !== '删除') {
				return;
			}

			// Delete keybindings
			let successCount = 0;
			let failCount = 0;

			for (const item of picked) {
				const kb = item.keybinding;
				try {
					const deleted = await deleteKeybindingFromFile(kb.key, kb.command, kb.args || {});
					if (deleted) {
						successCount++;
					} else {
						failCount++;
					}
				} catch (error) {
					console.error('[Shortcut Settings] Error deleting keybinding:', error);
					failCount++;
				}
			}

			if (successCount > 0) {
				void vscode.window.showInformationMessage(
					`成功删除 ${successCount} 个快捷键配置${failCount > 0 ? `，失败 ${failCount} 个` : ''}`
				);
			} else {
				void vscode.window.showErrorMessage('删除快捷键失败');
			}
		})
	);
}
