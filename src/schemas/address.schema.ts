import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Validate,
} from 'class-validator'
import { ApiProperty } from '@/decorators'
import { VALIDATION_MESSAGES, IsPostalCodeValidator } from '@/utils'

export class AddressSchema {
  @ApiProperty({
    description: 'ID único do endereço',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    readOnly: true,
  })
  id: string

  @ApiProperty({
    description: 'ID da organização',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: true,
    readOnly: true,
  })
  organizationId: string

  @ApiProperty({
    description: 'Nome da rua',
    example: 'Rua das Flores',
    type: 'string',
    required: true,
  })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  street: string

  @ApiProperty({
    description: 'Número do endereço',
    example: '123',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  number?: string

  @ApiProperty({
    description: 'Complemento do endereço',
    example: 'Apto 101',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  complement?: string

  @ApiProperty({
    description: 'Bairro',
    example: 'Centro',
    type: 'string',
    required: true,
  })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  neighborhood: string

  @ApiProperty({
    description: 'Cidade',
    example: 'Florianópolis',
    type: 'string',
    required: true,
  })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  city: string

  @ApiProperty({
    description: 'Estado (UF)',
    example: 'SC',
    type: 'string',
    required: true,
    maxLength: 2,
  })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  @Length(2, 2, { message: VALIDATION_MESSAGES.INVALID_STATE })
  state: string

  @ApiProperty({
    description: 'CEP',
    example: '88000000',
    type: 'string',
    required: true,
  })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  @Validate(IsPostalCodeValidator)
  postalCode: string

  @ApiProperty({
    description: 'Se é o endereço principal',
    example: true,
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: VALIDATION_MESSAGES.INVALID_BOOLEAN })
  isPrimary?: boolean

  @ApiProperty({
    description: 'Data de criação do endereço',
    example: '2025-09-19T10:00:00.000Z',
    type: 'string',
    format: 'date-time',
    readOnly: true,
  })
  createdAt: string
}
