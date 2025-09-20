import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Validate,
} from 'class-validator'
import { ApiProperty } from '@/decorators'
import { VALIDATION_MESSAGES, IsPhoneValidator } from '@/utils'

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
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  organizationId: string

  @ApiProperty({
    description: 'Nome do contato',
    example: 'João Silva',
    type: 'string',
    required: true,
  })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  name: string

  @ApiProperty({
    description: 'Email do contato',
    example: 'joao@empresa.com',
    type: 'string',
    format: 'email',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: VALIDATION_MESSAGES.INVALID_EMAIL })
  email?: string

  @ApiProperty({
    description: 'Telefone do contato',
    example: '48999999999',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  @Validate(IsPhoneValidator)
  phone?: string

  @ApiProperty({
    description: 'Cargo do contato',
    example: 'Gerente',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  role?: string

  @ApiProperty({
    description: 'Se é o contato principal',
    example: true,
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: VALIDATION_MESSAGES.INVALID_BOOLEAN })
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
