import dotenv from 'dotenv'
import app from './app'
import { once } from 'events'

dotenv.config()

!(async function () {
    const server = app.listen(app.get('port'))
    await once(server, 'listening')
    console.log(`server listening on ${app.get('port')}`)

	// this is very important for docker handling
    process.once('SIGTERM', code => {
        console.log(`${code} received`)
        console.log('closing the server...')
        server.close()
        console.log('exit the process')
        process.exit(0)
    })
})()
