import prisma from '../prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import express from 'express'
import ResponseError from '../class/ResponseError'
import { dateMapper } from '../utils/mapRecurse'

export default express.Router().post('/', async (req, res, next) => {
    if (req.body.name === undefined) {
        return next(
            new ResponseError({
                status: 400,
                message: 'field `name` required',
                errorName: 'FieldRequired',
                action: 'login',
            }),
        )
    }

    if (req.body.password === undefined) {
        return next(
            new ResponseError({
                status: 400,
                message: 'field `password` required',
                errorName: 'FieldRequired',
                action: 'login',
            }),
        )
    }

    // first check whether the user is already exist or not
    let existingUser = await prisma.user.findUnique({
        where: {
            // find by name, not id
            name: req.body.name,
        },
    })

    // if user is not null, that means the user has been already exist
    if (existingUser !== null) {
        // compare the given password
        const isMatch = await bcrypt.compare(
            // plaintext
            req.body.password,
            // hash
            existingUser.password,
        )

        if (!isMatch) {
            // throw error when password does not match
            return next(
                new ResponseError({
                    status: 401,
                    message: `your password does not match with stored one.\nit seems 1. you lost or mistyped your password, or\n2. you are tring to create new account, but there is already a user with the same name.\nin case of 2, please try again with different name.`,
                    action: 'login',
                    errorName: 'PasswordIncorrectOrUserAlreadyExist',
                }),
            )
        }
    } else {
        // hashing process
        const salt = await bcrypt.genSalt(10)
        const hash: string = await bcrypt.hash(req.body.password, salt)

        // create new user
        const newUser = await prisma.user.create({
            data: {
                name: req.body.name,
                password: hash,
            },
        })

        // override user, which is null here
        existingUser = newUser
    }

    // generate new access token
    const token = jwt.sign(
        {
            // NOTE: there is only one payload property, the user id.
            _id: existingUser.id,
        },
        process.env.JWT_SECRET,
    )

    // remove password information from result
    const { password, ...user } = existingUser

    // final response
    res.json(
        dateMapper({
            key: token,
            user,
        }),
    )
})
