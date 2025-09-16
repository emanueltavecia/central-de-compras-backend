import { RouteHandler } from '@/types'
import { createSuccessResponse } from '@/utils'

export class HealthController {
  static healthCheck: RouteHandler = async (request, reply) => {
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    }

    reply.send(
      createSuccessResponse('Servidor funcionando corretamente', healthData),
    )
  }
}
