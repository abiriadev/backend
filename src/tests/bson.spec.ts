import { ObjectId } from 'bson'

describe('ObjectId validation test', () => {
	it('must throw error when invalid ObjectId is given', () => {
		expect(ObjectId.isValid('dafayayfiuayu')).toBe(
			false,
		)
	})

	it('must pass correct ObjectId', () => {
		expect(ObjectId.isValid(ObjectId.generate())).toBe(
			true,
		)
	})
})
