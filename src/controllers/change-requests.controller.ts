import { Response } from 'express'
import { ApiController, ApiRoute } from '@/decorators'
import { ChangeRequestsService } from '@/services'
import { AuthenticatedRequest } from '@/middlewares'
import { createErrorResponse, createSuccessResponse } from '@/utils'
import {
  ChangeRequestSchema,
  CreateChangeRequestSchema,
  ReviewChangeRequestSchema,
  ErrorResponseSchema,
  SuccessResponseSchema,
  IdParamSchema,
} from '@/schemas'
import { ChangeRequestStatus } from '@/enums'

@ApiController('/change-requests', ['Change Requests'])
export class ChangeRequestsController {
  private changeRequestsService: ChangeRequestsService

  constructor() {
    this.changeRequestsService = new ChangeRequestsService()
  }

  @ApiRoute({
    method: 'get',
    path: '/',
    summary: 'Listar todas as solicitações de alteração',
    responses: {
      200: SuccessResponseSchema.create({
        schema: ChangeRequestSchema,
        dataDescription: 'Lista de solicitações de alteração',
        message: 'Solicitações listadas com sucesso',
      }),
      500: ErrorResponseSchema,
    },
  })
  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const { status, organizationId, userId } = req.query

      const changeRequests =
        await this.changeRequestsService.getAllChangeRequests({
          status: status as ChangeRequestStatus,
          organizationId: organizationId as string,
          userId: userId as string,
        })

      return res
        .status(200)
        .json(
          createSuccessResponse(
            'Solicitações listadas com sucesso',
            changeRequests,
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
    path: '/pending-count',
    summary: 'Obter contagem de solicitações pendentes',
    responses: {
      200: SuccessResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async getPendingCount(req: AuthenticatedRequest, res: Response) {
    try {
      const { organizationId } = req.query

      const count = await this.changeRequestsService.getPendingCount(
        organizationId as string,
      )

      return res
        .status(200)
        .json(createSuccessResponse('Contagem obtida com sucesso', { count }))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'get',
    path: '/:id',
    summary: 'Obter solicitação por ID',
    params: IdParamSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: ChangeRequestSchema,
        dataDescription: 'Dados da solicitação',
        message: 'Solicitação obtida com sucesso',
      }),
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async getById(
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
      const { id } = req.params
      
      const changeRequest =
        await this.changeRequestsService.getChangeRequestById(id)

      return res
        .status(200)
        .json(
          createSuccessResponse('Solicitação obtida com sucesso', changeRequest),
        )
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'post',
    path: '/',
    summary: 'Criar nova solicitação de alteração',
    body: CreateChangeRequestSchema,
    responses: {
      201: SuccessResponseSchema.create({
        schema: ChangeRequestSchema,
        dataDescription: 'Solicitação criada',
        message: 'Solicitação criada com sucesso',
      }),
      400: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async create(
    data: CreateChangeRequestSchema,
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
      const currentUser = req.user!

      const changeRequest = await this.changeRequestsService.createChangeRequest(
        currentUser.id,
        currentUser.organizationId,
        data,
      )

      return res
        .status(201)
        .json(
          createSuccessResponse('Solicitação criada com sucesso', changeRequest),
        )
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'patch',
    path: '/:id/review',
    summary: 'Revisar solicitação (aprovar ou rejeitar)',
    params: IdParamSchema,
    body: ReviewChangeRequestSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: ChangeRequestSchema,
        dataDescription: 'Solicitação revisada',
        message: 'Solicitação revisada com sucesso',
      }),
      400: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async review(
    data: ReviewChangeRequestSchema,
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
      const { id } = req.params
      const currentUser = req.user!

      const changeRequest = await this.changeRequestsService.reviewChangeRequest(
        id,
        currentUser.id,
        data,
      )

      return res
        .status(200)
        .json(
          createSuccessResponse(
            'Solicitação revisada com sucesso',
            changeRequest,
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
    summary: 'Deletar solicitação',
    params: IdParamSchema,
    responses: {
      200: SuccessResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async delete(
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
      const { id } = req.params
      
      await this.changeRequestsService.deleteChangeRequest(id)

      return res
        .status(200)
        .json(
          createSuccessResponse('Solicitação deletada com sucesso', null),
        )
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }
}
