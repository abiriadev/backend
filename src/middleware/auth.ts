import express from 'express'
import jwt from 'jsonwebtoken'

declare global {
    namespace Express {
        interface Request {
            user?: jwt.JwtPayload | string
        }
    }
}

export default async (
    req: express.Request,
    res: express.Response,
    next: any,
) => {
    const authHeader = req.headers['authorization']
    const token = authHeader?.split(' ')?.[1]

    if (token == null) return res.sendStatus(401)

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string)

    req.user = decoded

    next()
}
