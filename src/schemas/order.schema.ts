import {
  ArrayMinSize,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '../decorators/api-property.decorator'
import { OrderStatus } from '../enums'
import { OrderItemSchema } from './order-item.schema'

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
  @IsUUID()
  storeOrgId: string

  @ApiProperty({
    description: 'ID da organização fornecedora',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @IsUUID()
  supplierOrgId: string

  @ApiProperty({
    description: 'Status do pedido',
    example: OrderStatus.PLACED,
    type: 'string',
    enum: OrderStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
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
  @IsUUID()
  shippingAddressId?: string

  @ApiProperty({
    description: 'Valor subtotal',
    example: 999.99,
    type: 'number',
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  subtotalAmount?: number

  @ApiProperty({
    description: 'Custo de frete',
    example: 50.0,
    type: 'number',
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  shippingCost?: number

  @ApiProperty({
    description: 'Ajustes no valor',
    example: -10.0,
    type: 'number',
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  adjustments?: number

  @ApiProperty({
    description: 'Valor total',
    example: 1039.99,
    type: 'number',
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
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
  @IsUUID()
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
  @IsNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemSchema)
  items: OrderItemSchema[]
}
