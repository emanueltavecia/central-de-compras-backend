import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUUID,
  Validate,
} from 'class-validator'
import { ApiProperty } from '@/decorators'
import { UserAccountStatus } from '@/enums'
import { IsPhoneValidator, VALIDATION_MESSAGES } from '@/utils'
import { RoleSchema } from './role.schema'

export class UserSchema {
  @ApiProperty({
    description: 'ID único do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    readOnly: true,
  })
  id: string

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
    example: 'a1B2c3d4!',
    type: 'string',
    required: true,
    writeOnly: true,
  })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message: VALIDATION_MESSAGES.INVALID_STRONG_PASSWORD,
    },
  )
  password?: string

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  fullName?: string

  @ApiProperty({
    description: 'Telefone do usuário',
    example: '48999999999',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  @Validate(IsPhoneValidator)
  phone?: string

  @ApiProperty({
    description: 'ID da role do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: true,
    writeOnly: true,
  })
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  roleId: string

  @ApiProperty({
    description: 'Role do usuário',
    type: 'object',
    schema: RoleSchema,
    required: true,
    readOnly: true,
  })
  role: RoleSchema

  @ApiProperty({
    description: 'ID da organização do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: false,
  })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  organizationId: string

  @ApiProperty({
    description: 'Status da conta do usuário',
    example: UserAccountStatus.ACTIVE,
    type: 'string',
    enum: UserAccountStatus,
    required: false,
    readOnly: true,
  })
  status?: UserAccountStatus

  @ApiProperty({
    description: 'ID do usuário que criou este usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: false,
    readOnly: true,
  })
  createdBy?: string

  @ApiProperty({
    description: 'Data de criação do usuário',
    example: '2025-09-19T10:00:00.000Z',
    type: 'string',
    format: 'date-time',
    readOnly: true,
  })
  createdAt: string
}
