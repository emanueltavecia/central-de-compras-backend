import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator'
import { ApiProperty } from '../decorators/api-property.decorator'

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
  })
  @IsUUID()
  organizationId: string

  @ApiProperty({
    description: 'Nome da rua',
    example: 'Rua das Flores',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  street?: string

  @ApiProperty({
    description: 'Número do endereço',
    example: '123',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  number?: string

  @ApiProperty({
    description: 'Complemento do endereço',
    example: 'Apto 101',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  complement?: string

  @ApiProperty({
    description: 'Bairro',
    example: 'Centro',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  neighborhood?: string

  @ApiProperty({
    description: 'Cidade',
    example: 'Florianópolis',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  city?: string

  @ApiProperty({
    description: 'Estado (UF)',
    example: 'SC',
    type: 'string',
    required: false,
    maxLength: 2,
  })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  state?: string

  @ApiProperty({
    description: 'CEP',
    example: '88000-000',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  postalCode?: string

  @ApiProperty({
    description: 'Se é o endereço principal',
    example: true,
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
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
