import { ApiProperty } from '@/decorators'
import { VALIDATION_MESSAGES } from '@/utils'
import { IsBoolean, IsNotEmpty } from 'class-validator'

export class UpdateProductStatusSchema {
  @ApiProperty({
    description: 'Se o produto está ativo',
    example: true,
    type: 'boolean',
    required: true,
  })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  @IsBoolean({ message: VALIDATION_MESSAGES.INVALID_BOOLEAN })
  active: boolean
}
