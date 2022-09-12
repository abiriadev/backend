import express from 'express'
import prisma from '../prisma'

export default express
    .Router()
    .get('/', (req, res) => {
        res.json({
            message: 'hello',
        })
    })
    .get('/users', async (req, res) => {
        const r = await prisma.user.findMany()
        res.json(r)
    })
    .post('/users', async (req, res) => {
        await prisma.user.create({
            data: {
                name: 'hello',
                password: Buffer.from('3971'),
            },
        })
        res.send('data in')
    })
