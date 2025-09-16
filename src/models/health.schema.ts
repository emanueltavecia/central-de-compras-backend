import { ApiProperty } from '../decorators/api-property.decorator'

enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

export class HealthDataSchema {
  @ApiProperty({
    description: 'Status do servidor',
    example: 'ok',
    type: 'string',
  })
  status: string

  @ApiProperty({
    description: 'Timestamp da verificação',
    example: '2025-09-15T10:00:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  timestamp: string

  @ApiProperty({
    description: 'Ambiente de execução',
    example: 'development',
    type: 'string',
    enum: Environment,
  })
  environment: string
}

export class HealthResponseSchema {
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

  @ApiProperty({
    description: 'Dados do health check',
    type: 'object',
    schema: HealthDataSchema,
  })
  data: HealthDataSchema
}
