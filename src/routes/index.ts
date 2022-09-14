import express from 'express'
import loginRouter from './login'
import path from 'path'
import usersRouter from './users'
import postsRouter from './posts'
import all from './all'

export default express
	.Router()
	.get('/', (_req, res) => {
		res.json({
			message: 'hello',
		})
	})
	.use(
		'/prisma',
		express.static(
			path.join(
				process.env.WORKDIR ?? process.cwd(),
				'public/prisma',
			),
		),
	)
	.use('/login', loginRouter)
	.use('/users', usersRouter)
	.use('/posts', postsRouter)
	.use('*', all)
