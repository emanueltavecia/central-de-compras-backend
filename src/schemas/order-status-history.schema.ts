import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'
import { ApiProperty } from '../decorators/api-property.decorator'
import { OrderStatus } from '../enums'
import { VALIDATION_MESSAGES } from '@/utils'

export class OrderStatusHistorySchema {
  @ApiProperty({
    description: 'ID único do histórico de status',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    readOnly: true,
  })
  id: string

  @ApiProperty({
    description: 'ID do pedido',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  orderId: string

  @ApiProperty({
    description: 'Status anterior',
    example: OrderStatus.PLACED,
    type: 'string',
    enum: OrderStatus,
    required: false,
    readOnly: true,
  })
  previousStatus?: OrderStatus

  @ApiProperty({
    description: 'Novo status',
    example: OrderStatus.CONFIRMED,
    type: 'string',
    enum: OrderStatus,
    required: true,
  })
  @IsEnum(OrderStatus, {
    message: VALIDATION_MESSAGES.INVALID_ENUM(OrderStatus),
  })
  newStatus: OrderStatus

  @ApiProperty({
    description: 'ID do usuário que alterou o status',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: false,
    readOnly: true,
  })
  changedBy?: string

  @ApiProperty({
    description: 'Observação sobre a mudança',
    example: 'Pedido confirmado pelo fornecedor',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  note?: string

  @ApiProperty({
    description: 'Data da mudança de status',
    example: '2025-09-19T10:00:00.000Z',
    type: 'string',
    format: 'date-time',
    readOnly: true,
  })
  createdAt: string
}
