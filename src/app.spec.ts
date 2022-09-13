import supertest from 'supertest'
import app from './app'
import prisma from './prisma'
import jwt from 'jsonwebtoken'

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

            userId = res.body.user.id
            token = res.body.key
        })

        it('get all users', async () => {
            const res = await request.get('/users')

            expect(res.body).toHaveLength(1)
            expect(res.body?.[0].name).toBe('Abiria')
            ;['id', 'createdAt', 'updatedAt'].map(p =>
                expect(res.body?.[0]).toHaveProperty(p),
            )
        })

        it('get specific user', async () => {
            console.log('id:', userId)

            const res = await request.get(`/users/${userId}`)

            expect(res.status).toBe(200)
            expect(res.body.name).toBe('Abiria')
            ;['id', 'createdAt', 'updatedAt'].map(p =>
                expect(res.body).toHaveProperty(p),
            )

            expect(res.body.id).toBe(userId)
        })

        let postId = null

        it('create a post', async () => {
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
            expect(res.body.authorId).toBe(userId)
            ;['id', 'createdAt', 'updatedAt'].map(p =>
                expect(res.body).toHaveProperty(p),
            )

            postId = res.body.id
        })

        it('get all posts', async () => {
            const res = await request.get('/posts')

            expect(res.status).toBe(200)
            expect(res.body).toHaveLength(1)
        })

        it('get specific post', async () => {
            const res = await request.get(`/posts/${postId}`)

            expect(res.status).toBe(200)
            expect(res.body.title).toBe(newPost.title)
            expect(res.body.content).toBe(newPost.content)
            expect(res.body.category).toBe(newPost.category)
            expect(res.body.authorId).toBe(userId)
        })

        it('show recent posts', async () => {
            const res = await request.get(`/users/${userId}`)

            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('recentPosts')
            expect(res.body?.recentPosts?.[0]?.id).toBe(postId)
        })
    })

    describe('login story test', () => {
        const newUser = {
            name: 'Abiria',
            password: '1234',
        }

        beforeAll(async () => {
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

            userId = res.body.user.id
        })

        it('login with the user', async () => {
            const res = await request.post('/login').send({
                name: newUser.name,
                password: newUser.password,
            })

            expect(res.status).toBe(200)
            expect(res.body.user.name).toBe(newUser.name)
            expect(res.body.user.id).toBe(userId)
        })
    })
})
