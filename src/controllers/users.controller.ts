//LEGENDA
// ESTA FUNCIONANDO -> 🟢
// NÃO ESTA FUNCIONANDO -> 🔴
import { Response } from 'express'
import { ApiController, ApiRoute } from '@/decorators'
import { PermissionName } from '@/enums'
import { AuthenticatedRequest } from '@/middlewares'
import { createErrorResponse, createSuccessResponse } from '@/utils'
import {
  UserSchema,
  ErrorResponseSchema,
  SuccessResponseSchema,
  PermissionSchema,
} from '@/schemas'
import { UsersService } from '@/services/users.service'

const usersService = new UsersService()

@ApiController('/users', ['Users'])
export class UsersController {

  // BUSCAR USUÁRIOS COM FILTROS 🟢
  @ApiRoute({
    method: 'get',
    path: '/',
    summary: 'Buscar usuário usando filtros',
    permissions: [PermissionName.MANAGE_USERS],
    responses: {
      200: SuccessResponseSchema.create({
        schema: UserSchema,
        dataDescription: 'Lista de usuários',
        message: 'Usuários obtidos com sucesso',
      }),
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async getUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const { status, roleId, organizationId } = req.query

      const users = await usersService.getUsers({
        status: status as string | undefined,
        roleId: roleId as string | undefined,
        organizationId: organizationId as string | undefined,
      })

      return res.status(200).json(createSuccessResponse('Usuários obtidos com sucesso', users))
    } catch (error: any) {
      return res.status(error.statusCode || 500).json(createErrorResponse(error.message, error.errorCode))
    }
  }

  // BUSCAR USUÁRIOS POR ID 🟢
    @ApiRoute({
    method: 'get',
    path: '/:id',
    summary: 'Obter usuário específico',
    permissions: [PermissionName.MANAGE_USERS],
    responses: {
      200: SuccessResponseSchema.create({
        schema: UserSchema,
        isArray: true,
        dataDescription: 'Dados do usuário',
        message: 'Usuário obtido com sucesso',
      }),
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async getUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const user = await usersService.getUserById(id)

      if (!user) {
        return res.status(404).json(createErrorResponse('Usuário não encontrado', 'USER_NOT_FOUND'))
      }

      return res.status(200).json(createSuccessResponse('Usuário obtido com sucesso', user))
    } catch (error: any) {
      return res.status(error.statusCode || 500).json(createErrorResponse(error.message, error.errorCode))
    }
  }

  // CRIAR NOVO USUÁRIO 🟢
    @ApiRoute({
    method: 'post',
    path: '/',
    summary: 'Criar novo usuário',
    permissions: [PermissionName.MANAGE_USERS],
    body: UserSchema,
    responses: {
      201: SuccessResponseSchema.create({
        schema: UserSchema,
        dataDescription: 'Dados do usuário criado',
        message: 'Usuário criado com sucesso',
      }),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      409: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
    async createUser(req: AuthenticatedRequest, res: Response) {
    try {
      const currentUser = req.user!
      const userData = req.body as UserSchema
      const newUser = await usersService.createUser(userData, currentUser.id)

      return res.status(201).json(createSuccessResponse('Usuário criado com sucesso', newUser))
    } catch (error: any) {
      return res.status(error.statusCode || 500).json(createErrorResponse(error.message, error.errorCode))
    }
  }

  // ATUALIZAR USUÁRIO 🟢
  @ApiRoute({
    method: 'put',
    path: '/:id',
    summary: 'Atualizar dados do usuário',
    permissions: [PermissionName.MANAGE_USERS],
    body: UserSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: UserSchema,
        dataDescription: 'Dados do usuário atualizado',
        message: 'Usuário atualizado com sucesso',
      }),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async updateUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const currentUser = req.user!
      const userData = req.body as UserSchema

      const updatedUser = await usersService.updateUser(id, currentUser.organizationId!, userData)

      if (!updatedUser) {
        return res.status(404).json(createErrorResponse('Usuário não encontrado', 'USER_NOT_FOUND'))
      }

      return res.status(200).json(createSuccessResponse('Usuário atualizado com sucesso', updatedUser))
    } catch (error: any) {
      return res.status(error.statusCode || 500).json(createErrorResponse(error.message, error.errorCode))
    }
  }

  // ATUALIZAR STATUS DO USUÁRIO 🟢
  @ApiRoute({
    method: 'patch',
    path: '/:id/status',
    summary: 'Alterar status ativo/inativo do usuário',
    permissions: [PermissionName.MANAGE_USERS],
    body: UserSchema, 
    responses: {
      200: SuccessResponseSchema.create({
        schema: UserSchema,
        dataDescription: 'Dados do usuário com status atualizado',
        message: 'Status do usuário atualizado com sucesso',
      }),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async updateUserStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const { status } = req.body
      const currentUser = req.user!

      const updatedUser = await usersService.updateStatus(id, status, currentUser.id)

      if (!updatedUser) {
        return res.status(404).json(createErrorResponse('Usuário não encontrado', 'USER_NOT_FOUND'))
      }

      return res.status(200).json(createSuccessResponse('Status do usuário atualizado com sucesso', updatedUser))
    } catch (error: any) {
      return res.status(error.statusCode || 500).json(createErrorResponse(error.message, error.errorCode))
    }
  }

  // DELETAR USUÁRIO 🟢
  @ApiRoute({
    method: 'delete',
    path: '/:id',
    summary: 'Deletar usuário',
    permissions: [PermissionName.MANAGE_USERS],
    responses: {
      200: SuccessResponseSchema.create({
        schema: UserSchema,
        dataDescription: 'Confirmação de exclusão',
        message: 'Usuário deletado com sucesso',
        }),
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      404: ErrorResponseSchema,
      409: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async deleteUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const currentUser = req.user!

      const result = await usersService.deleteUser(id, currentUser.id)

      if (result === 'inactivated') {
        return res.status(200).json(createSuccessResponse('Usuário inativado devido a vínculos existentes', null))
      }

      return res.status(200).json(createSuccessResponse('Usuário deletado com sucesso', null))
    } catch (error: any) {
      return res.status(error.statusCode || 500).json(createErrorResponse(error.message, error.errorCode))
    }
  }

  // OBTER PERMISSÕES DO USUÁRIO 🟢
  @ApiRoute({
    method: 'get',
    path: '/:id/permissions',
    summary: 'Obter permissões do usuário',
    permissions: [PermissionName.MANAGE_USERS],
    responses: {
      200: SuccessResponseSchema.create({
        schema: PermissionSchema,
        isArray: true,
        dataDescription: 'Lista de permissões do usuário',
        message: 'Permissões obtidas com sucesso',
      }),
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async getUserPermissions(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const currentUser = req.user!

      const permissions = await usersService.getUserPermissions(id, currentUser.organizationId!)

      return res.status(200).json(createSuccessResponse('Permissões obtidas com sucesso', permissions))
    } catch (error: any) {
      return res.status(error.statusCode || 500).json(createErrorResponse(error.message, error.errorCode))
    }
  }
}
