import { Response } from 'express'
import { ApiController, ApiRoute } from '@/decorators'
import { AuthenticatedRequest } from '@/middlewares'
import { createErrorResponse, createSuccessResponse } from '@/utils'
import { StatsService } from '@/services/stats.service'
import {
  ErrorResponseSchema,
  SuccessResponseSchema,
  StatsSchema,
} from '@/schemas'
import { PermissionName } from '@/enums'

@ApiController('/stats', ['Stats'])
export class StatsController {
  private statsService = new StatsService()

  @ApiRoute({
    method: 'get',
    path: '/',
    summary: 'Obter estatísticas do sistema',
    permissions: [PermissionName.MANAGE_ORGANIZATIONS],
    responses: {
      200: SuccessResponseSchema.create({
        schema: StatsSchema,
        dataDescription: 'Estatísticas do sistema',
        message: 'Estatísticas obtidas com sucesso',
      }),
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async getStats(req: AuthenticatedRequest, res: Response) {
    try {
      const stats = await this.statsService.getStats()

      return res
        .status(200)
        .json(createSuccessResponse('Estatísticas obtidas com sucesso', stats))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }
}
