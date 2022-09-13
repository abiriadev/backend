import { Router } from 'express'
import prisma from '../prisma'
import auth from '../middleware/auth'
import ResponseError from '../class/ResponseError'

export default Router()
    .get('/', async (_req, res) => {
        const posts = await prisma.post.findMany()

        res.json(posts)
    })
    .get('/:id', async (req, res, next) => {
        try {
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

            if (post === null) {
                return next(
                    new ResponseError({
                        status: 404,
                        message: `could not find post with id ${req.params.id}`,
                        errorName: 'PostNotFound',
                        action: 'getPost',
                    }),
                )
            } else {
                res.json(post)
            }
        } catch (err) {
            next(
                new ResponseError({
                    status: 400,
                    message: err.message,
                    action: 'getPost',
                    errorName: 'RequestInvalid',
                }),
            )
        }
    })
    .post('/', auth, async (req, res) => {
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
