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

		if (
			!['report', 'qa', 'info'].includes(
				req.body.category,
			)
		) {
			return next(
				new ResponseError({
					errorName: 'FieldInvalid',
					status: 400,
					message:
						'`category` must be one of "report", "qa", "info"',
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
			}

			res.json(dateMapper(post))
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
	.put('/:id', auth, async (req, res, next) => {
		try {
			const updateData: {
				title?: string
				content?: string
				category?: 'report' | 'qa' | 'info'
			} = {}

			if (req.body.title !== undefined) {
				updateData.title = req.body.title
			}

			if (req.body.content !== undefined) {
				updateData.content = req.body.content
			}

			if (req.body.category !== undefined) {
				if (
					!['report', 'qa', 'info'].includes(
						req.body.category,
					)
				) {
					return next(
						new ResponseError({
							errorName: 'FieldInvalid',
							status: 400,
							message:
								'`category` must be one of "report", "qa", "info"',
							action: 'editPost',
						}),
					)
				}

				updateData.category = req.body.category
			}

			const post = await prisma.post.findUnique({
				where: {
					id: req.params.id,
				},
			})

			if (post === null) {
				return next(
					new ResponseError({
						status: 404,
						errorName: 'PostDoesNotExist',
						message:
							'the post you are trying to edit does not exist',
						action: 'editPost',
					}),
				)
			}

			const updatedPost = await prisma.post.update({
				select: {
					...excludeContent,
					content: true,
				},
				where: {
					id: req.params.id,
				},
				data: updateData,
			})

			if (updatedPost === null) {
				return next(
					new ResponseError({
						status: 404,
						message: `could not find post with id ${req.params.id}`,
						errorName: 'PostNotFound',
						action: 'editPost',
					}),
				)
			}

			res.json(dateMapper(updatedPost))
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
	.delete('/:id', auth, async (req, res, next) => {
		try {
			const post = await prisma.post.findUnique({
				where: {
					id: req.params.id,
				},
			})

			if (post === null) {
				return next(
					new ResponseError({
						status: 404,
						errorName: 'PostDoesNotExist',
						message:
							'the post you are trying to edit does not exist',
						action: 'deletePost',
					}),
				)
			}

			const deletedPost = await prisma.post.delete({
				select: {
					...excludeContent,
					content: true,
				},
				where: {
					id: req.params.id,
				},
			})

			if (deletedPost === null) {
				return next(
					new ResponseError({
						status: 404,
						message: `could not find post with id ${req.params.id}`,
						errorName: 'PostNotFound',
						action: 'deletePost',
					}),
				)
			}

			res.json(dateMapper(deletedPost))
		} catch (err) {
			return next(
				new ResponseError({
					status: 500,
					message: 'unknown error',
					action: 'deletePost',
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
			const targetPost = await prisma.post.findUnique(
				{
					where: {
						id: req.params.id,
					},
					select: {
						id: true,
					},
				},
			)

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
				const comment = await prisma.comment.create(
					{
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
					},
				)

				res.json(dateMapper(comment))
			}
		} catch (err) {
			next(err)
		}
	})
