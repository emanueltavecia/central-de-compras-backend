import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator'
import { ApiProperty } from '../decorators/api-property.decorator'

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
  @IsUUID()
  supplierOrgId: string

  @ApiProperty({
    description: 'Estado (UF)',
    example: 'SC',
    type: 'string',
    required: true,
    maxLength: 2,
  })
  @IsString()
  @Length(2, 2)
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
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  cashbackPercent?: number

  @ApiProperty({
    description: 'Prazo para pagamento em dias',
    example: 30,
    type: 'integer',
    required: false,
  })
  @IsOptional()
  @IsInt()
  paymentTermDays?: number

  @ApiProperty({
    description: 'Ajuste no preço unitário',
    example: 10.5,
    type: 'number',
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  unitPriceAdjustment?: number

  @ApiProperty({
    description: 'Data de início da vigência',
    example: '2025-01-01',
    type: 'string',
    format: 'date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  effectiveFrom?: string

  @ApiProperty({
    description: 'Data de fim da vigência',
    example: '2025-12-31',
    type: 'string',
    format: 'date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
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
