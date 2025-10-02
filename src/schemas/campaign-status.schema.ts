import { IsBoolean, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@/decorators'
import { VALIDATION_MESSAGES } from '@/utils'

export class CampaignStatusSchema {
  @ApiProperty({
    description: 'Status ativo da campanha',
    example: true,
    type: 'boolean',
    required: true,
  })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  @IsBoolean({ message: VALIDATION_MESSAGES.INVALID_BOOLEAN })
  active: boolean
}
