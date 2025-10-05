import { IsBoolean } from 'class-validator'
import { ApiProperty } from '@/decorators'
import { VALIDATION_MESSAGES } from '@/utils'

export class UpdateOrganizationStatusSchema {
  @ApiProperty({
    description: 'Se a organização está ativa',
    example: false,
    type: 'boolean',
    required: true,
  })
  @IsBoolean({ message: VALIDATION_MESSAGES.INVALID_BOOLEAN })
  active: boolean
}
