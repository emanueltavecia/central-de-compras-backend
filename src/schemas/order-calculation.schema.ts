import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
  ArrayMinSize,
  IsNumber,
  IsString,
  IsInt,
  Min,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@/decorators'
import { VALIDATION_MESSAGES } from '@/utils'

export class OrderCalculationItemSchema {
  @ApiProperty({
    description: 'ID do produto',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  productId: string

  @ApiProperty({
    description: 'Nome do produto no momento do pedido',
    example: 'Smartphone XYZ',
    type: 'string',
    required: true,
  })
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  productNameSnapshot: string

  @ApiProperty({
    description: 'Quantidade do produto',
    example: 2,
    type: 'integer',
    required: true,
    minimum: 1,
  })
  @IsInt({ message: VALIDATION_MESSAGES.INVALID_INTEGER })
  @Min(1, { message: VALIDATION_MESSAGES.MIN_QUANTITY(1) })
  quantity: number

  @ApiProperty({
    description: 'Preço unitário original',
    example: 999.99,
    type: 'number',
    required: true,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: VALIDATION_MESSAGES.INVALID_NUMBER },
  )
  unitPrice: number

  @ApiProperty({
    description: 'Preço unitário ajustado',
    example: 949.99,
    type: 'number',
    required: true,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: VALIDATION_MESSAGES.INVALID_NUMBER },
  )
  unitPriceAdjusted: number

  @ApiProperty({
    description: 'Preço total do item',
    example: 1899.98,
    type: 'number',
    required: true,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: VALIDATION_MESSAGES.INVALID_NUMBER },
  )
  totalPrice: number

  @ApiProperty({
    description: 'Valor de cashback aplicado',
    example: 95.0,
    type: 'number',
    required: false,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: VALIDATION_MESSAGES.INVALID_NUMBER },
  )
  appliedCashbackAmount?: number
}

export class SupplierStateConditionAdjustmentSchema {
  @ApiProperty({
    description: 'ID da condição de estado',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
  })
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  id: string

  @ApiProperty({
    description: 'Estado',
    example: 'SP',
    type: 'string',
  })
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  state: string

  @ApiProperty({
    description: 'Ajuste no preço unitário',
    example: 1.15,
    type: 'number',
  })
  @IsNumber(
    { maxDecimalPlaces: 4 },
    { message: VALIDATION_MESSAGES.INVALID_NUMBER },
  )
  unitPriceAdjustment: number

  @ApiProperty({
    description: 'Percentual de cashback',
    example: 2.5,
    type: 'number',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: VALIDATION_MESSAGES.INVALID_NUMBER },
  )
  cashbackPercent: number
}

export class PaymentConditionAdjustmentSchema {
  @ApiProperty({
    description: 'ID da condição de pagamento',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
  })
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  id: string

  @ApiProperty({
    description: 'Nome da condição de pagamento',
    example: 'À vista',
    type: 'string',
  })
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  name: string

  @ApiProperty({
    description: 'Método de pagamento',
    example: 'PIX',
    type: 'string',
  })
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  paymentMethod: string
}

export class CampaignAdjustmentSchema {
  @ApiProperty({
    description: 'ID da campanha',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
  })
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  id: string

  @ApiProperty({
    description: 'Nome da campanha',
    example: 'Cashback Primavera',
    type: 'string',
  })
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  name: string

  @ApiProperty({
    description: 'Tipo da campanha',
    example: 'CASHBACK',
    type: 'string',
  })
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  type: string

  @ApiProperty({
    description: 'Percentual de cashback',
    example: 5.0,
    type: 'number',
    required: false,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: VALIDATION_MESSAGES.INVALID_NUMBER },
  )
  cashbackPercent?: number

  @ApiProperty({
    description: 'ID do produto brinde',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  giftProductId?: string
}

export class AdjustmentDetailsSchema {
  @ApiProperty({
    description: 'Condição de estado do fornecedor aplicada',
    type: 'object',
    schema: SupplierStateConditionAdjustmentSchema,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SupplierStateConditionAdjustmentSchema)
  supplierStateCondition?: SupplierStateConditionAdjustmentSchema

  @ApiProperty({
    description: 'Condição de pagamento aplicada',
    type: 'object',
    schema: PaymentConditionAdjustmentSchema,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentConditionAdjustmentSchema)
  paymentCondition?: PaymentConditionAdjustmentSchema

  @ApiProperty({
    description: 'Campanhas aplicadas',
    type: 'array',
    schema: CampaignAdjustmentSchema,
    required: false,
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CampaignAdjustmentSchema)
  campaigns?: CampaignAdjustmentSchema[]
}

export class CalculatedItemSchema {
  @ApiProperty({
    description: 'ID do produto',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
  })
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  productId: string

  @ApiProperty({
    description: 'Quantidade',
    example: 2,
    type: 'number',
  })
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: VALIDATION_MESSAGES.INVALID_NUMBER },
  )
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  quantity: number

  @ApiProperty({
    description: 'Preço unitário original',
    example: 99.99,
    type: 'number',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: VALIDATION_MESSAGES.INVALID_NUMBER },
  )
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  unitPrice: number

  @ApiProperty({
    description: 'Preço unitário ajustado',
    example: 89.99,
    type: 'number',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: VALIDATION_MESSAGES.INVALID_NUMBER },
  )
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  unitPriceAdjusted: number

  @ApiProperty({
    description: 'Preço total do item',
    example: 179.98,
    type: 'number',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: VALIDATION_MESSAGES.INVALID_NUMBER },
  )
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  totalPrice: number

  @ApiProperty({
    description: 'Valor de cashback aplicado ao item',
    example: 9.0,
    type: 'number',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: VALIDATION_MESSAGES.INVALID_NUMBER },
  )
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  appliedCashbackAmount: number
}

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
    description: 'Estado da loja para aplicar condições regionais',
    example: 'SP',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  storeState?: string

  @ApiProperty({
    description: 'Valor de cashback a ser utilizado',
    example: 25.5,
    type: 'number',
    required: false,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: VALIDATION_MESSAGES.INVALID_NUMBER },
  )
  @Min(0, { message: VALIDATION_MESSAGES.MIN_VALUE(0) })
  cashbackUsed?: number

  @ApiProperty({
    description: 'Itens do pedido para cálculo',
    type: 'array',
    schema: OrderCalculationItemSchema,
    required: true,
  })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  @ArrayMinSize(1, { message: VALIDATION_MESSAGES.ARRAY_MIN_SIZE(1) })
  @ValidateNested({ each: true })
  @Type(() => OrderCalculationItemSchema)
  items: OrderCalculationItemSchema[]
}

export class OrderCalculationResponseSchema {
  @ApiProperty({
    description: 'Valor subtotal (soma dos itens)',
    example: 999.99,
    type: 'number',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: VALIDATION_MESSAGES.INVALID_NUMBER },
  )
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  subtotalAmount: number

  @ApiProperty({
    description: 'Custo de frete',
    example: 50.0,
    type: 'number',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: VALIDATION_MESSAGES.INVALID_NUMBER },
  )
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  shippingCost: number

  @ApiProperty({
    description: 'Ajustes aplicados (descontos/acréscimos)',
    example: -10.0,
    type: 'number',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: VALIDATION_MESSAGES.INVALID_NUMBER },
  )
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  adjustments: number

  @ApiProperty({
    description: 'Valor total final',
    example: 1039.99,
    type: 'number',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: VALIDATION_MESSAGES.INVALID_NUMBER },
  )
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  totalAmount: number

  @ApiProperty({
    description: 'Total de cashback calculado',
    example: 52.0,
    type: 'number',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: VALIDATION_MESSAGES.INVALID_NUMBER },
  )
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  totalCashback: number

  @ApiProperty({
    description: 'ID da condição de estado do fornecedor aplicada',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  appliedSupplierStateConditionId?: string

  @ApiProperty({
    description: 'Detalhes dos ajustes aplicados',
    type: 'object',
    schema: AdjustmentDetailsSchema,
  })
  @ValidateNested()
  @Type(() => AdjustmentDetailsSchema)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  adjustmentDetails: AdjustmentDetailsSchema

  @ApiProperty({
    description: 'Itens com valores calculados',
    type: 'array',
    schema: CalculatedItemSchema,
  })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  @ArrayMinSize(1, { message: VALIDATION_MESSAGES.ARRAY_MIN_SIZE(1) })
  @ValidateNested({ each: true })
  @Type(() => CalculatedItemSchema)
  calculatedItems: CalculatedItemSchema[]
}
