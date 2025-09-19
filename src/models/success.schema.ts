import { ApiProperty, SchemaType } from '@/decorators'

interface SuccessResponseSchemaProps<T> {
  message?: string
  schema?: T
  dataDescription?: string
  isArray?: boolean
}

export class SuccessResponseSchema<T> {
  @ApiProperty({
    description: 'Indica se a operação foi bem-sucedida',
    example: true,
    type: 'boolean',
  })
  success: boolean

  message: string

  data?: T

  static create<T extends SchemaType>({
    message = 'Mensagem de sucesso.',
    schema,
    dataDescription,
    isArray = false,
  }: SuccessResponseSchemaProps<T>): new () => SuccessResponseSchema<T> {
    class ResponseWithData extends SuccessResponseSchema<T> {
      constructor() {
        super()

        ApiProperty({
          description: 'Mensagem descritiva da operação',
          example: message,
          type: 'string',
        })(this, 'message')

        ApiProperty({
          description: dataDescription || 'Dados da resposta',
          type: isArray ? 'array' : 'object',
          schema,
        })(this, 'data')
      }
    }

    ApiProperty({
      description: 'Mensagem descritiva da operação',
      example: message,
      type: 'string',
    })(ResponseWithData.prototype, 'message')

    ApiProperty({
      description: dataDescription || 'Dados da resposta',
      type: isArray ? 'array' : 'object',
      schema,
    })(ResponseWithData.prototype, 'data')

    return ResponseWithData
  }
}
