import fp from 'fastify-plugin'
import config from '../config.js'

const auth = fp(async(fastify, _options) => {
    fastify.decorate('authenticate', async(req, res) => {
        // Read Bearer token from Authorization header
        const token = req.headers.authorization?.replace('Bearer ', '')
        // Verify token against secret key
        if (token === undefined || token === null) {
            res.unauthorized('Missing token')
        }
        let secret_key = config.secretKey
        if (token !== secret_key) {
            res.unauthorized('Invalid token')
        }
    })
})

export default auth