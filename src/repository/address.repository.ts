import { BaseRepository } from './base.repository'
import { AddressSchema } from '@/schemas'
import { PoolClient } from '@/database'

export class AddressRepository extends BaseRepository {
  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
  }

  async findByOrganizationId(organizationId: string): Promise<AddressSchema[]> {
    const query =
      'SELECT * FROM addresses WHERE organization_id = $1 ORDER BY is_primary DESC, created_at ASC'
    return this.executeQuery<AddressSchema>(query, [organizationId])
  }

  async create(
    address: Omit<AddressSchema, 'id' | 'createdAt'>,
  ): Promise<AddressSchema> {
    return this.executeTransaction(async (client: PoolClient) => {
      if (address.isPrimary) {
        await client.query(
          'UPDATE addresses SET is_primary = false WHERE organization_id = $1',
          [address.organizationId],
        )
      }

      const query = `
        INSERT INTO addresses (
          organization_id, street, number, complement, neighborhood, 
          city, state, postal_code, is_primary
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `
      const params = [
        address.organizationId,
        address.street,
        address.number || null,
        address.complement || null,
        address.neighborhood,
        address.city,
        address.state,
        address.postalCode,
        address.isPrimary ?? false,
      ]

      const result = await client.query(query, params)
      return result.rows[0]
    })
  }

  async update(
    id: string,
    address: Partial<
      Omit<AddressSchema, 'id' | 'createdAt' | 'organizationId'>
    >,
  ): Promise<AddressSchema | null> {
    return this.executeTransaction(async (client: PoolClient) => {
      if (address.isPrimary) {
        const orgResult = await client.query(
          'SELECT organization_id FROM addresses WHERE id = $1',
          [id],
        )
        if (orgResult.rows.length > 0) {
          await client.query(
            'UPDATE addresses SET is_primary = false WHERE organization_id = $1',
            [orgResult.rows[0].organization_id],
          )
        }
      }

      const fields: string[] = []
      const params: any[] = []
      let paramIndex = 1

      Object.entries(address).forEach(([key, value]) => {
        if (value !== undefined) {
          const snakeKey = this.toSnakeCase(key)
          fields.push(`${snakeKey} = $${paramIndex}`)
          params.push(value)
          paramIndex++
        }
      })

      if (fields.length === 0) return null

      params.push(id)
      const query = `UPDATE addresses SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`

      const result = await client.query(query, params)
      return result.rows[0] || null
    })
  }

  async delete(id: string): Promise<boolean> {
    return this.executeTransaction(async (client: PoolClient) => {
      const result = await client.query('DELETE FROM addresses WHERE id = $1', [
        id,
      ])
      return (result.rowCount || 0) > 0
    })
  }

  async deleteByOrganizationId(organizationId: string): Promise<boolean> {
    return this.executeTransaction(async (client: PoolClient) => {
      const result = await client.query(
        'DELETE FROM addresses WHERE organization_id = $1',
        [organizationId],
      )
      return (result.rowCount || 0) > 0
    })
  }

  async setPrimaryAddress(id: string): Promise<AddressSchema | null> {
    return this.executeTransaction(async (client: PoolClient) => {
      const addressResult = await client.query(
        'SELECT * FROM addresses WHERE id = $1',
        [id],
      )

      if (addressResult.rows.length === 0) {
        return null
      }

      const address = addressResult.rows[0]

      await client.query(
        'UPDATE addresses SET is_primary = false WHERE organization_id = $1',
        [address.organization_id],
      )

      const result = await client.query(
        'UPDATE addresses SET is_primary = true WHERE id = $1 RETURNING *',
        [id],
      )

      return result.rows[0] || null
    })
  }
}
