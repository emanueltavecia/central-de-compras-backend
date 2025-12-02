import { Response } from 'express'
import { ApiController, ApiRoute } from '@/decorators'
import { AuthenticatedRequest } from '@/middlewares'
import { createErrorResponse, createSuccessResponse } from '@/utils'
import { StatsService } from '@/services/stats.service'
import {
  ErrorResponseSchema,
  SuccessResponseSchema,
  AdminStatsSchema,
  SupplierStatsSchema,
  StoreStatsSchema,
} from '@/schemas'
import { UserRole } from '@/enums'

@ApiController('/stats', ['Stats'])
export class StatsController {
  private statsService = new StatsService()

  @ApiRoute({
    method: 'get',
    path: '/',
    summary:
      'Obter estatísticas do sistema baseadas no tipo de usuário (Admin, Fornecedor ou Loja)',
    responses: {
      200: SuccessResponseSchema.create({
        schema: AdminStatsSchema,
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
      const userRole = req.user?.role?.name
      const organizationId = req.user?.organizationId

      let stats:
        | AdminStatsSchema
        | SupplierStatsSchema
        | StoreStatsSchema
        | undefined

      switch (userRole) {
        case UserRole.ADMIN:
          stats = await this.statsService.getAdminStats()
          break

        case UserRole.SUPPLIER:
          if (!organizationId) {
            return res
              .status(400)
              .json(
                createErrorResponse(
                  'ID da organização não encontrado',
                  'ORGANIZATION_ID_NOT_FOUND',
                ),
              )
          }
          stats = await this.statsService.getSupplierStats(organizationId)
          break

        case UserRole.STORE:
          if (!organizationId) {
            return res
              .status(400)
              .json(
                createErrorResponse(
                  'ID da organização não encontrado',
                  'ORGANIZATION_ID_NOT_FOUND',
                ),
              )
          }
          stats = await this.statsService.getStoreStats(organizationId)
          break

        default:
          return res
            .status(403)
            .json(
              createErrorResponse(
                'Tipo de usuário não autorizado',
                'UNAUTHORIZED_USER_ROLE',
              ),
            )
      }

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
