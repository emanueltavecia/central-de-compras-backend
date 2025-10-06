import { IsOptional, IsUUID, IsString, Length } from 'class-validator'
import { ApiProperty } from '@/decorators'
import { VALIDATION_MESSAGES } from '@/utils'

export class SupplierStateConditionFiltersSchema {
  @ApiProperty({
    description: 'ID da organização fornecedora para filtrar',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  supplierOrgId?: string

  @ApiProperty({
    description: 'Estado para filtrar condições',
    example: 'SP',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  @Length(2, 2, { message: VALIDATION_MESSAGES.INVALID_STATE })
  state?: string
}
