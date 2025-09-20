import { ApiProperty } from '@/decorators'

export enum Environment {
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
    example: Environment.DEVELOPMENT,
    type: 'string',
    enum: Environment,
  })
  environment: Environment
}
