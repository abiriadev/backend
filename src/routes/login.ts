import prisma from '../prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import express from 'express'

export default express.Router().post('/', async (req, res) => {
    // first check whether the user is already exist or not
    let user = await prisma.user.findUnique({
        where: {
            // find by name, not id
            name: req.body.name,
        },
    })

    // if user is not null, that means the user has been already exist
    if (user !== null) {
        // compare the given password
        const isMatch = await bcrypt.compare(
            // plaintext
            req.body.password as string,
            // hash
            user.password as string,
        )

        if (!isMatch) {
            // throw error to the next middleware
            return new Error('password does not matching')
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
        user = newUser
    }

    // generate new access token
    const token = jwt.sign(
        {
            // NOTE: there is only one payload property, the user id.
            _id: user.id,
        },
        process.env.JWT_SECRET,
    )

    // final response
    res.json({
        key: token,
        user,
    })
})
