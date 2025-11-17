import { IsOptional, IsUUID } from 'class-validator'
import { ApiProperty } from '@/decorators'

export class CashbackFiltersSchema {
  @ApiProperty({
    description: 'ID da organização para filtrar',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID(4)
  organizationId?: string

  @ApiProperty({
    description: 'ID do pedido para filtrar transações',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID(4)
  orderId?: string
}
