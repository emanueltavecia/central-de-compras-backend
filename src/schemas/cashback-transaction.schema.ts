import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator'
import { ApiProperty } from '@/decorators'
import { CashbackTransactionType, CashbackReferenceType } from '@/enums'

export class CashbackTransactionSchema {
  @ApiProperty({
    description: 'ID único da transação de cashback',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    readOnly: true,
  })
  @IsOptional()
  @IsUUID(4)
  id?: string

  @ApiProperty({
    description: 'ID da carteira de cashback',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    readOnly: true,
  })
  @IsOptional()
  @IsUUID(4)
  cashbackWalletId?: string

  @ApiProperty({
    description: 'ID do pedido relacionado',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    readOnly: true,
  })
  @IsOptional()
  @IsUUID(4)
  orderId?: string

  @ApiProperty({
    description: 'Tipo da transação',
    example: 'earned',
    enum: CashbackTransactionType,
    readOnly: true,
  })
  @IsOptional()
  @IsEnum(CashbackTransactionType)
  type?: CashbackTransactionType

  @ApiProperty({
    description: 'Valor da transação',
    example: 25.5,
    type: 'number',
    readOnly: true,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number

  @ApiProperty({
    description: 'ID de referência (campanha, condição de estado, etc.)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    readOnly: true,
  })
  @IsOptional()
  @IsUUID(4)
  referenceId?: string

  @ApiProperty({
    description: 'Tipo de referência',
    example: 'campaign',
    enum: CashbackReferenceType,
    readOnly: true,
  })
  @IsOptional()
  @IsEnum(CashbackReferenceType)
  referenceType?: CashbackReferenceType

  @ApiProperty({
    description: 'Descrição da transação',
    example: 'Cashback ganho por campanha promocional',
    type: 'string',
    readOnly: true,
  })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({
    description: 'Data de criação',
    example: '2023-12-01T10:00:00Z',
    type: 'string',
    format: 'date-time',
    readOnly: true,
  })
  @IsOptional()
  createdAt?: string
}
