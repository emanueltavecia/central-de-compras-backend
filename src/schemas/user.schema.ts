import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Validate,
  Matches,
} from 'class-validator'
import { ApiProperty } from '@/decorators'
import { UserAccountStatus } from '@/enums'
import { IsPhoneValidator, VALIDATION_MESSAGES } from '@/utils'
import { RoleSchema } from './role.schema'
import { OrganizationSchema } from './organization.schema'

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
  @Matches(/^[A-Za-z0-9]{6,}$/i, {
    message:
      'A senha deve ter pelo menos 6 caracteres, contendo apenas letras e números.',
  })
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
    readOnly: true,
  })
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
    required: true,
  })
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  organizationId: string

  @ApiProperty({
    description: 'Organização do usuário',
    type: 'object',
    schema: OrganizationSchema,
    required: false,
    readOnly: true,
  })
  organization?: OrganizationSchema

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

  @ApiProperty({
    description: 'URL da imagem de perfil do usuário',
    example: 'https://api.exemplo.com/uploads/profile/123e4567-e89b-12d3-a456-426614174000.jpg',
    type: 'string',
    required: false,
    readOnly: true,
  })
  profileImageUrl?: string
}

export class UpdateUserStatusSchema {
  @ApiProperty({
    description: 'Novo status da conta do usuário',
    example: UserAccountStatus.INACTIVE,
    type: 'string',
    enum: UserAccountStatus,
    required: true,
  })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  @IsEnum(UserAccountStatus, {
    message: VALIDATION_MESSAGES.INVALID_ENUM(UserAccountStatus),
  })
  status: UserAccountStatus
}

export class UpdateUserSchema {
  @ApiProperty({ description: 'Email do usuário', type: 'string', format: 'email', required: false })
  @IsOptional()
  @IsEmail({}, { message: VALIDATION_MESSAGES.INVALID_EMAIL })
  email?: string

  @ApiProperty({ description: 'Senha do usuário', type: 'string', required: false, writeOnly: true })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  @Matches(/^[A-Za-z0-9]{6,}$/i, {
    message: 'A senha deve ter pelo menos 6 caracteres, contendo apenas letras e números.',
  })
  password?: string

  @ApiProperty({ description: 'Nome completo do usuário', type: 'string', required: false })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  fullName?: string

  @ApiProperty({ description: 'Telefone do usuário', type: 'string', required: false })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  @Validate(IsPhoneValidator)
  phone?: string

  @ApiProperty({ description: 'ID da organização do usuário', type: 'string', format: 'uuid', required: false })
  @IsOptional()
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  organizationId?: string

  @ApiProperty({ description: 'URL da imagem de perfil do usuário', type: 'string', required: false })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  profileImageUrl?: string
}
