import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import ResponseError from '../class/ResponseError'

declare global {
    namespace Express {
        interface Request {
            user?: jwt.JwtPayload | string
        }
    }
}

export default async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization']
    const token = authHeader?.split(' ')?.[1]

    if (token == null)
        return next(
            new ResponseError({
                status: 401,
                errorName: 'TokenRequired',
                message: 'API token must be required for this action',
            }),
        )

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
        req.user = decoded

        next()
    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError) {
            next(
                new ResponseError({
                    status: 401,
                    message: 'your token is invalid or malformed',
                    errorName: 'TokenInvalid',
                }),
            )
        } else {
            next(err)
        }
    }
}
