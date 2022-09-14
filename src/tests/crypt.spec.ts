import bcrypt from 'bcryptjs'

describe('hash is matching', () => {
	const plaintext = 'hello, bcrypt!'
	let hashed = null

	it('hash given password', async () => {
		const salt = await bcrypt.genSalt(10)
		const hash = await bcrypt.hash(plaintext, salt)

		expect(hash).toMatch(/^\$2a\$10\$/)

		hashed = hash
	})

	it('compare hash with given string', async () => {
		const res = await bcrypt.compare(plaintext, hashed)
		expect(res).toBe(true)

		const res2 = await bcrypt.compare(
			"wait, I'm Invalid password!",
			hashed,
		)
		expect(res2).toBe(false)
	})
})
