import { Router } from 'express'
import loginRouter from './login'
import usersRouter from './users'
import postsRouter from './posts'
import swaggerUi from 'swagger-ui-express'
import yaml from 'js-yaml'
import path from 'path'
import fs from 'fs'

export default Router()
	.use('/', swaggerUi.serve)
	.get(
		'/',
		swaggerUi.setup(
			yaml.load(
				fs
					.readFileSync(
						path.join(
							process.env.WORKDIR ??
								process.cwd(),
							'dist/bundle.yaml',
						),
					)
					.toString(),
			),
			{
				swaggerOptions: {
					displayOperationId: true,
					showCommonExtensions: true,
				},
			},
		),
	)
	.use('/login', loginRouter)
	.use('/users', usersRouter)
	.use('/posts', postsRouter)
