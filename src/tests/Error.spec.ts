import ResponseError from '../class/ResponseError'

describe('middleware error test', () => {
	it('must be created successfully', () => {
		const newError: ResponseError = new ResponseError({
			status: 400,
			message: 'ahdffah',
			action: 'testAction',
		})

		expect(newError.status).toBe(400)
		expect(newError.message).toBe('ahdffah')
		expect(newError.action).toBe('testAction')
	})
})
