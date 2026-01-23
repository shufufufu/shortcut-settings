import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { DEFAULT_KEYBINDINGS } from '../constants/defaultKeybindings';

export interface ConflictInfo {
	hasConflict: boolean;
	command?: string;
	when?: string;
	source?: 'user' | 'default';
}

// Normalize keybinding format for comparison
// VSCode uses: cmd+shift+key (macOS) or ctrl+shift+key (Windows/Linux)
// But users might input: shift+cmd+key
function normalizeKeybinding(keybinding: string): string {
	const parts = keybinding.toLowerCase().split('+');
	const modifiers: string[] = [];
	let mainKey = '';
	
	// Separate modifiers and main key
	for (const part of parts) {
		const trimmed = part.trim();
		if (['ctrl', 'control', 'shift', 'alt', 'option', 'cmd', 'command', 'meta'].includes(trimmed)) {
			// Normalize modifier names
			if (trimmed === 'control') {
				modifiers.push('ctrl');
			} else if (trimmed === 'option') {
				modifiers.push('alt');
			} else if (trimmed === 'command' || trimmed === 'meta') {
				modifiers.push('cmd');
			} else {
				modifiers.push(trimmed);
			}
		} else {
			mainKey = trimmed;
		}
	}
	
	// Remove duplicates and sort modifiers in standard order
	const uniqueModifiers = Array.from(new Set(modifiers));
	const sortedModifiers: string[] = [];
	
	// Standard order for macOS: cmd -> shift -> alt -> ctrl
	// Standard order for Windows/Linux: ctrl -> shift -> alt
	if (uniqueModifiers.includes('cmd')) sortedModifiers.push('cmd');
	if (uniqueModifiers.includes('ctrl')) sortedModifiers.push('ctrl');
	if (uniqueModifiers.includes('shift')) sortedModifiers.push('shift');
	if (uniqueModifiers.includes('alt')) sortedModifiers.push('alt');
	
	// Rebuild keybinding string
	if (mainKey) {
		sortedModifiers.push(mainKey);
	}
	
	const normalized = sortedModifiers.join('+');
	console.log('[Shortcut Settings] Normalized:', keybinding, '→', normalized);
	return normalized;
}

// Remove comments from JSONC (JSON with Comments)
function removeJsonComments(jsonString: string): string {
	// Remove single-line comments (// ...)
	let result = jsonString.replace(/\/\/.*$/gm, '');
	
	// Remove multi-line comments (/* ... */)
	result = result.replace(/\/\*[\s\S]*?\*\//g, '');
	
	// Remove trailing commas (also a JSONC feature)
	result = result.replace(/,(\s*[}\]])/g, '$1');
	
	return result;
}

export async function checkKeybindingConflict(keybinding: string): Promise<ConflictInfo> {
	console.log('[Shortcut Settings] Checking conflict for:', keybinding);
	
	// First check default keybindings (blacklist)
	const normalizedInput = normalizeKeybinding(keybinding);
	const defaultCommand = DEFAULT_KEYBINDINGS[normalizedInput];
	
	if (defaultCommand) {
		console.log('[Shortcut Settings] Found default conflict:', defaultCommand);
		return {
			hasConflict: true,
			command: defaultCommand,
			source: 'default',
		};
	}
	
	// Then check user's keybindings.json
	const userConflict = await checkUserKeybindings(keybinding);
	
	console.log('[Shortcut Settings] Conflict check result:', userConflict);
	
	if (userConflict.hasConflict) {
		return userConflict;
	}

	return { hasConflict: false };
}

