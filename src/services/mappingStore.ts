import * as vscode from 'vscode';
import { Mapping } from '../types';

export async function getMappings(): Promise<Mapping[]> {
	const cfg = vscode.workspace.getConfiguration('shortcut-settings');
	const mappings = cfg.get<Mapping[]>('mappings', []);
	return Array.isArray(mappings) ? mappings : [];
}

export async function saveMappings(nextMappings: Mapping[]): Promise<void> {
	const cfg = vscode.workspace.getConfiguration('shortcut-settings');
	// For now we always persist mappings to user settings.
	await cfg.update('mappings', nextMappings, vscode.ConfigurationTarget.Global);
}

export async function addMapping(mapping: Mapping): Promise<void> {
	const existing = await getMappings();
	if (existing.some((m) => m.key === mapping.key)) {
		throw new Error(`Mapping for "${mapping.key}" already exists`);
	}
	await saveMappings([...existing, mapping]);
}

export async function updateMapping(id: string, updates: Partial<Omit<Mapping, 'id' | 'key'>>): Promise<void> {
	const mappings = await getMappings();
	const index = mappings.findIndex((m) => m.id === id);
	if (index === -1) {
		throw new Error(`Mapping with id "${id}" not found`);
	}
	mappings[index] = { ...mappings[index], ...updates };
	await saveMappings(mappings);
}

export async function removeMapping(id: string): Promise<void> {
	const mappings = await getMappings();
	const next = mappings.filter((m) => m.id !== id);
	await saveMappings(next);
}

export async function removeMappings(ids: string[]): Promise<void> {
	const mappings = await getMappings();
	const idsToRemove = new Set(ids);
	const next = mappings.filter((m) => !idsToRemove.has(m.id));
	await saveMappings(next);
}
