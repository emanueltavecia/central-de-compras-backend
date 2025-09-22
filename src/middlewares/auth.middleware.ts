import { Request, Response, NextFunction } from 'express'
import { AuthService } from '@/services'
import { UserSchema } from '@/schemas'
import { PermissionName } from '@/enums'
import { createErrorResponse } from '@/utils'

export interface AuthenticatedRequest extends Request {
  user?: UserSchema
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso é obrigatório',
        error: 'UNAUTHORIZED',
      })
    }

    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso inválido',
        error: 'UNAUTHORIZED',
      })
    }

    const authService = new AuthService()
    const decoded = authService.verifyToken(token)

    req.user = decoded
    next()
  } catch (error: any) {
    return res
      .status(error.statusCode)
      .json(
        createErrorResponse(
          error.message || 'Token de acesso inválido ou expirado',
          error.errorCode || 'UNAUTHORIZED',
        ),
      )
  }
}

export function requirePermission(permission: PermissionName) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res
        .status(401)
        .json(createErrorResponse('Usuário não autenticado', 'UNAUTHORIZED'))
    }

    const userPermissions = req.user.role.permissions.map((p) => p.name)

    if (!userPermissions.includes(permission)) {
      return res
        .status(403)
        .json(
          createErrorResponse(
            'Você não tem permissão para acessar este recurso',
            'FORBIDDEN',
          ),
        )
    }

    next()
  }
}
