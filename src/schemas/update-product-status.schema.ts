import { ApiProperty } from '@/decorators'

export class UpdateProductStatusSchema {
  @ApiProperty({
    description: 'Se o produto está ativo',
    example: true,
    type: 'boolean',
    required: true,
  })
  active: boolean
}
