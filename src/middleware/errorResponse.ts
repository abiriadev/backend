import { Request, Response, NextFunction } from 'express'
import ResponseError from '../class/ResponseError'

export default async (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
) => {
    console.log(err)
    if (err instanceof ResponseError) {
        res.status(err.status)

        const errJson = {
            status: err.status,
            errorName: err.errorName,
            action: err.action,
            message: err.message,
        }

        res.json(errJson)
    } else {
        res.status(500).json({
            status: 500,
            message: `internal server error: ${err.message}`,
            errorName: 'Error',
            action: 'noAction',
        })
    }

    // does not call any following middleware
    // next(err)
}
