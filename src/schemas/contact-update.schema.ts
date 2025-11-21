import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator'
import { ApiProperty } from '@/decorators'
import { VALIDATION_MESSAGES, IsPhoneValidator } from '@/utils'

export class ContactUpdateSchema {
  @ApiProperty({
    description: 'Nome do contato',
    example: 'João Silva',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  name?: string

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
}
