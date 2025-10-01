import { IsUUID, IsOptional, IsNumberString } from 'class-validator'
import { ApiProperty } from '@/decorators'
import { VALIDATION_MESSAGES } from '@/utils'

export class IdParamSchema {
  @ApiProperty({
    description: 'ID único do recurso',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  id!: string
}

export class OptionalIdParamSchema {
  @ApiProperty({
    description: 'ID único do recurso',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  id?: string
}

export class NumericIdParamSchema {
  @ApiProperty({
    description: 'ID numérico do recurso',
    example: '123',
  })
  @IsNumberString({}, { message: VALIDATION_MESSAGES.INVALID_NUMBER })
  id!: string
}
