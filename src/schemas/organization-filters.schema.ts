import { IsOptional, IsEnum, IsBoolean } from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiProperty } from '@/decorators'
import { OrgType } from '@/enums'
import { VALIDATION_MESSAGES } from '@/utils'

export class OrganizationFiltersSchema {
  @ApiProperty({
    description: 'Tipo da organização para filtrar',
    example: OrgType.STORE,
    type: 'string',
    enum: OrgType,
    required: false,
  })
  @IsOptional()
  @IsEnum(OrgType, { message: VALIDATION_MESSAGES.INVALID_ENUM(OrgType) })
  type?: OrgType

  @ApiProperty({
    description: 'Status ativo/inativo para filtrar organizações',
    example: true,
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true
    if (value === 'false') return false
    return value
  })
  @IsBoolean({ message: VALIDATION_MESSAGES.INVALID_BOOLEAN })
  active?: boolean
}
