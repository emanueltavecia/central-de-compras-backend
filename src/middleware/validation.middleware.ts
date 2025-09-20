import { Request, Response, NextFunction } from 'express'
import { validate, ValidationError } from 'class-validator'
import { plainToClass } from 'class-transformer'
import { ErrorResponseSchema, ValidationErrorResponseSchema } from '@/schemas'
import { REGEX } from '@/utils'

function formatValidationErrors(errors: ValidationError[]): any[] {
  const formattedErrors: any[] = []

  function processError(error: ValidationError, parentPath = '') {
    const fieldPath = parentPath
      ? `${parentPath}.${error.property}`
      : error.property

    if (error.constraints) {
      const message = Object.values(error.constraints)[0] || 'Erro de validação'

      if (parentPath && REGEX.ARRAY_INDEX_PATH.test(parentPath)) {
        const arrayPath = parentPath.replace(REGEX.ARRAY_INDEX_PATH, '')
        const index = parentPath.match(REGEX.CAPTURE_ARRAY_INDEX)?.[1]

        let arrayError = formattedErrors.find((e) => e.field === arrayPath)
        if (!arrayError) {
          arrayError = {
            field: arrayPath,
            message: 'Erro de validação em array',
            errors: {},
          }
          formattedErrors.push(arrayError)
        }

        if (!arrayError.errors[index!]) {
          arrayError.errors[index!] = []
        }
        arrayError.errors[index!].push({
          field: error.property,
          message,
          value: error.value,
        })
      } else {
        formattedErrors.push({
          field: fieldPath,
          message,
          value: error.value,
        })
      }
    }

    if (error.children && error.children.length > 0) {
      error.children.forEach((child) => {
        processError(child, fieldPath)
      })
    }
  }

  errors.forEach((error) => processError(error))
  return formattedErrors
}

export function validationMiddleware<T>(type: new () => T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToClass(type, req.body)
      const errors = await validate(dto as object)

      if (errors.length > 0) {
        const validationErrors = formatValidationErrors(errors)

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
