import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'
import { ApiProperty } from '../decorators/api-property.decorator'

export class ContactSchema {
  @ApiProperty({
    description: 'ID único do contato',
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
    description: 'Nome do contato',
    example: 'João Silva',
    type: 'string',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiProperty({
    description: 'Email do contato',
    example: 'joao@empresa.com',
    type: 'string',
    format: 'email',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiProperty({
    description: 'Telefone do contato',
    example: '(48) 99999-9999',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiProperty({
    description: 'Cargo do contato',
    example: 'Gerente',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  role?: string

  @ApiProperty({
    description: 'Se é o contato principal',
    example: true,
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean

  @ApiProperty({
    description: 'Data de criação do contato',
    example: '2025-09-19T10:00:00.000Z',
    type: 'string',
    format: 'date-time',
    readOnly: true,
  })
  createdAt: string
}
