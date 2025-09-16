import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

import { config } from '@/config'
import { registerRoutes } from '@/routes'
import { requestLogger } from '@/middleware'

export async function createApp() {
  const fastify = Fastify({
    ajv: {
      customOptions: {
        strict: false,
        keywords: ['example'],
      },
    },
  })

  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  })

  await fastify.register(cors, config.cors)

  await fastify.register(swagger, config.swagger)

  await fastify.register(swaggerUi, {
    routePrefix: config.swagger.routePrefix,
  })

  fastify.addHook('preHandler', requestLogger)

  fastify.setErrorHandler(async (error, request, reply) => {
    request.log.error(error)

    const statusCode = reply.statusCode >= 400 ? reply.statusCode : 500

    reply.status(statusCode).send({
      success: false,
      message: error.message || 'Internal Server Error',
      error: error.name,
    })
  })

  await registerRoutes(fastify)

  return fastify
}

export { config }
