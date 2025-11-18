import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'
import { ApiProperty } from '@/decorators'
import { ChangeRequestStatus } from '@/enums'
import { VALIDATION_MESSAGES } from '@/utils'

export class ChangeRequestSchema {
  @ApiProperty({
    description: 'ID único da solicitação',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    readOnly: true,
  })
  id: string

  @ApiProperty({
    description: 'ID do usuário que fez a solicitação',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  userId: string

  @ApiProperty({
    description: 'ID da organização relacionada',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  organizationId: string

  @ApiProperty({
    description: 'Dados solicitados para alteração em formato JSON',
    example: { legalName: 'Nova Razão Social', phone: '48999999999' },
    type: 'object',
    required: true,
  })
  @IsObject({ message: 'As alterações solicitadas devem ser um objeto' })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  requestedChanges: Record<string, any>

  @ApiProperty({
    description: 'Status da solicitação',
    example: ChangeRequestStatus.PENDING,
    type: 'string',
    enum: ChangeRequestStatus,
    required: false,
    readOnly: true,
  })
  status?: ChangeRequestStatus

  @ApiProperty({
    description: 'ID do admin que revisou a solicitação',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: false,
    readOnly: true,
  })
  reviewedBy?: string

  @ApiProperty({
    description: 'Data de revisão da solicitação',
    example: '2025-09-19T10:00:00.000Z',
    type: 'string',
    format: 'date-time',
    readOnly: true,
  })
  reviewedAt?: string

  @ApiProperty({
    description: 'Nota de revisão do admin',
    example: 'Aprovado conforme solicitado',
    type: 'string',
    required: false,
  })
  reviewNote?: string

  @ApiProperty({
    description: 'Data de criação da solicitação',
    example: '2025-09-19T10:00:00.000Z',
    type: 'string',
    format: 'date-time',
    readOnly: true,
  })
  createdAt: string

  @ApiProperty({
    description: 'Informações básicas do usuário solicitante',
    required: false,
    readOnly: true,
  })
  user?: {
    fullName: string
    email: string
  }

  @ApiProperty({
    description: 'Informações básicas da organização do solicitante',
    required: false,
    readOnly: true,
  })
  organization?: {
    legalName: string
    type: string
    tradeName?: string
    taxId?: string
    phone?: string
    email?: string
  }
}

export class CreateChangeRequestSchema {
  @ApiProperty({
    description: 'Dados solicitados para alteração em formato JSON',
    example: { legalName: 'Nova Razão Social', phone: '48999999999' },
    type: 'object',
    required: true,
  })
  @IsObject({ message: 'As alterações solicitadas devem ser um objeto' })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  requestedChanges: Record<string, any>
}

export class ReviewChangeRequestSchema {
  @ApiProperty({
    description: 'Status da revisão',
    example: ChangeRequestStatus.APPROVED,
    type: 'string',
    enum: [ChangeRequestStatus.APPROVED, ChangeRequestStatus.REJECTED],
    required: true,
  })
  @IsEnum([ChangeRequestStatus.APPROVED, ChangeRequestStatus.REJECTED], {
    message: 'Status deve ser approved ou rejected',
  })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  status: ChangeRequestStatus.APPROVED | ChangeRequestStatus.REJECTED

  @ApiProperty({
    description: 'Nota de revisão',
    example: 'Aprovado conforme solicitado',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  reviewNote?: string
}
