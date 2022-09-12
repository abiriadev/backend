import supertest from 'supertest'
import app from './app'
import prisma from './prisma'

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

        it('creat user', async () => {
            const res = await request.post('/users').send({
                name: newUser.name,
                password: newUser.password,
            })

            expect(res.status).toEqual(200)
            expect(res.body.name).toEqual(newUser.name)
            expect(res.body.password).toEqual({
                type: 'Buffer',
                data: [...newUser.password].map(_ => _.codePointAt(0)),
            })
        })

        let id = null

        it('get all users', async () => {
            const res = await request.get('/users')

            expect(res.body).toHaveLength(1)
            expect(res.body?.[0].name).toBe('Abiria')
            expect(res.body?.[0].password).toEqual({
                type: 'Buffer',
                data: [...newUser.password].map(_ => _.codePointAt(0)),
            })
            ;['id', 'createdAt', 'updatedAt'].map(p =>
                expect(res.body?.[0]).toHaveProperty(p),
            )

            id = res.body?.[0].id
        })

        it('get specific user', async () => {
            console.log('id:', id)

            const res = await request.get(`/users/${id}`)

            expect(res.status).toBe(200)
            expect(res.body.name).toBe('Abiria')
            expect(res.body.password).toEqual({
                type: 'Buffer',
                data: [...newUser.password].map(_ => _.codePointAt(0)),
            })
            ;['id', 'createdAt', 'updatedAt'].map(p =>
                expect(res.body).toHaveProperty(p),
            )

            expect(res.body.id).toBe(id)
        })

        let postId = null

        it('create a post', async () => {
            const res = await request.post('/posts').send({
                title: newPost.title,
                content: newPost.content,
                category: newPost.category,

                author: id,
            })

            expect(res.status).toBe(200)
            expect(res.body.title).toBe(newPost.title)
            expect(res.body.content).toBe(newPost.content)
            expect(res.body.category).toBe(newPost.category)
            expect(res.body.authorId).toBe(id)
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
            expect(res.body.authorId).toBe(id)
        })

        it('show recent posts', async () => {
            const res = await request.get(`/users/${id}`)

            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('recentPosts')
            expect(res.body?.recentPosts?.[0]?.id).toBe(postId)
            // console.log(res.body)
        })
    })
})
