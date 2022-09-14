import jwt from 'jsonwebtoken'

describe('check JWT token', () => {
	const JWT_SECRET = '1234'
	let token = null

	it('sign JWT token', () => {
		const tok = jwt.sign(
			{
				hello: 'world',
			},
			JWT_SECRET,
		)

		expect(tok).toMatch(/^[\w-]*\.[\w-]*\.[\w-]*$/)

		token = tok
	})

	it('verify JWT token', () => {
		const result = jwt.verify(token, JWT_SECRET)

		expect(result).toHaveProperty('hello', 'world')
		expect(result).toHaveProperty('iat')
	})

	it('must throw error when invalid has been given', () => {
		try {
			jwt.verify('hello world!', JWT_SECRET)
		} catch (e) {
			expect(e).toBeInstanceOf(jwt.JsonWebTokenError)
		}
	})

	it('must throw error when different key has been used to verify', () => {
		try {
			jwt.verify(token, 'qwerty')
		} catch (e) {
			expect(e).toBeInstanceOf(jwt.JsonWebTokenError)
		}
	})
})
