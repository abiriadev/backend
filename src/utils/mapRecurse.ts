// type MapRecurse<T,K extends PropertyKey,MapperOutput> = {
// 	[K in keyof Keys]: MapperOutput,
// 	[K2 in keyof T]: T[K2]
// }
//
// {
// 	[K1 in keyof K]: MapperOutput,
// } & {
// 	[K2 in keyof T]: T[K2]
// }

// type MapRecurse<T, K extends PropertyKey, MapperOutput> = T extends object
//     ? MapPartial<MapRecurse<T, K, MapperOutput>, K, MapperOutput>
//     : T
//
// type MapPartial<T, K, MapperOutput> = {
//     [KK in keyof T]: T[KK]
// } & {
//     K: MapperOutput
// }

export default function mapRecurse<
    T extends object,
    K extends PropertyKey,
    MapperInput,
    MapperOutput,
>(
    data: T,
    keys: Array<K>,
    mapper: (inp: MapperInput) => MapperOutput,
): unknown {
    for (const k in data) {
        // @ts-ignore
        if (keys.includes(k)) {
            // @ts-ignore
            data[k] = mapper(data[k])
        }

        if (typeof data[k] === 'object') {
            // @ts-ignore
            data[k] = mapRecurse(data[k], keys, mapper)
        }
    }

    return data
}

export const dateMapper = (data: object) =>
    mapRecurse(data, ['createdAt', 'updatedAt'], (d: Date): number =>
        d.getTime(),
    )
