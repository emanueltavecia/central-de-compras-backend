import { IsOptional, IsString, IsUUID, IsBoolean } from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiProperty } from '@/decorators'
import { VALIDATION_MESSAGES } from '@/utils'

export class ProductFiltersSchema {
  @ApiProperty({
    description: 'Status do produto (ativo/inativo)',
    example: true,
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }: { value: any }) => value === 'true' || value === true)
  @IsBoolean({ message: VALIDATION_MESSAGES.INVALID_BOOLEAN })
  status?: boolean

  @ApiProperty({
    description: 'Descrição do produto',
    example: 'arroz',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  description?: string

  @ApiProperty({
    description: 'Nome do produto',
    example: 'Arroz Integral',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  name?: string

  @ApiProperty({
    description: 'ID da categoria do produto',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  categoryId?: string

  @ApiProperty({
    description: 'ID da organização fornecedora',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  supplierOrgId?: string
}
