import {
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
  IsDateString,
} from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiProperty } from '@/decorators'
import { VALIDATION_MESSAGES } from '@/utils'

export class PaymentConditionFiltersSchema {
  @ApiProperty({
    description: 'Status da condição (ativa/inativa)',
    example: true,
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }: { value: any }) => value === 'true' || value === true)
  @IsBoolean({ message: VALIDATION_MESSAGES.INVALID_BOOLEAN })
  status?: boolean

  @ApiProperty({
    description: 'Nome da condição de pagamento (busca parcial)',
    example: 'vista',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.INVALID_STRING })
  name?: string

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
    description: 'Filtrar por data de criação exata (YYYY-MM-DD)',
    example: '2025-09-19',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: VALIDATION_MESSAGES.INVALID_DATE })
  createdAt?: string
}