async function checkUserKeybindings(keybinding: string): Promise<ConflictInfo> {
	try {
		const keybindingsPath = getKeybindingsFilePath();
		
		console.log('[Shortcut Settings] Keybindings path:', keybindingsPath);
		
		if (!keybindingsPath) {
			console.log('[Shortcut Settings] No keybindings path found');
			return { hasConflict: false };
		}
		
		if (!fs.existsSync(keybindingsPath)) {
			console.log('[Shortcut Settings] Keybindings file does not exist, creating empty file');
			// Create empty keybindings.json if it doesn't exist
			try {
				const dir = path.dirname(keybindingsPath);
				if (!fs.existsSync(dir)) {
					fs.mkdirSync(dir, { recursive: true });
				}
				fs.writeFileSync(keybindingsPath, '[]', 'utf8');
			} catch (error) {
				console.error('[Shortcut Settings] Failed to create keybindings.json:', error);
			}
			return { hasConflict: false };
		}

		const content = fs.readFileSync(keybindingsPath, 'utf8');
		const trimmed = content.trim();
		
		console.log('[Shortcut Settings] Keybindings content length:', content.length);
		
		if (!trimmed) {
			console.log('[Shortcut Settings] Keybindings file is empty');
			return { hasConflict: false };
		}

		try {
			// Remove comments before parsing (support JSONC format)
			const cleanJson = removeJsonComments(trimmed);
			console.log('[Shortcut Settings] Clean JSON length:', cleanJson.length);
			
			const keybindings = JSON.parse(cleanJson);
			if (!Array.isArray(keybindings)) {
				console.log('[Shortcut Settings] Keybindings is not an array');
				return { hasConflict: false };
			}

			console.log('[Shortcut Settings] Checking', keybindings.length, 'keybindings');

			// Normalize the input keybinding for comparison
			const normalizedInput = normalizeKeybinding(keybinding);

			// Find conflict
			for (const binding of keybindings) {
				if (binding.key) {
					const normalizedBinding = normalizeKeybinding(binding.key);
					if (normalizedBinding === normalizedInput) {
						console.log('[Shortcut Settings] Found conflict:', binding);
						return {
							hasConflict: true,
							command: binding.command || '未知命令',
							when: binding.when,
							source: 'user',
						};
					}
				}
			}
		} catch (parseError) {
			console.error('[Shortcut Settings] Parse error:', parseError);
			return { hasConflict: false };
		}

		return { hasConflict: false };
	} catch (error) {
		console.error('[Shortcut Settings] Error checking keybindings:', error);
		return { hasConflict: false };
	}
}

function getKeybindingsFilePath(): string | undefined {
	try {
		// Use VSCode environment to detect the correct product name
		const appRoot = vscode.env.appRoot;
		console.log('[Shortcut Settings] App root:', appRoot);
		
		// Extract product name from app root
		// Example: /Applications/Kwaipilot.app/Contents/Resources/app
		// Example: /Applications/Visual Studio Code.app/Contents/Resources/app
		let productName = 'Code'; // default
		
		if (appRoot.includes('Kwaipilot.app')) {
			productName = 'Kwaipilot';
		} else if (appRoot.includes('Cursor.app')) {
			productName = 'Cursor';
		} else if (appRoot.includes('VSCodium.app')) {
			productName = 'VSCodium';
		} else if (appRoot.includes('Code - Insiders.app')) {
			productName = 'Code - Insiders';
		} else if (appRoot.includes('Visual Studio Code.app') || appRoot.includes('Code.app')) {
			productName = 'Code';
		}
		
		console.log('[Shortcut Settings] Detected product name:', productName);
		
		let configDir: string;
		
		if (process.platform === 'darwin') {
			// macOS
			configDir = path.join(os.homedir(), 'Library', 'Application Support', productName, 'User');
		} else if (process.platform === 'win32') {
			// Windows
			configDir = path.join(process.env.APPDATA || '', productName, 'User');
		} else {
			// Linux
			configDir = path.join(os.homedir(), '.config', productName, 'User');
		}

		const finalPath = path.join(configDir, 'keybindings.json');
		console.log('[Shortcut Settings] Using keybindings path:', finalPath);
		return finalPath;
	} catch (error) {
		console.error('[Shortcut Settings] Error getting keybindings path:', error);
		return undefined;
	}
}

