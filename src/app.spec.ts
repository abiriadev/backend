import request from 'supertest'
import app from './app'

describe('basic router testing', () => {
    it('must return hello message', async () => {
        const res = await request(app).get('/')

        expect(res.headers['content-type']).toMatch(/json/)
        expect(res.status).toEqual(200)
        expect(res.body.message).toEqual('hello')
    })
})
