import { IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator'
import { ApiProperty } from '@/decorators'
import { OrderStatus } from '@/enums'
import { VALIDATION_MESSAGES } from '@/utils'

export class OrderFiltersSchema {
  @ApiProperty({
    description: 'ID da organização loja',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  storeOrgId?: string

  @ApiProperty({
    description: 'ID da organização fornecedora',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  supplierOrgId?: string

  @ApiProperty({
    description: 'Status do pedido',
    example: OrderStatus.PLACED,
    type: 'string',
    enum: OrderStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderStatus, {
    message: VALIDATION_MESSAGES.INVALID_ENUM(OrderStatus),
  })
  status?: OrderStatus

  @ApiProperty({
    description: 'Data de início para filtro (maior ou igual)',
    example: '2025-01-01T00:00:00.000Z',
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: VALIDATION_MESSAGES.INVALID_DATE })
  placedAtFrom?: string

  @ApiProperty({
    description: 'Data de fim para filtro (menor ou igual)',
    example: '2025-12-31T23:59:59.000Z',
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: VALIDATION_MESSAGES.INVALID_DATE })
  placedAtTo?: string

  @ApiProperty({
    description: 'ID do usuário que criou o pedido',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  createdBy?: string
}
