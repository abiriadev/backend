import { Router } from 'express'
import prisma from '../prisma'
import auth from '../middleware/auth'
import ResponseError from '../class/ResponseError'
import {
    excludePassword,
    excludeContent,
    basics,
} from '../utils/excludePassword'
import { dateMapper } from '../utils/mapRecurse'

export default Router()
    .get('/', async (_req, res) => {
        const posts = await prisma.post.findMany({
            select: {
                ...excludeContent,
                author: {
                    select: excludePassword,
                },
            },
        })

        res.json(dateMapper(posts))
    })
    .post('/', auth, async (req, res, next) => {
        if (req.body.title === undefined) {
            return next(
                new ResponseError({
                    status: 400,
                    message: 'field `title` required',
                    errorName: 'FieldRequired',
                    action: 'createPost',
                }),
            )
        }

        if (req.body.content === undefined) {
            return next(
                new ResponseError({
                    status: 400,
                    message: 'field `content` required',
                    errorName: 'FieldRequired',
                    action: 'createPost',
                }),
            )
        }

        if (req.body.category === undefined) {
            return next(
                new ResponseError({
                    status: 400,
                    message: 'field `category` required',
                    errorName: 'FieldRequired',
                    action: 'createPost',
                }),
            )
        }

        const post = await prisma.post.create({
            data: {
                title: req.body.title,
                content: req.body.content,
                category: req.body.category,
                authorId: req.user['_id'],
            },
            select: {
                ...excludeContent,
                content: true,
                author: {
                    select: excludePassword,
                },
                comments: {
                    select: {
                        ...basics,
                        content: true,
                    },
                },
            },
        })

        res.json(dateMapper(post))
    })
    .get('/:id', async (req, res, next) => {
        try {
            const post = await prisma.post.findUnique({
                where: {
                    id: req.params.id,
                },
                select: {
                    ...excludeContent,
                    content: true,
                    author: {
                        select: excludePassword,
                    },
                    comments: {
                        select: {
                            ...basics,
                            content: true,
                            author: {
                                select: excludePassword,
                            },
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
                res.json(dateMapper(post))
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
    .post('/:id/comments', auth, async (req, res, next) => {
        if (req.body.content === undefined) {
            return next(
                new ResponseError({
                    status: 400,
                    message: 'field `content` required',
                    errorName: 'FieldRequired',
                    action: 'createComment',
                }),
            )
        }

        try {
            const targetPost = await prisma.post.findUnique({
                where: {
                    id: req.params.id,
                },
                select: {
                    id: true,
                },
            })

            if (targetPost === null) {
                next(
                    new ResponseError({
                        status: 404,
                        errorName: 'PostDoesNotExist',
                        message:
                            'the post you are trying to add comment does not exist',
                    }),
                )
            } else {
                const comment = await prisma.comment.create({
                    data: {
                        content: req.body.content,
                        authorId: req.user['_id'],
                        postId: req.params.id,
                    },
                    select: {
                        ...basics,
                        content: true,
                        author: {
                            select: excludePassword,
                        },
                        postId: true,
                    },
                })

                res.json(dateMapper(comment))
            }
        } catch (err) {
            next(err)
        }
    })
