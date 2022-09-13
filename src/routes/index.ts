import express from 'express'
import prisma from '../prisma'
import loginRouter from './login'
import auth from '../middleware/auth'

export default express
    .Router()
    .get('/', (req, res) => {
        res.json({
            message: 'hello',
        })
    })
    .use('/login', loginRouter)
    .get('/users', async (req, res) => {
        const r = await prisma.user.findMany({
            select: {
                id: true,
                createdAt: true,
                updatedAt: true,
                name: true,
            },
        })
        res.json(r)
    })
    .post('/users', async (req, res) => {
        const r = await prisma.user.create({
            data: {
                name: req.body.name,
                // password: Buffer.from(req.body.password),
                password: req.body.password,
            },
            select: {
                id: true,
                createdAt: true,
                updatedAt: true,
                name: true,
            },
        })
        res.json(r)
    })
    .get('/users/:id', async (req, res) => {
        const user = await prisma.user.findUnique({
            where: {
                id: req.params.id,
            },
            select: {
                id: true,
                createdAt: true,
                updatedAt: true,
                name: true,
                recentPosts: true,
            },
            // include: {
            //     recentPosts: true,
            // },
        })

        res.json(user)
    })
    .get('/posts', async (req, res) => {
        const posts = await prisma.post.findMany()

        res.json(posts)
    })
    .get('/posts/:id', async (req, res) => {
        const post = await prisma.post.findUnique({
            where: {
                id: req.params.id,
            },
            select: {
                id: true,
                createdAt: true,
                updatedAt: true,
                title: true,
                content: true,
                category: true,
                author: {
                    select: {
                        id: true,
                        createdAt: true,
                        updatedAt: true,
                        name: true,
                    },
                },
            },
        })

        res.json(post)
    })
    .post('/posts', auth, async (req, res) => {
        const post = await prisma.post.create({
            data: {
                title: req.body.title,
                content: req.body.content,
                category: req.body.category,
                authorId: req.user['_id'],
            },
            select: {
                id: true,
                createdAt: true,
                updatedAt: true,
                title: true,
                content: true,
                category: true,
                author: {
                    select: {
                        id: true,
                        createdAt: true,
                        updatedAt: true,
                        name: true,
                    },
                },
            },
        })

        res.json(post)
    })
