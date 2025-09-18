import { ApiProperty } from '../decorators/api-property.decorator'

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
          message: 'Email deve ter um formato válido',
          value: 'email-inválido',
        },
        {
          field: 'age',
          message: 'Idade deve ser maior que 18',
          value: 15,
        },
      ],
    },
  })
  error: {
    validationErrors: Array<{
      field: string
      message: string
      value?: any
    }>
  }
}
