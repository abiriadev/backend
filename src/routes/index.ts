import express, { Router } from 'express'
import path from 'path'
import all from './all'
import api from './api'

export default Router()
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
	.use('/api', api)
	.use('*', all)
