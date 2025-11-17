import { ApiProperty } from '@/decorators'

export class UserCredentialsShareSchema {
  @ApiProperty({
    description: 'Token temporário para acessar as credenciais',
    example: 'abc123def456',
    type: 'string',
  })
  token: string

  @ApiProperty({
    description: 'Link para visualizar as credenciais',
    example: 'https://app.com/credentials/abc123def456',
    type: 'string',
  })
  link: string

  @ApiProperty({
    description: 'Data de expiração do token',
    example: '2025-11-17T10:00:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  expiresAt: string
}
