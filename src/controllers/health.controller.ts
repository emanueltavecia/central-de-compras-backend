import { ApiController, ApiRoute } from '@/decorators/route.decorator'
import { ErrorResponseSchema, HealthDataSchema } from '@/models'
import { SuccessResponseSchema } from '@/models/success.schema'

@ApiController('', ['Health'])
export class HealthController {
  @ApiRoute({
    method: 'get',
    path: '/health',
    summary: 'Health check endpoint',
    tags: ['Health'],
    responses: {
      200: SuccessResponseSchema.create<HealthDataSchema>(
        HealthDataSchema,
        'Dados do health check',
      ),
      500: ErrorResponseSchema,
    },
  })
  async healthCheck() {
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    }

    return {
      success: true,
      message: 'Servidor funcionando corretamente',
      data: healthData,
    }
  }
}
