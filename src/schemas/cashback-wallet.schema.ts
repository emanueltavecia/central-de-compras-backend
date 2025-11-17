import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator'
import { ApiProperty } from '@/decorators'

export class CashbackWalletSchema {
  @ApiProperty({
    description: 'ID único da carteira de cashback',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    readOnly: true,
  })
  @IsOptional()
  @IsUUID(4)
  id?: string

  @ApiProperty({
    description: 'ID da organização',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    readOnly: true,
  })
  @IsOptional()
  @IsUUID(4)
  organizationId?: string

  @ApiProperty({
    description: 'Saldo disponível para uso',
    example: 150.75,
    type: 'number',
    readOnly: true,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  availableBalance?: number

  @ApiProperty({
    description: 'Total de cashback ganho',
    example: 300.5,
    type: 'number',
    readOnly: true,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalEarned?: number

  @ApiProperty({
    description: 'Total de cashback utilizado',
    example: 149.75,
    type: 'number',
    readOnly: true,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalUsed?: number

  @ApiProperty({
    description: 'Data de criação',
    example: '2023-12-01T10:00:00Z',
    type: 'string',
    format: 'date-time',
    readOnly: true,
  })
  @IsOptional()
  createdAt?: string

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2023-12-15T14:30:00Z',
    type: 'string',
    format: 'date-time',
    readOnly: true,
  })
  @IsOptional()
  updatedAt?: string
}
