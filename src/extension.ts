// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "shortcut-settings" is now active!');

	const disposables: vscode.Disposable[] = [];

	type WriteTarget = 'user' | 'workspace';
	type Mapping = {
		id: string;
		key: string;
		title?: string;
		target?: WriteTarget;
	};

	type CommandArgs = {
		key: string;
		target?: WriteTarget;
		title?: string;
	};

	function toConfigurationTarget(target: WriteTarget | undefined): vscode.ConfigurationTarget {
		if (target === 'workspace') {
			return vscode.ConfigurationTarget.Workspace;
		}
		return vscode.ConfigurationTarget.Global;
	}

	function normalizeTitle(key: string, title?: string): string {
		const trimmed = title?.trim();
		return trimmed && trimmed.length > 0 ? trimmed : key;
	}

	async function getMappings(): Promise<Mapping[]> {
		const cfg = vscode.workspace.getConfiguration('shortcut-settings');
		const mappings = cfg.get<Mapping[]>('mappings', []);
		return Array.isArray(mappings) ? mappings : [];
	}

	async function saveMappings(nextMappings: Mapping[]) {
		const cfg = vscode.workspace.getConfiguration('shortcut-settings');
		// For now we always persist mappings to user settings.
		await cfg.update('mappings', nextMappings, vscode.ConfigurationTarget.Global);
	}

	type BooleanSettingMeta = {
		key: string;
		title?: string;
		description?: string;
		defaultValue?: boolean;
	};

	function isPlainObject(value: unknown): value is Record<string, unknown> {
		return typeof value === 'object' && value !== null && !Array.isArray(value);
	}

	function extractBooleanSettingsFromConfigurationNode(node: unknown): BooleanSettingMeta[] {
		if (!isPlainObject(node)) {
			return [];
		}

		const properties = (node as Record<string, unknown>).properties;
		if (!isPlainObject(properties)) {
			return [];
		}

		const result: BooleanSettingMeta[] = [];
		for (const [key, schema] of Object.entries(properties)) {
			if (!isPlainObject(schema)) {
				continue;
			}

			const schemaObj = schema as Record<string, unknown>;
			const type = schemaObj.type;
			const isBooleanType = type === 'boolean' || (Array.isArray(type) && type.includes('boolean'));
			if (!isBooleanType) {
				continue;
			}

			result.push({
				key,
				title: typeof schemaObj.title === 'string' ? schemaObj.title : undefined,
				description: typeof schemaObj.description === 'string' ? schemaObj.description : undefined,
				defaultValue: typeof schemaObj.default === 'boolean' ? schemaObj.default : undefined,
			});
		}

		return result;
	}

	function getAllBooleanSettingsMetaFromAllExtensions(): BooleanSettingMeta[] {
		const result: BooleanSettingMeta[] = [];
		for (const ext of vscode.extensions.all) {
			const pkg = ext.packageJSON as unknown;
			if (!isPlainObject(pkg)) {
				continue;
			}
			const contributes = (pkg as Record<string, unknown>).contributes;
			if (!isPlainObject(contributes)) {
				continue;
			}

			const configuration = (contributes as Record<string, unknown>).configuration;
			if (Array.isArray(configuration)) {
				for (const c of configuration) {
					result.push(...extractBooleanSettingsFromConfigurationNode(c));
				}
			} else {
				result.push(...extractBooleanSettingsFromConfigurationNode(configuration));
			}
		}
		return result;
	}

	function deriveIdFromKey(key: string): string {
		const parts = key.split(/[^a-zA-Z0-9]+/).filter(Boolean);
		if (parts.length === 0) {
			return key;
		}
		const [first, ...rest] = parts;
		return (
			first.toLowerCase() +
			rest.map((p) => (p.length > 0 ? p[0].toUpperCase() + p.slice(1) : '')).join('')
		);
	}

	async function addMappingForSetting(setting: BooleanSettingMeta) {
		const existing = await getMappings();
		if (existing.some((m) => m.key === setting.key)) {
			void vscode.window.showInformationMessage(`Shortcut Settings: mapping for "${setting.key}" already exists`);
			return;
		}

		const next: Mapping = {
			id: deriveIdFromKey(setting.key),
			key: setting.key,
			title: setting.title,
			target: 'user',
		};

		await saveMappings([...existing, next]);
		void vscode.window.setStatusBarMessage(`Shortcut Settings: added mapping for ${setting.key}`, 2000);
	}

	async function copyKeybindingSnippetForSetting(setting: BooleanSettingMeta) {
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

	async function updateBooleanSetting(args: CommandArgs, mode: 'toggle' | 'setTrue' | 'setFalse') {
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

	disposables.push(
		vscode.commands.registerCommand('shortcut-settings.toggle', async (args: CommandArgs) => {
			await updateBooleanSetting(args, 'toggle');
		})
	);

	disposables.push(
		vscode.commands.registerCommand('shortcut-settings.setTrue', async (args: CommandArgs) => {
			await updateBooleanSetting(args, 'setTrue');
		})
	);

	disposables.push(
		vscode.commands.registerCommand('shortcut-settings.setFalse', async (args: CommandArgs) => {
			await updateBooleanSetting(args, 'setFalse');
		})
	);

	disposables.push(
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

	disposables.push(
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

	disposables.push(
		vscode.commands.registerCommand('shortcut-settings.pickBooleanSetting', async () => {
			const allSettings = getAllBooleanSettingsMetaFromAllExtensions();
			const uniq = new Map<string, BooleanSettingMeta>();
			for (const s of allSettings) {
				if (!uniq.has(s.key)) {
					uniq.set(s.key, s);
				}
			}
			const items = Array.from(uniq.values()).map((s) => ({
				label: s.title ? s.title : s.key,
				description: s.key,
				detail: s.description,
				setting: s,
			}));

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
				await addMappingForSetting(picked.setting);
			} else {
				await copyKeybindingSnippetForSetting(picked.setting);
			}
		})
	);

	context.subscriptions.push(...disposables);
}

// This method is called when your extension is deactivated
export function deactivate() {}
