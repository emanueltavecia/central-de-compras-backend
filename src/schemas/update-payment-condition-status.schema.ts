import { ApiProperty } from '@/decorators'
import { VALIDATION_MESSAGES } from '@/utils'
import { IsBoolean, IsNotEmpty } from 'class-validator'

export class UpdatePaymentConditionStatusSchema {
  @ApiProperty({
    description: 'Se a condição de pagamento está ativa',
    example: false,
    type: 'boolean',
    required: true,
  })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  @IsBoolean({ message: VALIDATION_MESSAGES.INVALID_BOOLEAN })
  active: boolean
}
