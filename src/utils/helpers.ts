import * as vscode from 'vscode';

export function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function normalizeTitle(key: string, title?: string): string {
	const trimmed = title?.trim();
	return trimmed && trimmed.length > 0 ? trimmed : key;
}

export function deriveIdFromKey(key: string): string {
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

export function toConfigurationTarget(target: 'user' | 'workspace' | undefined): vscode.ConfigurationTarget {
	if (target === 'workspace') {
		return vscode.ConfigurationTarget.Workspace;
	}
	return vscode.ConfigurationTarget.Global;
}
