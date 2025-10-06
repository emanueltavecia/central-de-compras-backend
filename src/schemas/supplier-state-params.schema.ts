import { IsUUID, IsString, IsNotEmpty, Length } from 'class-validator'
import { ApiProperty } from '@/decorators'
import { VALIDATION_MESSAGES } from '@/utils'

export class SupplierStateParamsSchema {
  @ApiProperty({
    description: 'ID da organização fornecedora',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
  })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  supplierOrgId: string

  @ApiProperty({
    description: 'Estado',
    example: 'SP',
    type: 'string',
  })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  @Length(2, 2, { message: VALIDATION_MESSAGES.INVALID_STATE })
  state: string
}
