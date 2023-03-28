export const serializeJSONWithDate = (data: unknown) => {
	return JSON.stringify(data, function (key, value) {
		if (this[key] instanceof Date) {
			return `remotion-date:${this[key].toISOString()}`;
		}

		return value;
	});
};

export const deserializeJSONWithDate = (data: string) => {
	return JSON.parse(data, (_, value) => {
		if (typeof value === 'string' && value.startsWith('remotion-date:')) {
			return new Date(value.replace('remotion-date:', ''));
		}

		return value;
	});
};
