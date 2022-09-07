import express from 'express'
import morgan from 'morgan'
import mainRouter from './routes'

export default express()
    .set('port', process.env.PORT || 10080)
    .use(morgan('dev'))
    .use(express.json())
    .use(
        express.urlencoded({
            extended: false,
        }),
    )
    .use(mainRouter)
    .use((req, res, next) => {
        const error = new Error(`${req.method} ${req.url} router not found`)

        // error.status = 404
        next(error)
    })
    .use((err: any, req, res, next) => {
        res.status(500)

        if (process.env.NODE_ENV !== 'production') {
            res.json(JSON.stringify(err))
        } else {
            res.end()
        }
    })
