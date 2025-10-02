import { Response } from 'express'
import { ApiController, ApiRoute } from '@/decorators'
import { PermissionName, UserAccountStatus } from '@/enums'
import { AuthenticatedRequest } from '@/middlewares'
import { createErrorResponse, createSuccessResponse } from '@/utils'
import {
    UserSchema,
    ErrorResponseSchema,
    SuccessResponseSchema,
} from '@/schemas'
import { UsersRepository } from '@/repository/users.repository'
import bcrypt from 'bcryptjs'

const usersRepository = new UsersRepository()

@ApiController('/users', ['Users'])
export class UsersController {
  @ApiRoute({
    method: 'get',
    path: '/',
    summary: 'Listar usuários da organização do usuário logado',
    permissions: [PermissionName.MANAGE_USERS],
    responses: {
      200: SuccessResponseSchema.create({
        schema: UserSchema,
        dataDescription: 'Lista de usuários da organização',
        message: 'Usuários obtidos com sucesso',
      }),
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async getUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const currentUser = req.user!
      const { status, roleId } = req.query

      const users = await usersRepository.findAllByOrganization(
        currentUser.organizationId!,
        {
          status: status as string | undefined,
          roleId: roleId as string | undefined,
        },
      )

      return res
        .status(200)
        .json(createSuccessResponse('Usuários obtidos com sucesso', users))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

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
      const currentUser = req.user!

      const user = await usersRepository.findById(id, currentUser.organizationId!)
      if (!user) {
        return res
          .status(404)
          .json(createErrorResponse('Usuário não encontrado', 'USER_NOT_FOUND'))
      }

      return res
        .status(200)
        .json(createSuccessResponse('Usuário obtido com sucesso', user))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'post',
    path: '/',
    summary: 'Criar novo usuário na organização',
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

      const emailExists = await usersRepository.checkEmailExists(userData.email)
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'E-mail já está em uso',
          errorCode: 'EMAIL_EXISTS',
          data: null,
        })
      }

      const hashedPassword = await bcrypt.hash(userData.password!, 12)

      const newUser = await usersRepository.create(
        {
          ...userData,
          password: hashedPassword,
          organizationId: currentUser.organizationId!,
          status: UserAccountStatus.ACTIVE,
        },
        currentUser.id,
      )

      return res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: newUser,
      })
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
        errorCode: error.errorCode,
        data: null,
      })
    }
  }

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

      if (userData.email) {
        const emailExists = await usersRepository.checkEmailExists(userData.email)
        if (emailExists) {
          return res
            .status(409)
            .json(createErrorResponse('E-mail já está em uso', 'EMAIL_EXISTS'))
        }
      }

      let dataToUpdate: Partial<UserSchema> = { ...userData }
      if (userData.password) {
        dataToUpdate.password = await bcrypt.hash(userData.password, 12)
      }

      const updatedUser = await usersRepository.update(
        id,
        currentUser.organizationId!,
        dataToUpdate,
      )

      if (!updatedUser) {
        return res
          .status(404)
          .json(createErrorResponse('Usuário não encontrado', 'USER_NOT_FOUND'))
      }

      return res
        .status(200)
        .json(createSuccessResponse('Usuário atualizado com sucesso', updatedUser))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

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

      if (id === currentUser.id) {
        return res
          .status(400)
          .json(createErrorResponse('Não é possível alterar seu próprio status', 'CANNOT_SELF_DISABLE'))
      }

      const updatedUser = await usersRepository.updateStatus(
        id,
        currentUser.organizationId!,
        status,
      )

      if (!updatedUser) {
        return res
          .status(404)
          .json(createErrorResponse('Usuário não encontrado', 'USER_NOT_FOUND'))
      }

      return res
        .status(200)
        .json(createSuccessResponse('Status do usuário atualizado com sucesso', updatedUser))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

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

      if (id === currentUser.id) {
        return res
          .status(400)
          .json(createErrorResponse('Não é possível excluir a si mesmo', 'CANNOT_SELF_DELETE'))
      }

      await usersRepository.delete(id, currentUser.organizationId!)

      return res
        .status(200)
        .json(createSuccessResponse('Usuário deletado com sucesso', null))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'patch',
    path: '/:id/password',
    summary: 'Alterar senha do usuário',
    permissions: [PermissionName.MANAGE_USERS],
    body: UserSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: UserSchema,
        dataDescription: 'Confirmação de alteração de senha',
        message: 'Senha alterada com sucesso',
      }),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async updateUserPassword(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const { newPassword } = req.body
      const currentUser = req.user!

      const hashedPassword = await bcrypt.hash(newPassword, 12)
      await usersRepository.updatePassword(id, currentUser.organizationId!, hashedPassword)

      return res
        .status(200)
        .json(createSuccessResponse('Senha alterada com sucesso', null))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'get',
    path: '/:id/permissions',
    summary: 'Obter permissões do usuário',
    permissions: [PermissionName.MANAGE_USERS],
    responses: {
      200: SuccessResponseSchema.create({
        schema: UserSchema, 
        dataDescription: 'Confirmação de permissão de usuário',
        message: 'Permissão do usuário acessada com sucesso',
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

      const permissions = await usersRepository.getUserPermissions(
        id,
        currentUser.organizationId!,
      )

      return res
        .status(200)
        .json(createSuccessResponse('Permissões obtidas com sucesso', permissions))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }
}
