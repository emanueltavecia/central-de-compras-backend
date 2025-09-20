import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator'
import { ApiProperty } from '@/decorators'
import { VALIDATION_MESSAGES } from '@/utils'

export class SupplierStateConditionSchema {
  @ApiProperty({
    description: 'ID único da condição por estado',
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
  @IsUUID(undefined, { message: VALIDATION_MESSAGES.INVALID_UUID })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REQUIRED })
  supplierOrgId: string

  @ApiProperty({
    description: 'Estado (UF)',
    example: 'SC',
    type: 'string',
    required: true,
    maxLength: 2,
  })
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  @Length(2, 2, { message: VALIDATION_MESSAGES.INVALID_STATE })
  state: string

  @ApiProperty({
    description: 'Percentual de cashback',
    example: 5.5,
    type: 'number',
    required: false,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: VALIDATION_MESSAGES.INVALID_NUMBER },
  )
  @Min(0, { message: VALIDATION_MESSAGES.MIN_VALUE(0) })
  @Max(100, { message: VALIDATION_MESSAGES.MAX_VALUE(100) })
  cashbackPercent?: number

  @ApiProperty({
    description: 'Prazo para pagamento em dias',
    example: 30,
    type: 'integer',
    required: false,
  })
  @IsOptional()
  @IsInt({ message: VALIDATION_MESSAGES.INVALID_INTEGER })
  paymentTermDays?: number

  @ApiProperty({
    description: 'Ajuste no preço unitário',
    example: 10.5,
    type: 'number',
    required: false,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: VALIDATION_MESSAGES.INVALID_NUMBER },
  )
  unitPriceAdjustment?: number

  @ApiProperty({
    description: 'Data de início da vigência',
    example: '2025-01-01',
    type: 'string',
    format: 'date',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: VALIDATION_MESSAGES.INVALID_DATE })
  effectiveFrom?: string

  @ApiProperty({
    description: 'Data de fim da vigência',
    example: '2025-12-31',
    type: 'string',
    format: 'date',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: VALIDATION_MESSAGES.INVALID_DATE })
  effectiveTo?: string

  @ApiProperty({
    description: 'Data de criação da condição',
    example: '2025-09-19T10:00:00.000Z',
    type: 'string',
    format: 'date-time',
    readOnly: true,
  })
  createdAt: string
}
