import { ApiProperty } from '@/decorators'
import { IsNotEmpty, IsNumber } from 'class-validator'
import { VALIDATION_MESSAGES } from '@/utils'

export class AdminStatsSchema {
  @ApiProperty({
    description: 'Número total de lojas cadastradas',
    example: 25,
    type: 'number',
    readOnly: true,
  })
  @IsNumber({}, { message: VALIDATION_MESSAGES.INVALID_NUMBER })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  totalStores: number

  @ApiProperty({
    description: 'Número total de fornecedores cadastrados',
    example: 15,
    type: 'number',
    readOnly: true,
  })
  @IsNumber({}, { message: VALIDATION_MESSAGES.INVALID_NUMBER })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  totalSuppliers: number

  @ApiProperty({
    description: 'Número total de usuários cadastrados',
    example: 100,
    type: 'number',
    readOnly: true,
  })
  @IsNumber({}, { message: VALIDATION_MESSAGES.INVALID_NUMBER })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  totalUsers: number
}
