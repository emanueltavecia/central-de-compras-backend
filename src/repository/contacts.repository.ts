import { BaseRepository } from './base.repository'
import { ContactSchema, ContactFiltersSchema } from '@/schemas'
import { PoolClient } from '@/database'

export class ContactRepository extends BaseRepository {
  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
  }

  async create(
    contact: Omit<ContactSchema, 'id' | 'createdAt'>,
  ): Promise<ContactSchema> {
    return this.executeTransaction(async (client: PoolClient) => {
      if (contact.isPrimary) {
        const existingPrimary = await client.query(
          'SELECT id FROM contacts WHERE organization_id = $1 AND is_primary = true',
          [contact.organizationId],
        )
        if (existingPrimary.rows.length > 0) {
          throw new Error(
            'Já existe um contato principal para esta organização',
          )
        }
      }

      const query = `
              INSERT INTO contacts (
                organization_id, name, email, phone, role, is_primary
              ) VALUES ($1, $2, $3, $4, $5, $6)
              RETURNING *
          `
      const params = [
        contact.organizationId,
        contact.name,
        contact.email,
        contact.phone || null,
        contact.role || null,
        contact.isPrimary ?? false,
      ]

      const result = await client.query(query, params)
      return result.rows[0]
    })
  }

  async findAll(filters: ContactFiltersSchema = {}): Promise<ContactSchema[]> {
    const conditions: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (filters.organizationId) {
      conditions.push(`organization_id = $${paramIndex}`)
      params.push(filters.organizationId)
      paramIndex++
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const query = `SELECT * FROM contacts ${whereClause} ORDER BY name ASC`

    return this.executeQuery<ContactSchema>(query, params)
  }

  async findById(id: string): Promise<ContactSchema | null> {
    const query = 'SELECT * FROM contacts WHERE id = $1'
    const result = await this.executeQuery<ContactSchema>(query, [id])
    return result[0] || null
  }

  async update(
    id: string,
    contact: Partial<Omit<ContactSchema, 'id' | 'createdAt'>>,
  ): Promise<ContactSchema | null> {
    return this.executeTransaction(async (client: PoolClient) => {
      const currentContactResult = await client.query(
        'SELECT organization_id FROM contacts WHERE id = $1',
        [id],
      )

      if (currentContactResult.rows.length === 0) {
        return null
      }

      const organizationId = currentContactResult.rows[0].organization_id

      if (contact.isPrimary) {
        const existingPrimary = await client.query(
          'SELECT id FROM contacts WHERE organization_id = $1 AND is_primary = true',
          [organizationId],
        )
        if (
          existingPrimary.rows.length > 0 &&
          existingPrimary.rows[0].id !== id
        ) {
          throw new Error(
            'Já existe um contato principal para esta organização',
          )
        }
      }

      const fields: string[] = []
      const params: any[] = []
      let paramIndex = 1

      Object.entries(contact).forEach(([key, value]) => {
        if (value !== undefined) {
          const snakeKey = this.toSnakeCase(key)
          fields.push(`${snakeKey} = $${paramIndex}`)
          params.push(value)
          paramIndex++
        }
      })

      if (fields.length === 0) return null

      params.push(id)
      const query = `UPDATE contacts SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`

      const result = await client.query(query, params)
      return result.rows[0] || null
    })
  }

  async delete(id: string): Promise<boolean> {
    return this.executeTransaction(async (client: PoolClient) => {
      const result = await client.query('DELETE FROM contacts WHERE id = $1', [
        id,
      ])
      return (result.rowCount || 0) > 0
    })
  }

  async setPrimaryContact(id: string): Promise<ContactSchema | null> {
    return this.executeTransaction(async (client: PoolClient) => {
      const contactResult = await client.query(
        'SELECT * FROM contacts WHERE id = $1',
        [id],
      )

      if (contactResult.rows.length === 0) {
        return null
      }

      const contact = contactResult.rows[0]

      const existingPrimary = await client.query(
        'SELECT id FROM contacts WHERE organization_id = $1 AND is_primary = true',
        [contact.organization_id],
      )

      if (
        existingPrimary.rows.length > 0 &&
        existingPrimary.rows[0].id !== id
      ) {
        throw new Error('Já existe um contato principal para esta organização')
      }

      const result = await client.query(
        'UPDATE contacts SET is_primary = true WHERE id = $1 RETURNING *',
        [id],
      )

      return result.rows[0] || null
    })
  }

  async unsetPrimaryContact(id: string): Promise<ContactSchema | null> {
    return this.executeTransaction(async (client: PoolClient) => {
      const contactResult = await client.query(
        'SELECT * FROM contacts WHERE id = $1',
        [id],
      )

      if (contactResult.rows.length === 0) {
        return null
      }

      const result = await client.query(
        'UPDATE contacts SET is_primary = false WHERE id = $1 RETURNING *',
        [id],
      )

      return result.rows[0] || null
    })
  }
}
