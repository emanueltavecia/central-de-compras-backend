import { FastifyInstance } from 'fastify'
import { healthRoutes } from './health.routes'

export async function registerRoutes(fastify: FastifyInstance) {
  await fastify.register(healthRoutes)
}
