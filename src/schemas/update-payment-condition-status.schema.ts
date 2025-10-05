import { ApiProperty } from '@/decorators'

export class UpdatePaymentConditionStatusSchema {
  @ApiProperty({
    description: 'Se a condição de pagamento está ativa',
    example: false,
    type: 'boolean',
    required: true,
  })
  active: boolean
}
