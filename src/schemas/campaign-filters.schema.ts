import {
  IsOptional,
  IsString,
  IsEnum,
  IsUUID,
  IsDateString,
  IsBoolean,
} from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiProperty } from '@/decorators'
import { CampaignType, CampaignScope } from '@/enums'
import { VALIDATION_MESSAGES } from '@/utils'

export class CampaignFiltersSchema {
  @ApiProperty({
    description: 'ID da organização fornecedora',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  supplierOrgId?: string

  @ApiProperty({
    description: 'Nome da campanha',
    example: 'Promoção',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  name?: string

  @ApiProperty({
    description: 'Tipo da campanha',
    example: CampaignType.CASHBACK,
    type: 'string',
    enum: CampaignType,
    required: false,
  })
  @IsOptional()
  @IsEnum(CampaignType, {
    message: VALIDATION_MESSAGES.INVALID_ENUM(CampaignType),
  })
  type?: CampaignType

  @ApiProperty({
    description: 'Escopo da campanha',
    example: CampaignScope.ALL,
    type: 'string',
    enum: CampaignScope,
    required: false,
  })
  @IsOptional()
  @IsEnum(CampaignScope, {
    message: VALIDATION_MESSAGES.INVALID_ENUM(CampaignScope),
  })
  scope?: CampaignScope

  @ApiProperty({
    description: 'Se a campanha está ativa',
    example: true,
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }: { value: any }) => value === 'true' || value === true)
  @IsBoolean({ message: VALIDATION_MESSAGES.INVALID_BOOLEAN })
  active?: boolean

  @ApiProperty({
    description: 'Data de início para filtro (maior ou igual)',
    example: '2025-01-01T00:00:00.000Z',
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: VALIDATION_MESSAGES.INVALID_DATE })
  startAtFrom?: string

  @ApiProperty({
    description: 'Data de fim para filtro (menor ou igual)',
    example: '2025-12-31T23:59:59.000Z',
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: VALIDATION_MESSAGES.INVALID_DATE })
  endAtTo?: string
}