export async function insertKeybindingToFile(
	keybinding: string, 
	command: string, 
	args: Record<string, unknown>,
	mode: 'replace' | 'add' = 'replace'
): Promise<void> {
	console.log('[Shortcut Settings] insertKeybindingToFile called with:', keybinding, command, args, 'mode:', mode);
	
	// Get keybindings.json path
	const keybindingsPath = getKeybindingsFilePath();
	if (!keybindingsPath) {
		throw new Error('无法找到 keybindings.json 文件路径');
	}
	
	console.log('[Shortcut Settings] Keybindings file path:', keybindingsPath);
	
	// Ensure file exists
	if (!fs.existsSync(keybindingsPath)) {
		const dir = path.dirname(keybindingsPath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
		fs.writeFileSync(keybindingsPath, '[]', 'utf8');
		console.log('[Shortcut Settings] Created new keybindings.json file');
	}

	// Read current content
	const content = fs.readFileSync(keybindingsPath, 'utf8');
	const trimmed = content.trim();
	
	let keybindings: any[] = [];
	
	// Try to parse existing content
	if (trimmed) {
		try {
			// Remove comments before parsing
			const cleanJson = removeJsonComments(trimmed);
			keybindings = JSON.parse(cleanJson);
			if (!Array.isArray(keybindings)) {
				keybindings = [];
			}
		} catch (error) {
			console.error('[Shortcut Settings] Parse error:', error);
			keybindings = [];
		}
	}

	console.log('[Shortcut Settings] Current keybindings count:', keybindings.length);

	// Create the keybinding object
	const newKeybinding = {
		key: keybinding,
		command: command,
		args: args,
	};

	if (mode === 'replace') {
		// Find and replace existing keybinding with same command and args
		let foundIndex = -1;
		
		for (let i = 0; i < keybindings.length; i++) {
			const binding = keybindings[i];
			
			// Check if command matches
			if (binding.command === command) {
				// Check if args match (deep comparison)
				const argsMatch = JSON.stringify(binding.args) === JSON.stringify(args);
				
				if (argsMatch) {
					foundIndex = i;
					console.log('[Shortcut Settings] Found existing keybinding at index:', i, 'old key:', binding.key);
					break;
				}
			}
		}
		
		if (foundIndex !== -1) {
			// Replace existing keybinding
			keybindings[foundIndex] = newKeybinding;
			console.log('[Shortcut Settings] Replaced existing keybinding');
		} else {
			// No existing keybinding found, add new one
			keybindings.push(newKeybinding);
			console.log('[Shortcut Settings] No existing keybinding found, added new one');
		}
	} else {
		// Add mode: always add new keybinding
		keybindings.push(newKeybinding);
		console.log('[Shortcut Settings] Added new keybinding (add mode)');
	}

	console.log('[Shortcut Settings] Final keybindings count:', keybindings.length);

	// Format the new content
	const newContent = JSON.stringify(keybindings, null, 2);

	// Write to file
	fs.writeFileSync(keybindingsPath, newContent, 'utf8');
	
	console.log('[Shortcut Settings] File written successfully');

	// Open the file in editor to show the user
	const fileUri = vscode.Uri.file(keybindingsPath);
	const document = await vscode.workspace.openTextDocument(fileUri);
	const editor = await vscode.window.showTextDocument(document);
	
	// Move cursor to the newly added/modified keybinding
	const targetKey = newKeybinding.key;
	const text = document.getText();
	const keyIndex = text.indexOf(`"key": "${targetKey}"`);
	
	if (keyIndex !== -1) {
		const position = document.positionAt(keyIndex);
		editor.selection = new vscode.Selection(position, position);
		editor.revealRange(new vscode.Range(position, position));
	}
	
	console.log('[Shortcut Settings] Editor opened and cursor positioned');
}

export async function copyKeybindingSnippet(keybinding: string, command: string, args: Record<string, unknown>): Promise<void> {
	const snippet = {
		key: keybinding,
		command: command,
		args: args,
	};

	await vscode.env.clipboard.writeText(JSON.stringify(snippet, null, 2));
	void vscode.window.setStatusBarMessage('快捷键配置已复制到剪贴板', 2000);
}

export async function deleteKeybindingFromFile(keybinding: string, command: string, args: Record<string, unknown>): Promise<boolean> {
	console.log('[Shortcut Settings] deleteKeybindingFromFile called with:', keybinding, command, args);
	
	// Get keybindings.json path
	const keybindingsPath = getKeybindingsFilePath();
	if (!keybindingsPath) {
		throw new Error('无法找到 keybindings.json 文件路径');
	}
	
	console.log('[Shortcut Settings] Keybindings file path:', keybindingsPath);
	
	if (!fs.existsSync(keybindingsPath)) {
		console.log('[Shortcut Settings] Keybindings file does not exist');
		return false;
	}

	// Read current content
	const content = fs.readFileSync(keybindingsPath, 'utf8');
	const trimmed = content.trim();
	
	if (!trimmed) {
		console.log('[Shortcut Settings] Keybindings file is empty');
		return false;
	}

	let keybindings: any[] = [];
	
	// Try to parse existing content
	try {
		// Remove comments before parsing
		const cleanJson = removeJsonComments(trimmed);
		keybindings = JSON.parse(cleanJson);
		if (!Array.isArray(keybindings)) {
			keybindings = [];
		}
	} catch (error) {
		console.error('[Shortcut Settings] Parse error:', error);
		throw new Error('无法解析 keybindings.json 文件');
	}

	console.log('[Shortcut Settings] Current keybindings count:', keybindings.length);

	// Find and delete the keybinding
	let foundIndex = -1;
	
	for (let i = 0; i < keybindings.length; i++) {
		const binding = keybindings[i];
		
		// Check if key, command, and args all match
		if (binding.key === keybinding && binding.command === command) {
			// Check if args match (deep comparison)
			const argsMatch = JSON.stringify(binding.args) === JSON.stringify(args);
			
			if (argsMatch) {
				foundIndex = i;
				console.log('[Shortcut Settings] Found keybinding to delete at index:', i);
				break;
			}
		}
	}
	
	if (foundIndex === -1) {
		console.log('[Shortcut Settings] Keybinding not found');
		return false;
	}

	// Remove the keybinding
	keybindings.splice(foundIndex, 1);
	
	console.log('[Shortcut Settings] Keybinding removed, new count:', keybindings.length);

	// Format the new content
	const newContent = JSON.stringify(keybindings, null, 2);

	// Write to file
	fs.writeFileSync(keybindingsPath, newContent, 'utf8');
	
	console.log('[Shortcut Settings] File written successfully');

	// Open the file in editor to show the user
	const fileUri = vscode.Uri.file(keybindingsPath);
	const document = await vscode.workspace.openTextDocument(fileUri);
	await vscode.window.showTextDocument(document);
	
	console.log('[Shortcut Settings] Editor opened');
	
	return true;
}

export async function listAllKeybindings(): Promise<Array<{ key: string; command: string; args: any; when?: string }>> {
	console.log('[Shortcut Settings] listAllKeybindings called');
	
	// Get keybindings.json path
	const keybindingsPath = getKeybindingsFilePath();
	if (!keybindingsPath) {
		return [];
	}
	
	if (!fs.existsSync(keybindingsPath)) {
		console.log('[Shortcut Settings] Keybindings file does not exist');
		return [];
	}

	// Read current content
	const content = fs.readFileSync(keybindingsPath, 'utf8');
	const trimmed = content.trim();
	
	if (!trimmed) {
		return [];
	}

	try {
		// Remove comments before parsing
		const cleanJson = removeJsonComments(trimmed);
		const keybindings = JSON.parse(cleanJson);
		
		if (!Array.isArray(keybindings)) {
			return [];
		}

		console.log('[Shortcut Settings] Found', keybindings.length, 'keybindings');
		return keybindings;
	} catch (error) {
		console.error('[Shortcut Settings] Parse error:', error);
		return [];
	}
}
