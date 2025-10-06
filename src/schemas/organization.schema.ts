import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Validate,
  ValidateNested,
} from 'class-validator'
import { ApiProperty } from '@/decorators'
import { OrgType } from '@/enums'
import {
  IsCpfCnpjValidator,
  IsPhoneValidator,
  VALIDATION_MESSAGES,
} from '@/utils'
import { AddressSchema } from './address.schema'
import { Type } from 'class-transformer'

export class OrganizationSchema {
  @ApiProperty({
    description: 'ID único da organização',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    readOnly: true,
  })
  id: string

  @ApiProperty({
    description: 'Tipo da organização',
    example: OrgType.STORE,
    type: 'string',
    enum: OrgType,
    required: true,
  })
  @IsEnum(OrgType, { message: VALIDATION_MESSAGES.INVALID_ENUM(OrgType) })
  type: OrgType

  @ApiProperty({
    description: 'Razão social',
    example: 'Empresa Exemplo LTDA',
    type: 'string',
    required: true,
  })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  legalName: string

  @ApiProperty({
    description: 'Nome fantasia',
    example: 'Loja Exemplo',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  tradeName?: string

  @ApiProperty({
    description: 'CNPJ ou CPF',
    example: '12345678000195',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  @Validate(IsCpfCnpjValidator)
  taxId?: string

  @ApiProperty({
    description: 'Telefone da organização',
    example: '4833333333',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  @Validate(IsPhoneValidator)
  phone?: string

  @ApiProperty({
    description: 'Email da organização',
    example: 'contato@empresa.com',
    type: 'string',
    format: 'email',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: VALIDATION_MESSAGES.INVALID_EMAIL })
  email?: string

  @ApiProperty({
    description: 'Website da organização',
    example: 'https://www.empresa.com',
    type: 'string',
    format: 'uri',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: VALIDATION_MESSAGES.INVALID_URL })
  website?: string

  @ApiProperty({
    description: 'Endereços da organização',
    type: 'array',
    schema: AddressSchema,
    required: false,
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AddressSchema)
  address?: AddressSchema[]

  @ApiProperty({
    description: 'ID do usuário que criou a organização',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: false,
    readOnly: true,
  })
  createdBy?: string

  @ApiProperty({
    description: 'Data de criação da organização',
    example: '2025-09-19T10:00:00.000Z',
    type: 'string',
    format: 'date-time',
    readOnly: true,
  })
  createdAt: string

  @ApiProperty({
    description: 'Se a organização está ativa',
    example: true,
    type: 'boolean',
    required: false,
    readOnly: true,
  })
  active?: boolean
}
