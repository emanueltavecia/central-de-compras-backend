import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
} from 'class-validator'
import { ApiProperty } from '../decorators/api-property.decorator'
import { VALIDATION_MESSAGES } from '@/utils'

export class ProductSchema {
  @ApiProperty({
    description: 'ID único do produto',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    readOnly: true,
  })
  id: string

  @ApiProperty({
    description: 'ID da organização fornecedora',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  supplierOrgId: string

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
    description: 'Nome do produto',
    example: 'Smartphone XYZ',
    type: 'string',
    required: true,
  })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  name: string

  @ApiProperty({
    description: 'Descrição do produto',
    example: 'Smartphone com 128GB de armazenamento',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  description?: string

  @ApiProperty({
    description: 'Unidade de medida',
    example: 'UN',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  unit?: string

  @ApiProperty({
    description: 'Preço base do produto',
    example: 999.99,
    type: 'number',
    required: true,
    minimum: 0,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: VALIDATION_MESSAGES.INVALID_NUMBER },
  )
  @IsPositive({ message: VALIDATION_MESSAGES.INVALID_POSITIVE })
  basePrice: number

  @ApiProperty({
    description: 'Quantidade disponível em estoque',
    example: 100,
    type: 'integer',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsInt({ message: VALIDATION_MESSAGES.INVALID_INTEGER })
  @Min(0, { message: VALIDATION_MESSAGES.MIN_VALUE(0) })
  availableQuantity?: number

  @ApiProperty({
    description: 'Se o produto está ativo',
    example: true,
    type: 'boolean',
    required: false,
    readOnly: true,
  })
  active?: boolean

  @ApiProperty({
    description: 'ID do usuário que criou o produto',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: false,
    readOnly: true,
  })
  createdBy?: string

  @ApiProperty({
    description: 'Data de criação do produto',
    example: '2025-09-19T10:00:00.000Z',
    type: 'string',
    format: 'date-time',
    readOnly: true,
  })
  createdAt: string
}
