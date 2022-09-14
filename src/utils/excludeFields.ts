type OmitRecursive<
	T,
	K extends PropertyKey,
> = T extends object ? Omit<OmitRecursive<T, K>, K> : T

export default function excludeFields<
	T extends object,
	K extends PropertyKey,
>(data: T, ...keys: Array<K>): object {
	return Object.fromEntries(
		Object.entries(data)
			.map(([, v]) =>
				typeof v === 'object'
					? excludeFields(v, ...keys)
					: v,
			)
			.filter(([k]) => keys.includes(k)),
	)
}
