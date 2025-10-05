import { IsOptional, IsUUID } from 'class-validator'
import { ApiProperty } from '@/decorators'
import { VALIDATION_MESSAGES } from '@/utils'

export class ContactFiltersSchema {
  @ApiProperty({
    description: 'ID da organização para filtrar contatos',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  organizationId?: string
}
