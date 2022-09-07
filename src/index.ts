import dotenv from 'dotenv'
import app from './app'
import { once } from 'events'

dotenv.config()

!(async function () {
    const server = app.listen()
    await once(server, 'listening')
})()
