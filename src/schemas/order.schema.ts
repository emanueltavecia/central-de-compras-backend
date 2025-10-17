import {
  ArrayMinSize,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@/decorators'
import { OrderStatus } from '@/enums'
import { OrderItemSchema } from './order-item.schema'
import { VALIDATION_MESSAGES } from '@/utils'

export class OrderSchema {
  @ApiProperty({
    description: 'ID único do pedido',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    readOnly: true,
  })
  id: string

  @ApiProperty({
    description: 'ID da organização loja',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  storeOrgId: string

  @ApiProperty({
    description: 'ID da organização fornecedora',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  supplierOrgId: string

  @ApiProperty({
    description: 'Status do pedido',
    example: OrderStatus.PLACED,
    type: 'string',
    enum: OrderStatus,
    required: false,
    readOnly: true,
  })
  status?: OrderStatus

  @ApiProperty({
    description: 'Data do pedido',
    example: '2025-09-19T10:00:00.000Z',
    type: 'string',
    format: 'date-time',
    readOnly: true,
  })
  placedAt: string

  @ApiProperty({
    description: 'ID do endereço de entrega',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  shippingAddressId?: string

  @ApiProperty({
    description: 'Valor subtotal',
    example: 999.99,
    type: 'number',
    required: false,
    readOnly: true,
  })
  subtotalAmount?: number

  @ApiProperty({
    description: 'Custo de frete',
    example: 50.0,
    type: 'number',
    required: false,
    readOnly: true,
  })
  shippingCost?: number

  @ApiProperty({
    description: 'Ajustes no valor',
    example: -10.0,
    type: 'number',
    required: false,
    readOnly: true,
  })
  adjustments?: number

  @ApiProperty({
    description: 'Valor total',
    example: 1039.99,
    type: 'number',
    required: false,
    readOnly: true,
  })
  totalAmount?: number

  @ApiProperty({
    description: 'Total de cashback',
    example: 52.0,
    type: 'number',
    required: false,
    readOnly: true,
  })
  totalCashback?: number

  @ApiProperty({
    description: 'Valor de cashback utilizado',
    example: 25.0,
    type: 'number',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cashbackUsed?: number

  @ApiProperty({
    description: 'ID da condição de estado do fornecedor aplicada',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: false,
    readOnly: true,
  })
  appliedSupplierStateConditionId?: string

  @ApiProperty({
    description: 'ID da condição de pagamento',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  paymentConditionId?: string

  @ApiProperty({
    description: 'ID do usuário que criou o pedido',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: false,
    readOnly: true,
  })
  createdBy?: string

  @ApiProperty({
    description: 'Data de criação do pedido',
    example: '2025-09-19T10:00:00.000Z',
    type: 'string',
    format: 'date-time',
    readOnly: true,
  })
  createdAt: string

  @ApiProperty({
    description: 'Itens do pedido',
    type: 'array',
    schema: OrderItemSchema,
    required: true,
  })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  @ArrayMinSize(1, { message: VALIDATION_MESSAGES.ARRAY_MIN_SIZE(1) })
  @ValidateNested({ each: true })
  @Type(() => OrderItemSchema)
  items: OrderItemSchema[]
}
