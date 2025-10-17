import { Response } from 'express'
import { ApiController, ApiRoute } from '@/decorators'
import { CashbackService } from '@/services'
import { createErrorResponse, createSuccessResponse } from '@/utils'
import { AuthenticatedRequest } from '@/middlewares'
import { PermissionName } from '@/enums'
import {
  CashbackWalletSchema,
  CashbackTransactionSchema,
  CashbackFiltersSchema,
  ErrorResponseSchema,
  SuccessResponseSchema,
  IdParamSchema,
} from '@/schemas'

@ApiController('/cashback', ['Cashback'])
export class CashbackController {
  private cashbackService: CashbackService

  constructor() {
    this.cashbackService = new CashbackService()
  }

  @ApiRoute({
    method: 'get',
    path: '/wallet/:id',
    summary: 'Buscar carteira de cashback por ID da organização',
    params: IdParamSchema,
    permissions: [PermissionName.VIEW_ORDERS],
    responses: {
      200: SuccessResponseSchema.create({
        schema: CashbackWalletSchema,
        dataDescription: 'Dados da carteira de cashback',
        message: 'Carteira de cashback encontrada',
      }),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async getWalletByOrganizationId(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const wallet = await this.cashbackService.getWalletByOrganizationId(id)

      return res
        .status(200)
        .json(createSuccessResponse('Carteira de cashback encontrada', wallet))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'get',
    path: '/transactions/:id',
    summary: 'Listar transações de cashback por ID da organização',
    params: IdParamSchema,
    query: CashbackFiltersSchema,
    permissions: [PermissionName.VIEW_ORDERS],
    responses: {
      200: SuccessResponseSchema.create({
        schema: CashbackTransactionSchema,
        dataDescription: 'Lista de transações de cashback',
        isArray: true,
        message: 'Transações listadas com sucesso',
      }),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async getTransactionsByOrganizationId(
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
      const { id } = req.params
      const filters = req.query as CashbackFiltersSchema
      const transactions =
        await this.cashbackService.getTransactionsByOrganizationId(id, filters)

      return res
        .status(200)
        .json(
          createSuccessResponse(
            'Transações listadas com sucesso',
            transactions,
          ),
        )
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'get',
    path: '/order-transactions/:id',
    summary: 'Listar transações de cashback por ID do pedido',
    params: IdParamSchema,
    permissions: [PermissionName.VIEW_ORDERS],
    responses: {
      200: SuccessResponseSchema.create({
        schema: CashbackTransactionSchema,
        dataDescription: 'Lista de transações de cashback do pedido',
        isArray: true,
        message: 'Transações do pedido listadas com sucesso',
      }),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async getTransactionsByOrderId(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const transactions =
        await this.cashbackService.getTransactionsByOrderId(id)

      return res
        .status(200)
        .json(
          createSuccessResponse(
            'Transações do pedido listadas com sucesso',
            transactions,
          ),
        )
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'get',
    path: '/wallets',
    summary: 'Listar todas as carteiras de cashback',
    permissions: [PermissionName.MANAGE_SUPPLIERS],
    responses: {
      200: SuccessResponseSchema.create({
        schema: CashbackWalletSchema,
        dataDescription: 'Lista de carteiras de cashback',
        isArray: true,
        message: 'Carteiras listadas com sucesso',
      }),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async getAllWallets(req: AuthenticatedRequest, res: Response) {
    try {
      const wallets = await this.cashbackService.getAllWallets()

      return res
        .status(200)
        .json(createSuccessResponse('Carteiras listadas com sucesso', wallets))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }
}
