import { BaseRepository } from './base.repository'
import { AddressSchema } from '@/schemas'
import { PoolClient } from '@/database'

export class AddressRepository extends BaseRepository {
  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
  }

  private mapRowToModel(row: any): AddressSchema {
    return {
      id: row.id,
      organizationId: row.organization_id,
      street: row.street,
      number: row.number,
      complement: row.complement,
      neighborhood: row.neighborhood,
      city: row.city,
      state: row.state,
      postalCode: row.postal_code || '',
      createdAt: row.created_at,
    }
  }

  async findByOrganizationId(organizationId: string): Promise<AddressSchema[]> {
    const query =
      'SELECT * FROM addresses WHERE organization_id = $1 ORDER BY created_at ASC'
    const rows = await this.executeQuery<any>(query, [organizationId])
    return rows.map((row) => this.mapRowToModel(row))
  }

  async findById(id: string): Promise<AddressSchema | null> {
    const query = 'SELECT * FROM addresses WHERE id = $1'
    const rows = await this.executeQuery<any>(query, [id])
    return rows.length > 0 ? this.mapRowToModel(rows[0]) : null
  }

  async create(
    address: Omit<AddressSchema, 'id' | 'createdAt'>,
  ): Promise<AddressSchema> {
    const query = `
      INSERT INTO addresses (
        organization_id, street, number, complement, neighborhood, 
        city, state, postal_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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
    ]

    const result = await this.executeQuery<any>(query, params)
    return this.mapRowToModel(result[0])
  }

  async update(
    id: string,
    address: Partial<
      Omit<AddressSchema, 'id' | 'createdAt' | 'organizationId'>
    >,
  ): Promise<AddressSchema | null> {
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

    const result = await this.executeQuery<any>(query, params)
    return result.length > 0 ? this.mapRowToModel(result[0]) : null
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
}
