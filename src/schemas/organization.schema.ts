import { IsEmail, IsEnum, IsOptional, IsString, IsUrl } from 'class-validator'
import { ApiProperty } from '../decorators/api-property.decorator'
import { OrgType } from '../enums'

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
  @IsEnum(OrgType)
  type: OrgType

  @ApiProperty({
    description: 'Razão social',
    example: 'Empresa Exemplo LTDA',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  legalName?: string

  @ApiProperty({
    description: 'Nome fantasia',
    example: 'Loja Exemplo',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  tradeName?: string

  @ApiProperty({
    description: 'CNPJ ou CPF',
    example: '12.345.678/0001-90',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  taxId?: string

  @ApiProperty({
    description: 'Telefone da organização',
    example: '(48) 3333-3333',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiProperty({
    description: 'Email da organização',
    example: 'contato@empresa.com',
    type: 'string',
    format: 'email',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiProperty({
    description: 'Website da organização',
    example: 'https://www.empresa.com',
    type: 'string',
    format: 'uri',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  website?: string

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
