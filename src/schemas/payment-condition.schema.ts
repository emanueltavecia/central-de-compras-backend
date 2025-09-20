import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator'
import { ApiProperty } from '../decorators/api-property.decorator'
import { PaymentMethod } from '../enums'

export class PaymentConditionSchema {
  @ApiProperty({
    description: 'ID único da condição de pagamento',
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
    description: 'Nome da condição de pagamento',
    example: 'À vista com desconto',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string

  @ApiProperty({
    description: 'Prazo de pagamento em dias',
    example: 30,
    type: 'number',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paymentTermDays?: number

  @ApiProperty({
    description: 'Método de pagamento',
    example: PaymentMethod.CREDIT_CARD,
    type: 'string',
    enum: PaymentMethod,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod

  @ApiProperty({
    description: 'Observações sobre a condição de pagamento',
    example: 'Desconto de 5% para pagamento à vista',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string

  @ApiProperty({
    description: 'Se a condição está ativa',
    example: true,
    type: 'boolean',
    required: false,
    readOnly: true,
  })
  active?: boolean

  @ApiProperty({
    description: 'Data de criação da condição',
    example: '2025-09-19T10:00:00.000Z',
    type: 'string',
    format: 'date-time',
    readOnly: true,
  })
  createdAt: string
}
