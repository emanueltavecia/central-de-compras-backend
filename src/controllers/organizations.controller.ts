import { Request, Response } from 'express'
import { ApiController, ApiRoute } from '@/decorators'
import { OrgType, PermissionName, UserRole } from '@/enums'
import { AuthenticatedRequest } from '@/middlewares'
import {
  OrganizationSchema,
  OrganizationFiltersSchema,
  UpdateOrganizationStatusSchema,
  ErrorResponseSchema,
  SuccessResponseSchema,
  UserSchema,
  IdParamSchema,
} from '@/schemas'
import { OrganizationsService } from '@/services'
import { createErrorResponse, createSuccessResponse } from '@/utils'

@ApiController('/organizations', ['Organizations'])
export class OrganizationsController {
  private service = new OrganizationsService()

  @ApiRoute({
    method: 'get',
    path: '/',
    summary: 'Listar organizações',
    query: OrganizationFiltersSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: OrganizationSchema,
        isArray: true,
        dataDescription: 'Lista de organizações',
        message: 'Organizações obtidas com sucesso',
      }),
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async getOrganizations(req: AuthenticatedRequest, res: Response) {
    try {
      const { type, active } = req.query as OrganizationFiltersSchema
      const currentUser = req.user!

      let filters: OrganizationFiltersSchema = {}

      if (currentUser.role?.name === UserRole.ADMIN) {
        filters = {
          type: type,
          active,
        }
      } else if (currentUser.role?.name === UserRole.STORE) {
        filters = {
          type: OrgType.SUPPLIER,
          active,
        }
      } else {
        return res
          .status(403)
          .json(
            createErrorResponse(
              'Você não tem permissão para listar organizações.',
              'FORBIDDEN_ACCESS',
            ),
          )
      }

      const organizations = await this.service.getOrganizations(filters)

      return res
        .status(200)
        .json(
          createSuccessResponse(
            'Organizações obtidas com sucesso',
            organizations,
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
    summary: 'Obter organização específica',
    params: IdParamSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: OrganizationSchema,
        dataDescription: 'Dados da organização',
        message: 'Organização obtida com sucesso',
      }),
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async getOrganization(req: Request, res: Response) {
    try {
      const { id } = req.params
      const organization = await this.service.getOrganizationById(id)

      return res
        .status(200)
        .json(
          createSuccessResponse('Organização obtida com sucesso', organization),
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
    summary: 'Criar nova organização',
    permissions: [PermissionName.MANAGE_ORGANIZATIONS],
    body: OrganizationSchema,
    responses: {
      201: SuccessResponseSchema.create({
        schema: OrganizationSchema,
        dataDescription: 'Dados da organização criada',
        message: 'Organização criada com sucesso',
      }),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      409: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async createOrganization(
    organizationData: OrganizationSchema,
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
      const currentUser = req.user!

      const newOrganization = await this.service.createOrganization(
        organizationData,
        currentUser.id,
      )

      return res
        .status(201)
        .json(
          createSuccessResponse(
            'Organização criada com sucesso',
            newOrganization,
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
    summary: 'Atualizar organização',
    permissions: [PermissionName.MANAGE_ORGANIZATIONS],
    params: IdParamSchema,
    body: OrganizationSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: OrganizationSchema,
        dataDescription: 'Dados da organização atualizada',
        message: 'Organização atualizada com sucesso',
      }),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async updateOrganization(
    organizationData: OrganizationSchema,
    req: Request,
    res: Response,
  ) {
    try {
      const { id } = req.params

      const updatedOrganization = await this.service.updateOrganization(
        id,
        organizationData,
      )

      return res
        .status(200)
        .json(
          createSuccessResponse(
            'Organização atualizada com sucesso',
            updatedOrganization,
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
    summary: 'Deletar organização',
    permissions: [PermissionName.MANAGE_ORGANIZATIONS],
    params: IdParamSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: OrganizationSchema,
        dataDescription: 'Confirmação de exclusão',
        message: 'Organização deletada ou inativada com sucesso',
      }),
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      404: ErrorResponseSchema,
      409: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async deleteOrganization(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result = await this.service.deleteOrganization(id)

      const message = result.deleted
        ? 'Organização deletada com sucesso'
        : 'Organização inativada pois possui vínculos'

      return res.status(200).json(createSuccessResponse(message, null))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'patch',
    path: '/:id/status',
    summary: 'Alterar status ativo/inativo da organização',
    permissions: [PermissionName.MANAGE_ORGANIZATIONS],
    params: IdParamSchema,
    body: UpdateOrganizationStatusSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: OrganizationSchema,
        dataDescription: 'Dados da organização com status atualizado',
        message: 'Status da organização atualizado com sucesso',
      }),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async updateOrganizationStatus(
    statusData: UpdateOrganizationStatusSchema,
    req: Request,
    res: Response,
  ) {
    try {
      const { id } = req.params
      const { active } = statusData

      const updatedOrganization = await this.service.updateOrganizationStatus(
        id,
        active,
      )

      return res
        .status(200)
        .json(
          createSuccessResponse(
            'Status da organização atualizado com sucesso',
            updatedOrganization,
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
    path: '/:id/users',
    summary: 'Listar usuários da organização',
    params: IdParamSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: UserSchema,
        isArray: true,
        dataDescription: 'Lista de usuários da organização',
        message: 'Usuários da organização obtidos com sucesso',
      }),
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async getOrganizationUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const currentUser = req.user!

      if (
        currentUser.role.name !== UserRole.ADMIN &&
        currentUser.organizationId !== id
      ) {
        return res
          .status(403)
          .json(
            createErrorResponse(
              'Você não tem permissão para listar usuários de outra organização.',
              'FORBIDDEN_ACCESS',
            ),
          )
      }

      const users = await this.service.getOrganizationUsers(id)

      return res
        .status(200)
        .json(
          createSuccessResponse(
            'Usuários da organização obtidos com sucesso',
            users,
          ),
        )
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }
}
