import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@/decorators'
import { OrderStatus } from '@/enums'
import { VALIDATION_MESSAGES } from '@/utils'

export class UpdateOrderStatusSchema {
  @ApiProperty({
    description: 'Novo status do pedido',
    example: OrderStatus.CONFIRMED,
    type: 'string',
    enum: OrderStatus,
    required: true,
  })
  @IsEnum(OrderStatus, {
    message: VALIDATION_MESSAGES.INVALID_ENUM(OrderStatus),
  })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  newStatus: OrderStatus

  @ApiProperty({
    description: 'Observação sobre a mudança de status',
    example: 'Pedido confirmado pelo fornecedor',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  note?: string
}
