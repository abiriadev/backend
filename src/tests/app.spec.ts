import supertest from 'supertest'
import app from '../app'
import prisma from '../prisma'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'bson'

const request = supertest(app)

describe('basic router testing', () => {
	it('must return hello message', async () => {
		const res = await request.get('/')

		expect(res.headers['content-type']).toMatch(/json/)
		expect(res.status).toEqual(200)
		expect(res.body.message).toEqual('hello')
	})
})

describe('api test', () => {
	beforeAll(async () => {
		await prisma.$connect()
		console.log('connected')
	})

	describe('join-post story test', () => {
		const newUser = {
			name: 'Abiria',
			password: '1234',
		}

		const newPost = {
			title: 'new title',
			content: 'lorem ipsum dolor sit am',
			category: 'report',
		}

		beforeAll(async () => {
			await prisma.comment.deleteMany()
			await prisma.post.deleteMany()
			await prisma.user.deleteMany()
			console.log('cleaned up database')
		})

		let userId = null
		let token = null

		it('creat user', async () => {
			const res = await request.post('/login').send({
				name: newUser.name,
				password: newUser.password,
			})

			expect(res.status).toEqual(200)
			expect(res.body.user.name).toEqual(newUser.name)
			expect(res.body?.user).not.toHaveProperty(
				'password',
			)

			userId = res.body.user.id
			token = res.body.key
		})

		it('get all users', async () => {
			expect(userId).not.toBeNull()

			const res = await request.get('/users')

			expect(res.body).toHaveLength(1)
			expect(res.body?.[0].name).toBe('Abiria')
			;['id', 'createdAt', 'updatedAt'].map(p =>
				expect(res.body?.[0]).toHaveProperty(p),
			)
			expect(res.body?.[0]).not.toHaveProperty(
				'password',
			)
		})

		it('get specific user', async () => {
			expect(userId).not.toBeNull()

			const res = await request.get(
				`/users/${userId}`,
			)

			expect(res.status).toBe(200)
			expect(res.body.name).toBe('Abiria')
			;['id', 'createdAt', 'updatedAt'].map(p =>
				expect(res.body).toHaveProperty(p),
			)
			expect(res.body).not.toHaveProperty('password')

			expect(res.body.id).toBe(userId)
		})

		let postId = null

		it('create a post', async () => {
			expect(userId).not.toBeNull()

			const res = await request
				.post('/posts')
				.set('Authorization', `Bearer ${token}`)
				.send({
					title: newPost.title,
					content: newPost.content,
					category: newPost.category,
				})

			expect(res.status).toBe(200)
			expect(res.body.title).toBe(newPost.title)
			expect(res.body.content).toBe(newPost.content)
			expect(res.body.category).toBe(newPost.category)
			// expect(res.body.authorId).toBe(userId)
			;['id', 'createdAt', 'updatedAt'].map(p =>
				expect(res.body).toHaveProperty(p),
			)
			expect(res.body.author.name).toBe(newUser.name)
			expect(res.body.author).not.toHaveProperty(
				'password',
			)

			postId = res.body.id
		})

		it('get all posts', async () => {
			const res = await request.get('/posts')

			expect(res.status).toBe(200)
			expect(res.body).toHaveLength(1)
		})

		it('get specific post', async () => {
			expect(userId).not.toBeNull()
			expect(postId).not.toBeNull()

			const res = await request.get(
				`/posts/${postId}`,
			)

			expect(res.status).toBe(200)
			expect(res.body.title).toBe(newPost.title)
			expect(res.body.content).toBe(newPost.content)
			expect(res.body.category).toBe(newPost.category)
			// expect(res.body.authorId).toBe(userId)
			expect(res.body.author).not.toHaveProperty(
				'password',
			)
		})

		it('show recent posts', async () => {
			expect(userId).not.toBeNull()

			const res = await request.get(
				`/users/${userId}`,
			)

			expect(res.status).toBe(200)
			expect(res.body).toHaveProperty('recentPosts')
			expect(res.body?.recentPosts?.[0]?.id).toBe(
				postId,
			)
		})
	})

	describe('login story test', () => {
		const newUser = {
			name: 'Abiria',
			password: '1234',
		}

		beforeAll(async () => {
			await prisma.comment.deleteMany()
			await prisma.post.deleteMany()
			await prisma.user.deleteMany()
			console.log('cleaned up database')
		})

		let userId: null | string = null

		it('create new user', async () => {
			const res = await request.post('/login').send({
				name: newUser.name,
				password: newUser.password,
			})

			expect(res.status).toBe(200)
			expect(res.body.user.name).toBe(newUser.name)
			expect(
				JSON.parse(
					atob(
						// prettier-ignore
						res
							.body
							?.key
							?.match(/^[\w-]+\.([\w-]+)\.[\w-]+$/)
							?.[1],
					),
				)._id,
			).toEqual(res.body.user.id)
			expect(res.body?.user).not.toHaveProperty(
				'password',
			)

			userId = res.body.user.id
		})

		it('login with the user', async () => {
			expect(userId).not.toBeNull()

			const res = await request.post('/login').send({
				name: newUser.name,
				password: newUser.password,
			})

			expect(res.status).toBe(200)
			expect(res.body.user.name).toBe(newUser.name)
			expect(res.body.user.id).toBe(userId)
			expect(res.body?.user).not.toHaveProperty(
				'password',
			)
		})
	})

	describe('error test', () => {
		beforeAll(async () => {
			await prisma.post.deleteMany()
			await prisma.user.deleteMany()
			console.log('cleaned up database')
		})

		const newUser = {
			name: 'cute localhost',
			password: '3773189',
		}

		const newPost = {
			title: 'new turtle',
			content: 'qrqererqreqrsdfghf',
			category: 'qa',
		}

		type Id = string

		const ctx: {
			userId: null | Id
			postId: null | Id
			token: null | Id
			comments: Array<Id>
		} = {
			userId: null,
			postId: null,
			token: null,
			comments: [],
		}

		const fakeId: Id = '53209bb2bfe0ccea91ef5d11'

		it('creat new user', async () => {
			const res = await request.post('/login').send({
				name: newUser.name,
				password: newUser.password,
			})

			expect(res.status).toBe(200)
			expect(res.body).toHaveProperty('key')
			expect(res.body.user).toHaveProperty('id')

			ctx.token = res.body.key
			ctx.userId = res.body.user.id
		})

		it('must throw error when user try to create new account with same name', async () => {
			const res = await request.post('/login').send({
				name: newUser.name,
				password: newUser.password + '%', // password may differ
			})

			expect(res.status).toBe(401)
			expect(res.body.errorName).toBe(
				'PasswordIncorrectOrUserAlreadyExist',
			)
		})

		it('create new post', async () => {
			expect(ctx.userId).not.toBeNull()
			expect(ctx.token).not.toBeNull()

			const res = await request
				.post('/posts')
				.set('Authorization', `Bearer ${ctx.token}`)
				.send(newPost)

			expect(res.status).toBe(200)
			expect(res.body.author.id).toBe(ctx.userId)
			expect(res.body).toHaveProperty('id')

			ctx.postId = res.body.id
		})

		it('throw 401 when invalid token has been given', async () => {
			expect(ctx.userId).not.toBeNull()

			const res = await request
				.post('/posts')
				.set(
					'Authorization',
					`Bearer ${'mY cUsToM tOkEn348'}`,
				)
				.send(newPost)

			expect(res.status).toBe(401)
			expect(res.body.errorName).toBe('TokenInvalid')
		})

		it("must give user's profile", async () => {
			expect(ctx.userId).not.toBeNull()
			expect(ctx.postId).not.toBeNull()

			const res = await request.get(
				`/users/${ctx.userId}`,
			)

			expect(res.status).toBe(200)
			expect(res.body.id).toBe(ctx.userId)
			expect(res.body.recentPosts?.[0]?.id).toBe(
				ctx.postId,
			)
		})

		it('must throw 400 error when request malformed', async () => {
			const res = await request.get(
				`/users/${'34378lol'}`,
			)

			expect(res.status).toBe(400)
			expect(res.body.errorName).toBe(
				'RequestInvalid',
			)
		})

		it('must throw 404 error when there is no such user with given id', async () => {
			const res = await request.get(
				`/users/${fakeId}`,
			)

			expect(res.status).toBe(404)
			expect(res.body.errorName).toBe('UserNotFound')
		})

		it('must give post data with given id', async () => {
			expect(ctx.userId).not.toBeNull()
			expect(ctx.postId).not.toBeNull()

			const res = await request.get(
				`/posts/${ctx.postId}`,
			)

			expect(res.status).toBe(200)
			expect(res.body.id).toBe(ctx.postId)
			expect(res.body.author.id).toBe(ctx.userId)
		})

		it('must throw 404 error when there is no such post with given name', async () => {
			const res = await request.get(
				`/posts/${fakeId}`,
			)

			expect(res.status).toBe(404)
			expect(res.body.errorName).toBe('PostNotFound')
		})

		for (const comment of [
			'first comment!',
			'second comment!',
			'asdf! :D',
		]) {
			it('must add new comment to post', async () => {
				expect(ctx.postId).not.toBeNull()
				expect(ctx.token).not.toBeNull()

				const res = await request
					.post(`/posts/${ctx.postId}/comments`)
					.set(
						'Authorization',
						`Bearer ${ctx.token}`,
					)
					.send({
						content: comment,
					})

				expect(res.status).toBe(200)
				expect(res.body.postId).toBe(ctx.postId)
				// expect(res.body.parentId).toBeNull()

				ctx.comments.push(res.body.id)
			})
		}

		it('must throw 404 error when the post not found with given id', async () => {
			expect(ctx.token).not.toBeNull()

			const res = await request
				.post(`/posts/${fakeId}/comments`)
				.set('Authorization', `Bearer ${ctx.token}`)
				.send({
					content: '1234',
				})

			expect(res.status).toBe(404)
			expect(res.body.errorName).toBe(
				'PostDoesNotExist',
			)
		})

		it('must return comment tree', async () => {
			expect(ctx.postId).not.toBeNull()

			const res = await request.get(
				`/posts/${ctx.postId}`,
			)

			expect(res.status).toBe(200)
			expect(res.body.comments).toHaveLength(3)
		})

		it('must throw error when access to unavailable endpoint', async () => {
			const res = await request.get('/login')

			expect(res.status).toBe(400)
			expect(res.body.errorName).toBe('WrongEndpoint')
		})

		it('must throw error when required parameters are missing', async () => {
			const res = await request.post('/login').send({
				password: newUser.password,
			})

			expect(res.status).toBe(400)
			expect(res.body.errorName).toBe('FieldRequired')
		})

		it('must throw error when required parameters are missing', async () => {
			const res = await request.post('/login').send({
				name: newUser.name,
			})

			expect(res.status).toBe(400)
			expect(res.body.errorName).toBe('FieldRequired')
		})

		it('must throw error when required parameters are missing', async () => {
			expect(ctx.token).not.toBeNull()

			const res = await request
				.post('/posts')
				.set('Authorization', `Bearer ${ctx.token}`)
				.send({
					content: newPost.content,
					category: newPost.category,
				})

			expect(res.status).toBe(400)
			expect(res.body.errorName).toBe('FieldRequired')
		})

		it('must throw error when required parameters are missing', async () => {
			expect(ctx.token).not.toBeNull()

			const res = await request
				.post('/posts')
				.set('Authorization', `Bearer ${ctx.token}`)
				.send({
					title: newPost.title,
					category: newPost.category,
				})

			expect(res.status).toBe(400)
			expect(res.body.errorName).toBe('FieldRequired')
		})

		it('must throw error when required parameters are missing', async () => {
			expect(ctx.token).not.toBeNull()

			const res = await request
				.post('/posts')
				.set('Authorization', `Bearer ${ctx.token}`)
				.send({
					title: newPost.title,
					content: newPost.content,
				})

			expect(res.status).toBe(400)
			expect(res.body.errorName).toBe('FieldRequired')
		})

		it('must throw error when required parameters are missing', async () => {
			expect(ctx.token).not.toBeNull()
			expect(ctx.postId).not.toBeNull()

			const res = await request
				.post(`/posts/${ctx.postId}/comments`)
				.set('Authorization', `Bearer ${ctx.token}`)
				.send({
					// content: 'new comment'
				})

			expect(res.status).toBe(400)
			expect(res.body.errorName).toBe('FieldRequired')
		})

		it('must get information about currently logined user', async () => {
			expect(ctx.token).not.toBeNull()

			const res = await request
				.post('/users/me')
				.set('Authorization', `Bearer ${ctx.token}`)

			expect(res.status).toBe(200)
			expect(res.body.id).toBe(ctx.userId)
		})

		it('must throw error when invalid token has been given', async () => {
			const res = await request
				.post('/users/me')
				.set(
					'Authorization',
					`Bearer ${'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTY2MzIwNTY4OSwiaWF0IjoxNjYzMjA1Njg5fQ.5ZmSpFHyVooOBV8ur_l1Qc-hRtAkpi8YCIT_KFqKQSU'}`,
				)

			expect(res.status).toBe(401)
			expect(res.body.errorName).toBe('TokenInvalid')
		})

		it('must throw error when token does not provided', async () => {
			const res = await request.post('/users/me')

			expect(res.status).toBe(401)
			expect(res.body.errorName).toBe('TokenRequired')
		})

		it('must throw error when token does have required payload', async () => {
			const fakeToken = jwt.sign(
				{},
				process.env.JWT_SECRET,
			)

			const res = await request
				.post('/users/me')
				.set('Authorization', `Bearer ${fakeToken}`)

			expect(res.status).toBe(401)
			expect(res.body.errorName).toBe(
				'TokenDoesNotHaveRequiredPayload',
			)
		})

		it("must throw error when couldn't find user with given id in token", async () => {
			const fakeToken = jwt.sign(
				{
					_id: fakeId,
				},
				process.env.JWT_SECRET,
			)

			const res = await request
				.post('/users/me')
				.set('Authorization', `Bearer ${fakeToken}`)

			expect(res.status).toBe(404)
			expect(res.body.errorName).toBe('MeNotFound')
		})

		it('must throw error when id in token is invalid', async () => {
			const fakeToken = jwt.sign(
				{
					_id: ':) tHIs iS 398734124 MALFORMED iD!#%#@',
				},
				process.env.JWT_SECRET,
			)

			const res = await request
				.post('/users/me')
				.set('Authorization', `Bearer ${fakeToken}`)

			expect(res.status).toBe(401)
			expect(res.body.errorName).toBe(
				'TokenHasInvalidObjectId',
			)
		})

		const newName = 'new name :)'

		it('must change user data', async () => {
			expect(ctx.token).not.toBeNull()
			expect(ctx.userId).not.toBeNull()

			const res = await request
				.put('/users/me')
				.send({
					name: newName,
				})
				.set('Authorization', `Bearer ${ctx.token}`)

			expect(res.status).toBe(200)
			expect(res.body.id).toBe(ctx.userId)
			expect(res.body.name).toBe(newName)
		})

		it('must change user data permenantly', async () => {
			expect(ctx.token).not.toBeNull()

			const res = await request
				.post('/users/me')
				.set('Authorization', `Bearer ${ctx.token}`)

			expect(res.status).toBe(200)
			expect(res.body.id).toBe(ctx.userId)
			expect(res.body.name).toBe(newName)

			newUser.name = newName
		})

		it('must not throw any error if empty json was sent', async () => {
			expect(ctx.token).not.toBeNull()

			const res = await request
				.put('/users/me')
				.send({})
				.set('Authorization', `Bearer ${ctx.token}`)

			expect(res.status).toBe(200)
			expect(res.body.id).toBe(ctx.userId)
			expect(res.body.name).toBe(newUser.name)
		})

		describe('user delete story', () => {
			const testUser = {
				name: 'test',
				password: 'test1234',
			}

			let testToken = null
			let testUserId = null

			it('must delete user', async () => {
				const res = await request
					.post('/login')
					.send(testUser)

				expect(res.status).toBe(200)
				expect(res.body?.user?.name).toBe(
					testUser.name,
				)
				expect(
					ObjectId.isValid(res.body?.user?.id),
				).toBe(true)

				testToken = res.body.key
				testUserId = res.body.user.id
			})

			it('must be valid token', () => {
				const decodedToken = jwt.verify(
					testToken,
					process.env.JWT_SECRET,
				)

				expect(decodedToken).toHaveProperty(
					'_id',
					testUserId,
				)
			})

			it('must get data of user with given id', async () => {
				const res = await request.get(
					`/users/${testUserId}`,
				)

				expect(res.status).toBe(200)
				expect(res.body.id).toBe(testUserId)
			})

			it('must delete user', async () => {
				const res = await request
					.delete('/users/me')
					.set(
						'Authorization',
						`Bearer ${testToken}`,
					)

				expect(res.status).toBe(200)
				expect(res.body.id).toBe(testUserId)
			})

			it('must delete user permanently', async () => {
				const res = await request.get(
					`/users/${testUserId}`,
				)

				expect(res.status).toBe(404)
				expect(res.body.errorName).toBe(
					'UserNotFound',
				)
			})
		})

		describe('changing password story', () => {
			const testUser = {
				name: 'pwtest',
				password: 'test1234',
			}

			const oldPassword = testUser.password
			let testToken = null
			let testUserId = null

			it('must create new user', async () => {
				const res = await request
					.post('/login')
					.send(testUser)

				expect(res.status).toBe(200)
				expect(res.body?.user?.name).toBe(
					testUser.name,
				)
				expect(
					ObjectId.isValid(res.body?.user?.id),
				).toBe(true)

				testToken = res.body.key
				testUserId = res.body.user.id
			})

			it('must allow user to login with same password', async () => {
				const res = await request
					.post('/login')
					.send(testUser)

				expect(res.status).toBe(200)
				expect(res.body?.user?.name).toBe(
					testUser.name,
				)
				expect(res.body?.user?.id).toBe(testUserId)
				// expect(res.body.key).toBe(testToken)
			})

			it('must change password', async () => {
				const newPassword = 'new! new! new!'

				const res = await request
					.post('/users/me/password')
					.set(
						'Authorization',
						`Bearer ${testToken}`,
					)
					.send({
						old: testUser.password,
						new: newPassword,
					})

				expect(res.status).toBe(200)

				// body must not have any data
				expect(res.body).toEqual({})

				testUser.password = newPassword
			})

			it('must have changed password permanently', async () => {
				const newPassword = 'new! new! new!'

				const res = await request
					.post('/users/me/password')
					.set(
						'Authorization',
						`Bearer ${testToken}`,
					)
					.send({
						old: oldPassword,
						new: newPassword,
					})

				expect(res.status).toBe(403)

				// body must not have any data
				expect(res.body.errorName).toBe(
					'PasswordDoesNotMatch',
				)
			})

			it('must throw an error if old field is omitted', async () => {
				const res = await request
					.post('/users/me/password')
					.set(
						'Authorization',
						`Bearer ${testToken}`,
					)
					.send({
						old: testUser.password,
					})

				expect(res.status).toBe(400)

				// body must not have any data
				expect(res.body.errorName).toBe(
					'FieldRequired',
				)
			})

			it('must throw an error if old field is omitted', async () => {
				const newPassword = 'new! new! new! new!!'

				const res = await request
					.post('/users/me/password')
					.set(
						'Authorization',
						`Bearer ${testToken}`,
					)
					.send({
						new: newPassword,
					})

				expect(res.status).toBe(400)

				// body must not have any data
				expect(res.body.errorName).toBe(
					'FieldRequired',
				)
			})

			it('must not allow user to login with old password', async () => {
				const res = await request
					.post('/login')
					.send({
						name: testUser.name,
						password: oldPassword,
					})

				expect(res.status).toBe(401)
				expect(res.body.errorName).toBe(
					'PasswordIncorrectOrUserAlreadyExist',
				)
			})

			it('must allow user to login with changed password', async () => {
				const res = await request
					.post('/login')
					.send(testUser)

				expect(res.status).toBe(200)
				expect(res.body?.user?.name).toBe(
					testUser.name,
				)
				expect(res.body?.user?.id).toBe(testUserId)
				// expect(res.body.key).toBe(testToken)
			})
		})
	})
})
