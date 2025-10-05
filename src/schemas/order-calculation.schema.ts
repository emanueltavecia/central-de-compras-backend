import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@/decorators'
import { OrderItemSchema } from './order-item.schema'
import { VALIDATION_MESSAGES } from '@/utils'

export class OrderCalculationRequestSchema {
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
    description: 'ID do endereço de entrega (para calcular frete)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  shippingAddressId?: string

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
    description: 'Itens do pedido para cálculo',
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

export class OrderCalculationResponseSchema {
  @ApiProperty({
    description: 'Valor subtotal (soma dos itens)',
    example: 999.99,
    type: 'number',
  })
  subtotalAmount: number

  @ApiProperty({
    description: 'Custo de frete',
    example: 50.0,
    type: 'number',
  })
  shippingCost: number

  @ApiProperty({
    description: 'Ajustes aplicados (descontos/acréscimos)',
    example: -10.0,
    type: 'number',
  })
  adjustments: number

  @ApiProperty({
    description: 'Valor total final',
    example: 1039.99,
    type: 'number',
  })
  totalAmount: number

  @ApiProperty({
    description: 'Total de cashback calculado',
    example: 52.0,
    type: 'number',
  })
  totalCashback: number

  @ApiProperty({
    description: 'Detalhes dos ajustes aplicados',
    type: 'object',
  })
  adjustmentDetails: {
    supplierStateCondition?: {
      id: string
      state: string
      unitPriceAdjustment: number
      cashbackPercent: number
    }
    paymentCondition?: {
      id: string
      name: string
      paymentMethod: string
    }
    campaigns?: Array<{
      id: string
      name: string
      type: string
      cashbackPercent?: number
      giftProductId?: string
    }>
  }

  @ApiProperty({
    description: 'Itens com valores calculados',
    type: 'array',
  })
  calculatedItems: Array<{
    productId: string
    quantity: number
    unitPrice: number
    unitPriceAdjusted: number
    totalPrice: number
    appliedCashbackAmount: number
  }>
}
