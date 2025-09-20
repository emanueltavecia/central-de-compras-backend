import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUUID,
} from 'class-validator'
import { ApiProperty } from '../decorators/api-property.decorator'
import { UserAccountStatus } from '../enums'

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
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'a1B2c3d4!',
    type: 'string',
    required: true,
    writeOnly: true,
  })
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  fullName?: string

  @ApiProperty({
    description: 'Telefone do usuário',
    example: '(48) 99999-9999',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiProperty({
    description: 'ID da role do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @IsUUID()
  @IsNotEmpty()
  roleId: string

  @ApiProperty({
    description: 'ID da organização do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  organizationId?: string

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
