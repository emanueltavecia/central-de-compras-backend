import { ValidationError } from '@/types'
import { ApiProperty } from '@/decorators'

export class ErrorResponseSchema {
  @ApiProperty({
    description: 'Indica que a operação falhou',
    example: false,
    type: 'boolean',
  })
  success: boolean

  @ApiProperty({
    description: 'Mensagem de erro',
    example: 'Erro interno do servidor',
    type: 'string',
  })
  message: string

  @ApiProperty({
    description: 'Detalhes específicos do erro',
    example: 'Detalhes adicionais sobre o erro ocorrido',
    type: 'string',
    required: false,
  })
  error?: string
}

export class ValidationErrorResponseSchema {
  @ApiProperty({
    description: 'Indica que a operação falhou',
    example: false,
    type: 'boolean',
  })
  success: boolean

  @ApiProperty({
    description: 'Mensagem de erro de validação',
    example: 'Dados de entrada inválidos',
    type: 'string',
  })
  message: string

  @ApiProperty({
    description: 'Lista de erros de validação',
    type: 'object',
    example: {
      validationErrors: [
        {
          field: 'email',
          message: 'E-mail inválido',
          value: 'email-inválido',
        },
      ],
    },
  })
  error: {
    validationErrors: ValidationError[]
  }
}
