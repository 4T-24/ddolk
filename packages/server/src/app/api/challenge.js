import challengeResources from '../../k8s/resource.js'
import {
    getInstance,
    createInstance,
    deleteInstance,
} from '../../k8s/instance.js'
import { InstanceCreationError, InstanceExistsError } from '../../error.js'

const routes = async(fastify, _options) => {
    fastify.addHook('preHandler', async(req, res) => {
        if (!challengeResources.has(req.params.challengeId)) {
            res.notFound('Challenge does not exist')
        }
    })
    fastify.addHook('preHandler', fastify.authenticate)

    fastify.route({
        method: 'GET',
        url: '/:challengeId/:instanceId',
        schema: {
            response: {
                200: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        status: {
                            type: 'string',
                            enum: ['Stopped', 'Stopping', 'Unknown', 'Running', 'Starting'],
                        },
                        timeout: { type: 'integer' },
                        server: {
                            type: 'object',
                            properties: {
                                kind: { type: 'string' },
                                host: { type: 'string' },
                                port: { type: 'integer' },
                            },
                            required: ['kind', 'host'],
                        },
                        time: {
                            type: 'object',
                            properties: {
                                start: { type: 'integer' },
                                stop: { type: 'integer' },
                                remaining: { type: 'integer' },
                            },
                            required: ['start', 'stop', 'remaining'],
                        },
                    },
                    required: ['name', 'status', 'timeout'],
                },
            },
        },
        handler: async(req, _res) => {
            const { challengeId, instanceId } = req.params
            return getInstance(challengeId, instanceId)
        },
    })

    fastify.route({
        method: 'POST',
        url: '/:challengeId/:instanceId',
        schema: {
            body: {
                type: 'object',
                properties: {
                    recaptcha: { type: 'string' },
                },
                required: ['recaptcha'],
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        status: { const: 'Starting' },
                        timeout: { type: 'integer' },
                        server: {
                            type: 'object',
                            properties: {
                                kind: { type: 'string' },
                                host: { type: 'string' },
                                port: { type: 'integer' },
                            },
                            required: ['kind', 'host'],
                        },
                    },
                    required: ['name', 'status', 'timeout', 'server'],
                },
            },
        },
        preHandler: [fastify.recaptcha],
        handler: async(req, res) => {
            const { challengeId, instanceId } = req.params

            try {
                const instance = await createInstance(challengeId, instanceId, req.log)
                req.log.info('instance created')
                return instance
            } catch (err) {
                if (err instanceof InstanceExistsError) {
                    req.log.debug(err)
                    req.log.debug(err.cause)
                    return res.conflict(err.message)
                }
                if (err instanceof InstanceCreationError) {
                    // this is likely a misconfiguration, so log it
                    req.log.error(err)
                    req.log.error(err.cause)
                    return res.conflict(err.message)
                }
                throw err
            }
        },
    })

    fastify.route({
        method: 'DELETE',
        url: '/:challengeId/:instanceId',
        schema: {
            body: {
                type: 'object',
                properties: {
                    recaptcha: { type: 'string' },
                },
                required: ['recaptcha'],
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        status: { const: 'Stopping' },
                        timeout: { type: 'integer' },
                    },
                    required: ['name', 'status', 'timeout'],
                },
            },
        },
        preHandler: [fastify.recaptcha],
        handler: async(req, _res) => {
            const { challengeId, instanceId } = req.params
            const instance = await deleteInstance(challengeId, instanceId, req.log)
            req.log.info('instance deleted')
            return instance
        },
    })
}

export default routes