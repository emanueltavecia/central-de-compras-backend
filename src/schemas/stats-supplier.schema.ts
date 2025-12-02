import { ApiProperty } from '@/decorators'
import { IsNotEmpty, IsNumber } from 'class-validator'
import { VALIDATION_MESSAGES } from '@/utils'

export class SupplierStatsSchema {
  @ApiProperty({
    description: 'Número de campanhas ativas do fornecedor',
    example: 5,
    type: 'number',
    readOnly: true,
  })
  @IsNumber({}, { message: VALIDATION_MESSAGES.INVALID_NUMBER })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  activeCampaigns: number

  @ApiProperty({
    description: 'Número de condições de estado ativas do fornecedor',
    example: 3,
    type: 'number',
    readOnly: true,
  })
  @IsNumber({}, { message: VALIDATION_MESSAGES.INVALID_NUMBER })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  activeSupplierStateConditions: number

  @ApiProperty({
    description:
      'Número de pedidos ativos (não cancelados, rejeitados, pendentes ou rascunho)',
    example: 20,
    type: 'number',
    readOnly: true,
  })
  @IsNumber({}, { message: VALIDATION_MESSAGES.INVALID_NUMBER })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  activeOrders: number

  @ApiProperty({
    description: 'Número de condições de pagamento ativas do fornecedor',
    example: 4,
    type: 'number',
    readOnly: true,
  })
  @IsNumber({}, { message: VALIDATION_MESSAGES.INVALID_NUMBER })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  activePaymentConditions: number

  @ApiProperty({
    description: 'Número de produtos ativos do fornecedor',
    example: 150,
    type: 'number',
    readOnly: true,
  })
  @IsNumber({}, { message: VALIDATION_MESSAGES.INVALID_NUMBER })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  activeProducts: number
}
