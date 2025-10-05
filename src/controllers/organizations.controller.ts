import { ApiController, ApiRoute } from '@/decorators'
import { PermissionName } from '@/enums'
import { AuthenticatedRequest } from '@/middlewares'
import {
  OrganizationSchema,
  ErrorResponseSchema,
  SuccessResponseSchema,
  UserSchema,
} from '@/schemas'
import { OrganizationsService } from '@/services'

@ApiController('/organizations', ['Organizations'])
export class OrganizationsController {
  private service = new OrganizationsService()

  @ApiRoute({
    method: 'get',
    path: '/',
    summary: 'Listar organizações',
    permissions: [PermissionName.VIEW_ORGANIZATIONS],
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
  async getOrganizations(req: AuthenticatedRequest) {
    const { type, active } = req.query
    const currentUser = req.user!

    const activeFilter = active !== undefined ? active === 'true' : undefined

    let filters: { type?: string; active?: boolean } = {}

    if (currentUser.role?.name === 'admin') {
      filters = {
        type: type as string,
        active: activeFilter,
      }
    } else if (currentUser.role?.name === 'store') {
      filters = {
        type: 'supplier',
        active: activeFilter,
      }
    } else {
      return {
        success: false,
        message: 'Você não tem permissão para listar organizações.',
        error: 'FORBIDDEN_ACCESS',
      }
    }

    const organizations = await this.service.getOrganizations(filters)

    return {
      success: true,
      message: 'Organizações obtidas com sucesso',
      data: organizations,
    }
  }

  @ApiRoute({
    method: 'get',
    path: '/:id',
    summary: 'Obter organização específica',
    permissions: [PermissionName.VIEW_ORGANIZATIONS],
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
  async getOrganization(req: AuthenticatedRequest) {
    const { id } = req.params
    const organization = await this.service.getOrganizationById(id)

    if (!organization) {
      return {
        success: false,
        message: 'Organização não encontrada',
        error: 'ORGANIZATION_NOT_FOUND',
      }
    }

    return {
      success: true,
      message: 'Organização obtida com sucesso',
      data: organization,
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
  async createOrganization(req: AuthenticatedRequest) {
    const organizationData = req.body as OrganizationSchema
    const currentUser = req.user!

    const newOrganization = await this.service.createOrganization(
      organizationData,
      currentUser.id,
    )

    return {
      success: true,
      message: 'Organização criada com sucesso',
      data: newOrganization,
    }
  }

  @ApiRoute({
    method: 'put',
    path: '/:id',
    summary: 'Atualizar organização',
    permissions: [PermissionName.MANAGE_ORGANIZATIONS],
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
  async updateOrganization(req: AuthenticatedRequest) {
    const { id } = req.params
    const organizationData = req.body as OrganizationSchema

    const updatedOrganization = await this.service.updateOrganization(
      id,
      organizationData,
    )

    return {
      success: true,
      message: 'Organização atualizada com sucesso',
      data: updatedOrganization,
    }
  }

  @ApiRoute({
    method: 'delete',
    path: '/:id',
    summary: 'Deletar organização',
    permissions: [PermissionName.MANAGE_ORGANIZATIONS],
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
  async deleteOrganization(req: AuthenticatedRequest) {
    const { id } = req.params
    const result = await this.service.deleteOrganization(id)

    const message = result.deleted
      ? 'Organização deletada com sucesso'
      : 'Organização inativada pois possui vínculos'

    return {
      success: true,
      message,
      data: null,
    }
  }

  @ApiRoute({
    method: 'patch',
    path: '/:id/status',
    summary: 'Alterar status ativo/inativo da organização',
    permissions: [PermissionName.MANAGE_ORGANIZATIONS],
    body: class {
      active: boolean
    },
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
  async updateOrganizationStatus(req: AuthenticatedRequest) {
    const { id } = req.params
    const { active } = req.body
    const updatedOrganization = await this.service.updateOrganizationStatus(
      id,
      active,
    )

    return {
      success: true,
      message: 'Status da organização atualizado com sucesso',
      data: updatedOrganization,
    }
  }

  @ApiRoute({
    method: 'get',
    path: '/:id/users',
    summary: 'Listar usuários da organização',
    permissions: [
      PermissionName.VIEW_ORGANIZATIONS,
      PermissionName.MANAGE_USERS,
    ],
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
  async getOrganizationUsers(req: AuthenticatedRequest) {
    const { id } = req.params
    const currentUser = req.user!

    if (
      currentUser.role.name !== 'admin' &&
      currentUser.organizationId !== id
    ) {
      return {
        success: false,
        message:
          'Você não tem permissão para listar usuários de outra organização.',
        error: 'FORBIDDEN_ACCESS',
      }
    }

    const users = await this.service.getOrganizationUsers(id)

    return {
      success: true,
      message: 'Usuários da organização obtidos com sucesso',
      data: users,
    }
  }
}
