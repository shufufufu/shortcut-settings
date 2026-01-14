import * as vscode from 'vscode';
import { BooleanSettingMeta } from '../types';
import { isPlainObject } from '../utils/helpers';

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

export function getAllBooleanSettingsMetaFromAllExtensions(): BooleanSettingMeta[] {
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
