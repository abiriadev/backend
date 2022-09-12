import express from 'express'
import prisma from '../prisma'

export default express
    .Router()
    .get('/', (req, res) => {
        res.json({
            message: 'hello',
        })
    })
    .get('/users', async (req, res) => {
        const r = await prisma.user.findMany()
        res.json(r)
    })
    .post('/users', async (req, res) => {
        const r = await prisma.user.create({
            data: {
                name: req.body.name,
                password: Buffer.from(req.body.password),
            },
        })
        res.json(r)
    })
    .get('/users/:id', async (req, res) => {
        const user = await prisma.user.findUnique({
            where: {
                id: req.params.id,
            },
            include: {
                recentPosts: true,
            },
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
        })

        res.json(post)
    })
    .post('/posts', async (req, res) => {
        const post = await prisma.post.create({
            data: {
                title: req.body.title,
                content: req.body.content,
                category: req.body.category,
                authorId: req.body.author,
                // author: {
                //     connect: {
                //         id: req.body.author,
                //     },
                // },
            },
        })

        res.json(post)
    })
