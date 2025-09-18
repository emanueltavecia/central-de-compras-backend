import { ApiProperty, ApiPropertyOptions, SchemaType } from '@/decorators'

export class SuccessResponseSchema<T> {
  @ApiProperty({
    description: 'Indica se a operação foi bem-sucedida',
    example: true,
    type: 'boolean',
  })
  success: boolean

  @ApiProperty({
    description: 'Mensagem descritiva da operação',
    example: 'Servidor funcionando corretamente',
    type: 'string',
  })
  message: string

  data: T

  static create<T>(
    dataSchema: SchemaType,
    dataDescription?: string,
  ): new () => SuccessResponseSchema<T> {
    class ResponseWithData extends SuccessResponseSchema<T> {
      constructor() {
        super()
        const dataPropertyOptions: ApiPropertyOptions = {
          description: dataDescription || 'Dados da resposta',
          type: 'object',
          schema: dataSchema,
        }

        ApiProperty(dataPropertyOptions)(this, 'data')
      }
    }

    ApiProperty({
      description: dataDescription || 'Dados da resposta',
      type: 'object',
      schema: dataSchema,
    })(ResponseWithData.prototype, 'data')

    return ResponseWithData
  }
}
