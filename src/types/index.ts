export type WriteTarget = 'user' | 'workspace';

export type Mapping = {
	id: string;
	key: string;
	title?: string;
	target?: WriteTarget;
};

export type CommandArgs = {
	key: string;
	target?: WriteTarget;
	title?: string;
};

export type BooleanSettingMeta = {
	key: string;
	title?: string;
	description?: string;
	defaultValue?: boolean;
};
