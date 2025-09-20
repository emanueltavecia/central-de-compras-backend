import { ApiProperty } from '../decorators/api-property.decorator'
import { PermissionName } from '../enums'

export class PermissionSchema {
  @ApiProperty({
    description: 'ID único da permissão',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    readOnly: true,
  })
  id: string

  @ApiProperty({
    description: 'Nome da permissão',
    example: PermissionName.MANAGE_STORES,
    type: 'string',
    enum: PermissionName,
    required: true,
  })
  name: PermissionName

  @ApiProperty({
    description: 'Descrição da permissão',
    example: 'Gerenciar lojas',
    type: 'string',
    required: false,
  })
  description?: string
}
