import { IsEmail, IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@/decorators'
import { VALIDATION_MESSAGES } from '@/utils'
import { UserSchema } from './user.schema'

export class LoginSchema {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'usuario@exemplo.com',
    type: 'string',
    format: 'email',
    required: true,
  })
  @IsEmail({}, { message: VALIDATION_MESSAGES.INVALID_EMAIL })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  email: string

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'senha123',
    type: 'string',
    required: true,
  })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  password: string
}

export class AuthResponseSchema {
  @ApiProperty({
    description: 'Token de autenticação JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: 'string',
    required: true,
  })
  token: string

  @ApiProperty({
    description: 'Dados do usuário autenticado',
    type: 'object',
    schema: UserSchema,
    required: true,
  })
  user: UserSchema
}
