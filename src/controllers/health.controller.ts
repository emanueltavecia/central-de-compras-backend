import { ApiController, ApiRoute } from '@/decorators'
import {
  Environment,
  ErrorResponseSchema,
  HealthDataSchema,
  SuccessResponseSchema,
} from '@/schemas'

@ApiController('/health', ['Health'])
export class HealthController {
  @ApiRoute({
    method: 'get',
    path: '/',
    summary: 'Endpoint de health check',
    isPublic: true,
    responses: {
      200: SuccessResponseSchema.create({
        schema: HealthDataSchema,
        dataDescription: 'Dados do health check',
        message: 'Servidor funcionando corretamente',
      }),
      500: ErrorResponseSchema,
    },
  })
  async healthCheck() {
    const healthData: HealthDataSchema = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: (process.env.NODE_ENV ||
        Environment.DEVELOPMENT) as Environment,
    }

    return {
      success: true,
      message: 'Servidor funcionando corretamente',
      data: healthData,
    }
  }
}
