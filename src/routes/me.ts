import { Router } from 'express'
import auth from '../middleware/auth'
import prisma from '../prisma'
import { dateMapper } from '../utils/mapRecurse'
import ResponseError from '../class/ResponseError'
import { excludePassword } from '../utils/excludePassword'
import bcrypt from 'bcryptjs'

export default Router()
	.post('/', auth, async (req, res, next) => {
		try {
			const user = await prisma.user.findUnique({
				select: excludePassword,
				where: {
					id: req.user['_id'],
				},
			})

			if (user === null) {
				return next(
					new ResponseError({
						status: 404,
						message:
							"couldn't find user with given token",
						errorName: 'MeNotFound',
						action: 'updateMe',
					}),
				)
			}

			res.json(dateMapper(user))
		} catch (err) {
			return next(
				new ResponseError({
					status: 500,
					message: 'unknown error',
					action: 'getMe',
				}),
			)
		}
	})
	.put('/', auth, async (req, res, next) => {
		try {
			const updateData: {
				name?: string
			} = {}

			if (req.body.name !== undefined) {
				updateData.name = req.body.name
			}

			const user = await prisma.user.update({
				select: excludePassword,
				where: {
					id: req.user['_id'],
				},
				data: updateData,
			})

			if (user === null) {
				return next(
					new ResponseError({
						status: 404,
						message:
							"couldn't find user with given token",
						errorName: 'MeNotFound',
						action: 'updateMe',
					}),
				)
			}

			res.json(dateMapper(user))
		} catch (err) {
			return next(
				new ResponseError({
					status: 500,
					message: 'unknown error',
					action: 'updateMe',
				}),
			)
		}
	})
	.delete('/', auth, async (req, res, next) => {
		try {
			const user = await prisma.user.delete({
				select: excludePassword,
				where: {
					id: req.user['_id'],
				},
			})

			if (user === null) {
				return next(
					new ResponseError({
						status: 404,
						message:
							"couldn't find user with given token",
						errorName: 'MeNotFound',
						action: 'deleteMe',
					}),
				)
			}

			res.json(dateMapper(user))
		} catch (err) {
			return next(
				new ResponseError({
					status: 500,
					message: 'unknown error',
					action: 'deleteMe',
				}),
			)
		}
	})
	.post('/password', auth, async (req, res, next) => {
		if (req.body.old === undefined) {
			return next(
				new ResponseError({
					status: 400,
					message: 'field `old` required',
					errorName: 'FieldRequired',
					action: 'changePassword',
				}),
			)
		}

		if (req.body.new === undefined) {
			return next(
				new ResponseError({
					status: 400,
					message: 'field `new` required',
					errorName: 'FieldRequired',
					action: 'changePassword',
				}),
			)
		}

		try {
			const user = await prisma.user.findUnique({
				select: {
					password: true,
				},
				where: {
					id: req.user['_id'],
				},
			})

			if (user === null) {
				return next(
					new ResponseError({
						status: 404,
						message:
							"couldn't find user with given token",
						errorName: 'MeNotFound',
						action: 'changePassword',
					}),
				)
			}

			const isMatch = await bcrypt.compare(
				// plaintext
				req.body.old,
				// hash
				user.password,
			)

			if (!isMatch) {
				return next(
					new ResponseError({
						status: 403,
						errorName: 'PasswordDoesNotMatch',
						message:
							'your password does not match against to the stored password',
						action: 'changePassword',
					}),
				)
			}

			// hashing process
			const salt = await bcrypt.genSalt(10)
			const hash: string = await bcrypt.hash(
				req.body.new,
				salt,
			)

			await prisma.user.update({
				where: {
					id: req.user['_id'],
				},
				data: {
					password: hash,
				},
			})

			res.sendStatus(200)
		} catch (err) {
			return next(
				new ResponseError({
					status: 500,
					message: 'unknown error',
					action: 'changePassword',
				}),
			)
		}
	})
