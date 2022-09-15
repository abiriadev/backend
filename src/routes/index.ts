import express, { Router } from 'express'
import path from 'path'
import all from './all'
import api from './api'

export default Router()
	.use(
		express.static(
			path.join(
				process.env.WORKDIR ?? process.cwd(),
				'public',
			),
		),
	)
	.use('/api', api)
	.use('*', all)
