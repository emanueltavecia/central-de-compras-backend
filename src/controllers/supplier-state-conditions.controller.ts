import { Response } from 'express'
import { ApiController, ApiRoute } from '@/decorators'
import { PermissionName } from '@/enums'
import { AuthenticatedRequest } from '@/middlewares'
import {
  SupplierStateConditionSchema,
  ErrorResponseSchema,
  SuccessResponseSchema,
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
    permissions: [PermissionName.VIEW_SUPPLIER_CONDITIONS],
    responses: {
      200: SuccessResponseSchema.create({
        schema: SupplierStateConditionSchema,
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
      const { supplierOrgId, state } = req.query

      const conditions = await this.service.getAll(currentUser, {
        supplierOrgId: supplierOrgId as string | undefined,
        state: state as string | undefined,
      })

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
    permissions: [PermissionName.VIEW_SUPPLIER_CONDITIONS],
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
      if (!condition) {
        return res
          .status(404)
          .json(
            createErrorResponse(
              'Condição não encontrada',
              'CONDITION_NOT_FOUND',
            ),
          )
      }

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
  async createSupplierStateCondition(req: AuthenticatedRequest, res: Response) {
    try {
      const conditionData = req.body as SupplierStateConditionSchema

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
  async updateSupplierStateCondition(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const conditionData = req.body as SupplierStateConditionSchema
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
    permissions: [PermissionName.VIEW_SUPPLIER_CONDITIONS],
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

      if (!condition) {
        return res
          .status(404)
          .json(
            createErrorResponse(
              'Condições não encontradas para este fornecedor e estado',
              'CONDITIONS_NOT_FOUND',
            ),
          )
      }

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
