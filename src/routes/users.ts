import express from 'express'
import prisma from '../prisma'
import ResponseError from '../class/ResponseError'

export default express
    .Router()
    .get('/', async (req, res) => {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                createdAt: true,
                updatedAt: true,
                name: true,
            },
        })

        res.json(users)
    })
    .post('/', async (req, res) => {
        const newUser = await prisma.user.create({
            data: {
                name: req.body.name,
                password: req.body.password,
            },
            select: {
                id: true,
                createdAt: true,
                updatedAt: true,
                name: true,
            },
        })

        res.json(newUser)
    })
    .get('/:id', async (req, res, next) => {
        try {
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
            })

            if (user === null) {
                return next(
                    new ResponseError({
                        status: 404,
                        message: `could not find user with id ${req.params.id}`,
                        errorName: 'UserNotFound',
                        action: 'getUser',
                    }),
                )
            } else {
                res.json(user)
            }
        } catch (err) {
            next(
                new ResponseError({
                    status: 400,
                    message: err.message,
                    action: 'getUser',
                    errorName: 'RequestInvalid',
                }),
            )
        }
    })
