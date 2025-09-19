import { Request, Response, NextFunction } from 'express'
import { validate, ValidationError } from 'class-validator'
import { plainToClass } from 'class-transformer'
import { ErrorResponseSchema, ValidationErrorResponseSchema } from '@/models'

export function validationMiddleware<T>(type: new () => T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToClass(type, req.body)
      const errors = await validate(dto as object)

      if (errors.length > 0) {
        const validationErrors = errors.map((error: ValidationError) => {
          const message = error.constraints
            ? Object.values(error.constraints)[0]
            : 'Erro de validação'

          return {
            field: error.property,
            message,
            value: error.value,
          }
        })

        const response: ValidationErrorResponseSchema = {
          success: false,
          message: 'Dados de entrada inválidos',
          error: { validationErrors },
        }
        return res.status(400).json(response)
      }

      req.body = dto
      next()
    } catch (error) {
      const response: ErrorResponseSchema = {
        success: false,
        message: 'Erro interno do servidor durante a validação',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }
      res.status(500).json(response)
    }
  }
}
