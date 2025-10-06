import { Response } from 'express'
import { ApiController, ApiRoute } from '@/decorators'
import { PermissionName } from '@/enums'
import { AuthenticatedRequest } from '@/middlewares'
import {
  SupplierStateConditionSchema,
  SupplierStateConditionFiltersSchema,
  SupplierStateParamsSchema,
  ErrorResponseSchema,
  SuccessResponseSchema,
  IdParamSchema,
} from '@/schemas'
import { createErrorResponse, createSuccessResponse } from '@/utils'
import { SupplierStateConditionsService } from '@/services'

@ApiController('/supplier-state-conditions', ['Supplier State Conditions'])
export class SupplierStateConditionsController {
  private service = new SupplierStateConditionsService()

  @ApiRoute({
    method: 'get',
    path: '/',
    summary: 'Listar condições por estado do fornecedor',
    query: SupplierStateConditionFiltersSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: SupplierStateConditionSchema,
        isArray: true,
        dataDescription: 'Lista de condições por estado',
        message: 'Condições obtidas com sucesso',
      }),
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async getSupplierStateConditions(req: AuthenticatedRequest, res: Response) {
    try {
      const currentUser = req.user!
      const filters = req.query as SupplierStateConditionFiltersSchema

      const conditions = await this.service.getAll(currentUser, filters)

      return res
        .status(200)
        .json(
          createSuccessResponse('Condições obtidas com sucesso', conditions),
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
    summary: 'Obter condição por estado específica',
    params: IdParamSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: SupplierStateConditionSchema,
        dataDescription: 'Dados da condição por estado',
        message: 'Condição obtida com sucesso',
      }),
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async getSupplierStateCondition(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const currentUser = req.user!

      const condition = await this.service.getById(id, currentUser)

      return res
        .status(200)
        .json(createSuccessResponse('Condição obtida com sucesso', condition))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'post',
    path: '/',
    summary: 'Criar nova condição por estado',
    permissions: [PermissionName.MANAGE_SUPPLIER_CONDITIONS],
    body: SupplierStateConditionSchema,
    responses: {
      201: SuccessResponseSchema.create({
        schema: SupplierStateConditionSchema,
        dataDescription: 'Dados da condição criada',
        message: 'Condição criada com sucesso',
      }),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      409: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async createSupplierStateCondition(
    conditionData: SupplierStateConditionSchema,
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
      const newCondition = await this.service.create(conditionData)

      return res
        .status(201)
        .json(
          createSuccessResponse('Condição criada com sucesso', newCondition),
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
    summary: 'Atualizar condição por estado',
    permissions: [PermissionName.MANAGE_SUPPLIER_CONDITIONS],
    params: IdParamSchema,
    body: SupplierStateConditionSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: SupplierStateConditionSchema,
        dataDescription: 'Dados da condição atualizada',
        message: 'Condição atualizada com sucesso',
      }),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async updateSupplierStateCondition(
    conditionData: SupplierStateConditionSchema,
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
      const { id } = req.params
      const currentUser = req.user!

      const updatedCondition = await this.service.update(
        id,
        conditionData,
        currentUser,
      )

      return res
        .status(200)
        .json(
          createSuccessResponse(
            'Condição atualizada com sucesso',
            updatedCondition,
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
    summary: 'Deletar condição por estado',
    permissions: [PermissionName.MANAGE_SUPPLIER_CONDITIONS],
    params: IdParamSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: SupplierStateConditionSchema,
        dataDescription: 'Confirmação de exclusão',
        message: 'Condição deletada com sucesso',
      }),
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async deleteSupplierStateCondition(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const currentUser = req.user!

      await this.service.delete(id, currentUser)

      return res
        .status(200)
        .json(createSuccessResponse('Condição deletada com sucesso', null))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'get',
    path: '/by-supplier/:supplierOrgId/state/:state',
    summary: 'Obter condições de um fornecedor para um estado específico',
    params: SupplierStateParamsSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: SupplierStateConditionSchema,
        dataDescription: 'Condições do fornecedor para o estado',
        message: 'Condições obtidas com sucesso',
      }),
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async getConditionsBySupplierAndState(
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
      const { supplierOrgId, state } = req.params

      const condition = await this.service.getBySupplierAndState(
        supplierOrgId,
        state,
      )

      return res
        .status(200)
        .json(createSuccessResponse('Condições obtidas com sucesso', condition))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }
}
