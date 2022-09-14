import mapRecurse, { dateMapper } from '../utils/mapRecurse'

describe('df', () => {
	it('dddd', () => {
		const data = {
			a: 14,
			createdAt: new Date(),
			abc: [
				{
					d: [
						{
							updatedAt: new Date(),
						},
					],
				},
			],
		}

		const res = dateMapper(data)

		// @ts-ignore
		expect(typeof res.createdAt).toBe('number')
		// @ts-ignore
		expect(typeof res.abc[0].d[0].updatedAt).toBe(
			'number',
		)
		console.log(res)
		console.log(JSON.stringify(res, null, 4))
	})
})
