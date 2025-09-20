import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator'
import { ApiProperty } from '../decorators/api-property.decorator'
import { OrderStatus } from '../enums'

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
  @IsUUID()
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
  @IsEnum(OrderStatus)
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
  @IsString()
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
