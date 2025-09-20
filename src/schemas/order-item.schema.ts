import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsUUID,
  Min,
} from 'class-validator'
import { ApiProperty } from '../decorators/api-property.decorator'

export class OrderItemSchema {
  @ApiProperty({
    description: 'ID único do item do pedido',
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
    readOnly: true,
  })
  orderId: string

  @ApiProperty({
    description: 'ID do produto',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @IsUUID()
  @IsNotEmpty()
  productId: string

  @ApiProperty({
    description: 'Nome do produto no momento do pedido',
    example: 'Smartphone XYZ',
    type: 'string',
    required: true,
    readOnly: true,
  })
  productNameSnapshot: string

  @ApiProperty({
    description: 'Preço unitário original',
    example: 999.99,
    type: 'number',
    required: true,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  unitPrice: number

  @ApiProperty({
    description: 'Preço unitário ajustado',
    example: 949.99,
    type: 'number',
    required: true,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  unitPriceAdjusted: number

  @ApiProperty({
    description: 'Quantidade do produto',
    example: 2,
    type: 'integer',
    required: true,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number

  @ApiProperty({
    description: 'Preço total do item',
    example: 1899.98,
    type: 'number',
    required: true,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  totalPrice: number

  @ApiProperty({
    description: 'Valor de cashback aplicado',
    example: 95.0,
    type: 'number',
    required: false,
    readOnly: true,
  })
  appliedCashbackAmount?: number

  @ApiProperty({
    description: 'Data de criação do item',
    example: '2025-09-19T10:00:00.000Z',
    type: 'string',
    format: 'date-time',
    readOnly: true,
  })
  createdAt: string
}
