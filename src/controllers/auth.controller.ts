import { Request, Response } from 'express'
import { ApiController, ApiRoute } from '@/decorators'
import { AuthService } from '@/services'
import { PermissionName } from '@/enums'
import { AuthenticatedRequest } from '@/middlewares'
import { createErrorResponse, createSuccessResponse } from '@/utils'
import {
  LoginSchema,
  AuthResponseSchema,
  UserSchema,
  ErrorResponseSchema,
  SuccessResponseSchema,
} from '@/schemas'

@ApiController('/auth', ['Authentication'])
export class AuthController {
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
  }

  @ApiRoute({
    method: 'post',
    path: '/login',
    summary: 'Autenticação de usuário',
    isPublic: true,
    body: LoginSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: AuthResponseSchema,
        dataDescription: 'Dados de autenticação',
        message: 'Login realizado com sucesso',
      }),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async login(loginData: LoginSchema, req: Request, res: Response) {
    try {
      const authResult = await this.authService.login(loginData)

      return res
        .status(200)
        .json(createSuccessResponse('Login realizado com sucesso', authResult))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'post',
    path: '/register',
    summary: 'Cadastro de novo usuário',
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
  async register(
    userData: UserSchema,
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
      const currentUser = req.user!
      const createdByUserId = currentUser.id

      const newUser = await this.authService.register(userData, createdByUserId)

      return res
        .status(201)
        .json(createSuccessResponse('Usuário criado com sucesso', newUser))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'get',
    path: '/profile',
    summary: 'Obter perfil do usuário autenticado',
    responses: {
      200: SuccessResponseSchema.create({
        schema: UserSchema,
        dataDescription: 'Dados do perfil do usuário',
        message: 'Perfil obtido com sucesso',
      }),
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const currentUser = req.user!
      const userProfile = await this.authService.getUserProfile(currentUser.id)

      return res
        .status(200)
        .json(createSuccessResponse('Perfil obtido com sucesso', userProfile))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }
}
