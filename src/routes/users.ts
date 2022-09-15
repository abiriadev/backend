import express from 'express'
import prisma from '../prisma'
import ResponseError from '../class/ResponseError'
import {
	excludePassword,
	excludeContent,
	basics,
} from '../utils/excludePassword'
import { dateMapper } from '../utils/mapRecurse'
import me from './me'

export default express
	.Router()
	.get('/', async (_req, res) => {
		const users = await prisma.user.findMany({
			select: excludePassword,
		})

		res.json(dateMapper(users))
	})
	.use('/me', me)
	.get('/:id', async (req, res, next) => {
		try {
			const user = await prisma.user.findUnique({
				where: {
					id: req.params.id,
				},
				select: {
					...excludePassword,
					recentPosts: {
						select: {
							...excludeContent,
							author: {
								select: {
									...excludePassword,
								},
							},
						},
					},
					recentComment: {
						select: {
							...basics,
							author: {
								select: {
									...excludePassword,
								},
							},
						},
					},
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
				res.json(dateMapper(user))
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
