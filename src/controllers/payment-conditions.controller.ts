import { ApiController, ApiRoute } from '@/decorators'
import {
  PaymentConditionSchema,
  ErrorResponseSchema,
  SuccessResponseSchema,
  IdParamSchema,
  PaymentConditionFiltersSchema,
} from '@/schemas'
import { createSuccessResponse, createErrorResponse } from '@/utils'
import { Request, Response } from 'express'
import { PaymentConditionsService } from '@/services'

@ApiController('/payment-conditions', ['PaymentConditions'])
export class PaymentConditionsController {
  private service: PaymentConditionsService

  constructor() {
    this.service = new PaymentConditionsService()
  }

  @ApiRoute({
    method: 'post',
    path: '/',
    summary: 'Cadastra uma nova condição de pagamento',
    body: PaymentConditionSchema,
    responses: {
      201: SuccessResponseSchema.create({
        schema: PaymentConditionSchema,
        dataDescription: 'Condição de pagamento cadastrada',
        message: 'Condição de pagamento cadastrada com sucesso',
      }),
      400: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async createPaymentCondition(
    body: PaymentConditionSchema,
    req: Request,
    res: Response,
  ) {
    try {
      const created = await this.service.create(body)
      return res
        .status(201)
        .json(
          createSuccessResponse(
            'Condição de pagamento cadastrada com sucesso',
            created,
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
    path: '/',
    summary: 'Lista condições de pagamento',
    query: PaymentConditionFiltersSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: PaymentConditionSchema,
        dataDescription: 'Lista de condições',
        isArray: true,
        message: 'Condições de pagamento listadas com sucesso',
      }),
      400: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async listPaymentConditions(req: Request, res: Response) {
    try {
      const filters = req.query as PaymentConditionFiltersSchema
      const items = await this.service.list(filters)
      return res
        .status(200)
        .json(
          createSuccessResponse(
            'Condições de pagamento listadas com sucesso',
            items,
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
    path: '/:id',
    summary: 'Obtém condição de pagamento por ID',
    params: IdParamSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: PaymentConditionSchema,
        dataDescription: 'Condição de pagamento',
        message: 'Condição de pagamento encontrada com sucesso',
      }),
      400: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async getPaymentConditionById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const item = await this.service.getById(id)
      return res
        .status(200)
        .json(
          createSuccessResponse(
            'Condição de pagamento encontrada com sucesso',
            item,
          ),
        )
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'put',
    path: '/:id',
    summary: 'Atualiza uma condição de pagamento',
    params: IdParamSchema,
    body: PaymentConditionSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: PaymentConditionSchema,
        dataDescription: 'Condição de pagamento atualizada',
        message: 'Condição de pagamento atualizada com sucesso',
      }),
      400: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async updatePaymentCondition(
    body: Partial<PaymentConditionSchema>,
    req: Request,
    res: Response,
  ) {
    try {
      const { id } = req.params
      const updated = await this.service.update(id, body)
      return res
        .status(200)
        .json(
          createSuccessResponse(
            'Condição de pagamento atualizada com sucesso',
            updated,
          ),
        )
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'delete',
    path: '/:id',
    summary: 'Apaga uma condição de pagamento',
    params: IdParamSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: PaymentConditionSchema,
        dataDescription: 'Condição de pagamento removida',
        message: 'Condição de pagamento apagada com sucesso',
      }),
      400: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async deletePaymentCondition(req: Request, res: Response) {
    try {
      const { id } = req.params
      await this.service.delete(id)
      return res
        .status(200)
        .json(
          createSuccessResponse(
            'Condição de pagamento apagada com sucesso',
            true,
          ),
        )
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }
}



