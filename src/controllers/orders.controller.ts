import { Response } from 'express'
import { ApiController, ApiRoute } from '@/decorators'
import { OrdersService } from '@/services'
import { createErrorResponse, createSuccessResponse } from '@/utils'
import { AuthenticatedRequest } from '@/middlewares'
import { PermissionName } from '@/enums'
import {
  OrderSchema,
  OrderFiltersSchema,
  OrderCalculationRequestSchema,
  OrderCalculationResponseSchema,
  ErrorResponseSchema,
  SuccessResponseSchema,
  IdParamSchema,
} from '@/schemas'

@ApiController('/orders', ['Orders'])
export class OrdersController {
  private ordersService: OrdersService

  constructor() {
    this.ordersService = new OrdersService()
  }

  @ApiRoute({
    method: 'post',
    path: '/',
    summary: 'Cadastrar um novo pedido',
    body: OrderSchema,
    permissions: [PermissionName.CREATE_ORDERS],
    responses: {
      201: SuccessResponseSchema.create({
        schema: OrderSchema,
        dataDescription: 'Dados do pedido cadastrado',
        message: 'Pedido cadastrado com sucesso',
      }),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async createOrder(
    orderData: OrderSchema,
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
      const createdOrder = await this.ordersService.createOrder(
        orderData,
        req.user?.id,
      )

      return res
        .status(201)
        .json(
          createSuccessResponse('Pedido cadastrado com sucesso', createdOrder),
        )
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'get',
    path: '/',
    summary: 'Listar todos os pedidos com filtros',
    query: OrderFiltersSchema,
    permissions: [PermissionName.VIEW_ORDERS],
    responses: {
      200: SuccessResponseSchema.create({
        schema: OrderSchema,
        dataDescription: 'Lista de pedidos',
        isArray: true,
        message: 'Pedidos listados com sucesso',
      }),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async getAllOrders(req: AuthenticatedRequest, res: Response) {
    try {
      const filters = req.query as OrderFiltersSchema
      const orders = await this.ordersService.getAllOrders(filters)

      return res
        .status(200)
        .json(createSuccessResponse('Pedidos listados com sucesso', orders))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'get',
    path: '/:id',
    summary: 'Buscar pedido por ID',
    params: IdParamSchema,
    permissions: [PermissionName.VIEW_ORDERS],
    responses: {
      200: SuccessResponseSchema.create({
        schema: OrderSchema,
        dataDescription: 'Dados do pedido',
        message: 'Pedido encontrado',
      }),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async getOrderById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const order = await this.ordersService.getOrderById(id)

      return res
        .status(200)
        .json(createSuccessResponse('Pedido encontrado', order))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'post',
    path: '/calculate',
    summary: 'Calcular valores do pedido antes de finalizar',
    body: OrderCalculationRequestSchema,
    permissions: [PermissionName.CREATE_ORDERS],
    responses: {
      200: SuccessResponseSchema.create({
        schema: OrderCalculationResponseSchema,
        dataDescription: 'Valores calculados do pedido',
        message: 'Valores calculados com sucesso',
      }),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async calculateOrderValues(
    calculationData: OrderCalculationRequestSchema,
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
      const calculatedValues =
        await this.ordersService.calculateOrderValues(calculationData)

      return res
        .status(200)
        .json(
          createSuccessResponse(
            'Valores calculados com sucesso',
            calculatedValues,
          ),
        )
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }
}
