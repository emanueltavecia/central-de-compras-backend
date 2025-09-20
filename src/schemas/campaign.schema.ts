import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  Validate,
  ValidateIf,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ArrayMinSize,
  IsNumber,
} from 'class-validator'
import { ApiProperty } from '../decorators/api-property.decorator'
import { CampaignType, CampaignScope } from '../enums'

@ValidatorConstraint({ name: 'isEndDateAfterStartDate', async: false })
class IsEndDateAfterStartDateConstraint
  implements ValidatorConstraintInterface
{
  validate(endAt: string, args: ValidationArguments) {
    const { startAt } = args.object as any
    if (!startAt || !endAt) {
      return true
    }
    return new Date(endAt) > new Date(startAt)
  }

  defaultMessage() {
    return 'A data de fim deve ser posterior à data de início'
  }
}

export class CampaignSchema {
  @ApiProperty({
    description: 'ID único da campanha',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    readOnly: true,
  })
  id: string

  @ApiProperty({
    description: 'ID da organização fornecedora',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @IsUUID()
  supplierOrgId: string

  @ApiProperty({
    description: 'Nome da campanha',
    example: 'Promoção de Verão 2025',
    type: 'string',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiProperty({
    description: 'Tipo da campanha',
    example: CampaignType.CASHBACK,
    type: 'string',
    enum: CampaignType,
    required: true,
  })
  @IsEnum(CampaignType)
  type: CampaignType

  @ApiProperty({
    description: 'Escopo da campanha',
    example: CampaignScope.ALL,
    type: 'string',
    enum: CampaignScope,
    required: false,
  })
  @IsOptional()
  @IsEnum(CampaignScope)
  scope?: CampaignScope

  @ApiProperty({
    description: 'Valor mínimo total para aplicar a campanha',
    example: 100.0,
    type: 'number',
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minTotal?: number

  @ApiProperty({
    description: 'Quantidade mínima para aplicar a campanha',
    example: 5,
    type: 'integer',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  minQuantity?: number

  @ApiProperty({
    description: 'Percentual de cashback',
    example: 10.5,
    type: 'number',
    required: false,
    minimum: 0,
    maximum: 100,
  })
  @ValidateIf((o) => o.type === CampaignType.CASHBACK)
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  cashbackPercent?: number

  @ApiProperty({
    description: 'ID do produto brinde',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: false,
  })
  @ValidateIf((o) => o.type === CampaignType.GIFT)
  @IsNotEmpty()
  @IsUUID()
  giftProductId?: string

  @ApiProperty({
    description: 'ID da categoria alvo',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    required: false,
  })
  @ValidateIf((o) => o.scope === CampaignScope.CATEGORY)
  @IsNotEmpty()
  @IsUUID()
  categoryId?: string

  @ApiProperty({
    description: 'IDs dos produtos alvo',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
    ],
    type: 'array',
    required: false,
  })
  @ValidateIf((o) => o.scope === CampaignScope.PRODUCT)
  @IsNotEmpty({ each: true })
  @IsUUID(undefined, { each: true })
  @ArrayMinSize(1)
  productIds?: string[]

  @ApiProperty({
    description: 'Data de início da campanha',
    example: '2025-01-01T00:00:00.000Z',
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startAt?: string

  @ApiProperty({
    description: 'Data de fim da campanha',
    example: '2025-12-31T23:59:59.000Z',
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @Validate(IsEndDateAfterStartDateConstraint)
  endAt?: string

  @ApiProperty({
    description: 'Se a campanha está ativa',
    example: true,
    type: 'boolean',
    required: false,
    readOnly: true,
  })
  active?: boolean

  @ApiProperty({
    description: 'Data de criação da campanha',
    example: '2025-09-19T10:00:00.000Z',
    type: 'string',
    format: 'date-time',
    readOnly: true,
  })
  createdAt: string
}
