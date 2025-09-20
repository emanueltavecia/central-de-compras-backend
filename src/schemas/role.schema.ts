import { Type } from 'class-transformer'
import { ApiProperty } from '../decorators/api-property.decorator'
import { PermissionSchema } from './permission.schema'

export class RoleSchema {
  @ApiProperty({
    description: 'ID único da role',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    readOnly: true,
  })
  id: string

  @ApiProperty({
    description: 'Nome da role',
    example: 'Admin',
    type: 'string',
    required: true,
    readOnly: true,
  })
  name: string

  @ApiProperty({
    description: 'Descrição da role',
    example: 'Administrador do sistema',
    type: 'string',
    required: false,
    readOnly: true,
  })
  description?: string

  @ApiProperty({
    description: 'Data de criação da role',
    example: '2025-09-19T10:00:00.000Z',
    type: 'string',
    format: 'date-time',
    readOnly: true,
  })
  createdAt: string

  @ApiProperty({
    description: 'Permissões associadas',
    type: 'array',
    schema: PermissionSchema,
    required: true,
    readOnly: true,
  })
  @Type(() => PermissionSchema)
  permissions: PermissionSchema[]
}
