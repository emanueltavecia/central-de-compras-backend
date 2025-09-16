import { FastifyInstance } from 'fastify'
import { HealthController } from '@/controllers/health.controller'
import { HealthResponseSchema } from '@/models/health.schema'
import { createSchemaFromClass } from '@/utils'

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/health',
    {
      schema: {
        tags: ['Health'],
        summary: 'Health check endpoint',
        response: {
          200: createSchemaFromClass(HealthResponseSchema),
        },
      },
    },
    HealthController.healthCheck,
  )
}
