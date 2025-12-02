import { ApiProperty } from '@/decorators'
import { IsNotEmpty, IsNumber } from 'class-validator'
import { VALIDATION_MESSAGES } from '@/utils'

export class StoreStatsSchema {
  @ApiProperty({
    description: 'Número de pedidos recebidos (placed)',
    example: 5,
    type: 'number',
    readOnly: true,
  })
  @IsNumber({}, { message: VALIDATION_MESSAGES.INVALID_NUMBER })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  placedOrders: number

  @ApiProperty({
    description: 'Número de pedidos pendentes (confirmed)',
    example: 3,
    type: 'number',
    readOnly: true,
  })
  @IsNumber({}, { message: VALIDATION_MESSAGES.INVALID_NUMBER })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  confirmedOrders: number

  @ApiProperty({
    description: 'Número de pedidos em transporte (shipped)',
    example: 2,
    type: 'number',
    readOnly: true,
  })
  @IsNumber({}, { message: VALIDATION_MESSAGES.INVALID_NUMBER })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  shippedOrders: number

  @ApiProperty({
    description: 'Saldo disponível na carteira de cashback',
    example: 150.5,
    type: 'number',
    readOnly: true,
  })
  @IsNumber({}, { message: VALIDATION_MESSAGES.INVALID_NUMBER })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  cashbackBalance: number
}
