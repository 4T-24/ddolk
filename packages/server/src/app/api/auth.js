import getTeam from '../rctf.js'

const routes = async (fastify, _options) => {
  fastify.route({
    method: 'POST',
    url: '/auth',
    schema: {
      body: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
          },
        },
        required: ['token'],
      },
    },
    handler: async (req, res) => {
      const { token } = req.body
      const team = await getTeam(token)
      if (team === null) {
        return res.unauthorized('Invalid rCTF token.')
      }
      const ddolkToken = fastify.jwt.sign({ sub: team.id })
      return { token: ddolkToken }
    },
  })
}

export default routes
