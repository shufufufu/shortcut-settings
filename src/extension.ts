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

	context.subscriptions.push(...disposables);
}

// This method is called when your extension is deactivated
export function deactivate() {}
