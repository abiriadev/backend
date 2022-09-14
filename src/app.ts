import express from 'express'
import morgan from 'morgan'
import mainRouter from './routes'
import errorLogger from './middleware/errorLogger'
import errorHandler from './middleware/errorResponse'

export default express()
	.set('port', process.env.PORT || 3000)
	.use(morgan('dev'))
	.use(express.json())
	.use(
		express.urlencoded({
			extended: false,
		}),
	)
	.use(mainRouter)
	.use(errorLogger)
	.use(errorHandler)
