import { IsUUID, IsOptional, IsString, IsNumberString } from 'class-validator'
import { ApiProperty } from '@/decorators'

export class IdParamSchema {
  @ApiProperty({
    description: 'ID único do recurso',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'ID deve ser um UUID válido' })
  id!: string
}

export class OptionalIdParamSchema {
  @ApiProperty({
    description: 'ID único do recurso',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID deve ser um UUID válido' })
  id?: string
}

export class NumericIdParamSchema {
  @ApiProperty({
    description: 'ID numérico do recurso',
    example: '123',
  })
  @IsNumberString({}, { message: 'ID deve ser um número válido' })
  id!: string
}

export class SlugParamSchema {
  @ApiProperty({
    description: 'Slug ou identificador textual do recurso',
    example: 'minha-campanha',
  })
  @IsString({ message: 'Slug deve ser uma string válida' })
  slug!: string
}
