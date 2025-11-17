import { BaseRepository } from './base.repository'
import {
  OrganizationSchema,
  UserSchema,
  AddressSchema,
  OrganizationFiltersSchema,
} from '@/schemas'
import { PoolClient } from '@/database'

export class OrganizationsRepository extends BaseRepository {
  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
  }

  async findAll(
    filters?: OrganizationFiltersSchema,
    includeAddresses: boolean = true,
  ): Promise<OrganizationSchema[]> {
    const conditions: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (filters?.type) {
      conditions.push(`type = $${paramIndex}`)
      params.push(filters.type)
      paramIndex++
    }

    if (filters?.active !== undefined) {
      conditions.push(`active = $${paramIndex}`)
      params.push(filters.active)
      paramIndex++
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const query = `SELECT * FROM organizations ${whereClause} ORDER BY created_at DESC`

    const organizations = await this.executeQuery<OrganizationSchema>(
      query,
      params,
    )

    if (includeAddresses && organizations.length > 0) {
      const orgIds = organizations.map((org) => org.id)
      const placeholders = orgIds.map((_, index) => `$${index + 1}`).join(',')
      const addressQuery = `
        SELECT * FROM addresses 
        WHERE organization_id IN (${placeholders}) 
        ORDER BY organization_id, is_primary DESC, created_at ASC
      `
      const addresses = await this.executeQuery<AddressSchema>(
        addressQuery,
        orgIds,
      )

      const addressMap = new Map<string, AddressSchema[]>()
      addresses.forEach((address) => {
        if (!addressMap.has(address.organizationId)) {
          addressMap.set(address.organizationId, [])
        }
        addressMap.get(address.organizationId)!.push(address)
      })

      organizations.forEach((org) => {
        org.address = addressMap.get(org.id) || []
      })
    }

    return organizations
  }

  async findById(
    id: string,
    includeAddresses: boolean = false,
  ): Promise<OrganizationSchema | null> {
    const query = 'SELECT * FROM organizations WHERE id = $1'
    const result = await this.executeQuery<OrganizationSchema>(query, [id])

    if (result.length === 0) return null

    const organization = result[0]

    if (includeAddresses) {
      const addressQuery =
        'SELECT * FROM addresses WHERE organization_id = $1 ORDER BY is_primary DESC, created_at ASC'
      const addresses = await this.executeQuery<AddressSchema>(addressQuery, [
        id,
      ])
      organization.address = addresses
    }

    return organization
  }

  async create(
    orgData: Omit<OrganizationSchema, 'id' | 'createdAt' | 'createdBy'>,
    createdBy: string,
  ): Promise<OrganizationSchema> {
    const query = `
      INSERT INTO organizations (legal_name, trade_name, type, email, phone, tax_id, website, active, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `
    const result = await this.executeQuery<OrganizationSchema>(query, [
      orgData.legalName || null,
      orgData.tradeName || null,
      orgData.type,
      orgData.email || null,
      orgData.phone || null,
      orgData.taxId || null,
      orgData.website || null,
      orgData.active ?? true,
      createdBy,
    ])
    return result[0]
  }

  async update(
    id: string,
    orgData: Partial<
      Omit<OrganizationSchema, 'id' | 'createdAt' | 'createdBy'>
    >,
  ): Promise<OrganizationSchema | null> {
    const fields: string[] = []
    const params: any[] = []
    let paramIndex = 1

    Object.entries(orgData).forEach(([key, value]) => {
      if (value !== undefined) {
        const snakeKey = this.toSnakeCase(key)
        fields.push(`${snakeKey} = $${paramIndex}`)
        params.push(value)
        paramIndex++
      }
    })

    if (fields.length === 0) return null

    params.push(id)
    const query = `UPDATE organizations SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`

    const result = await this.executeQuery<OrganizationSchema>(query, params)
    return result[0] || null
  }

  async hasRelations(id: string): Promise<boolean> {
    const query =
      'SELECT COUNT(*) AS total FROM users WHERE organization_id = $1'
    const result = await this.executeQuery<{ total: string }>(query, [id])
    return parseInt(result[0].total, 10) > 0
  }

  async deletePermanent(id: string): Promise<boolean> {
    return this.executeTransaction(async (client: PoolClient) => {
      const result = await client.query(
        'DELETE FROM organizations WHERE id = $1',
        [id],
      )
      return (result.rowCount || 0) > 0
    })
  }

  async updateStatus(
    id: string,
    active: boolean,
  ): Promise<OrganizationSchema | null> {
    const query =
      'UPDATE organizations SET active = $1 WHERE id = $2 RETURNING *'
    const result = await this.executeQuery<OrganizationSchema>(query, [
      active,
      id,
    ])
    return result[0] || null
  }

  async findUsers(id: string): Promise<Partial<UserSchema>[]> {
    const query = `
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.role_id,
        u.status,
        u.created_at
      FROM users u
      WHERE u.organization_id = $1
      ORDER BY u.created_at DESC
    `
    return this.executeQuery(query, [id])
  }

  async checkExistsByDocument(taxId: string): Promise<boolean> {
    const query = 'SELECT 1 FROM organizations WHERE tax_id = $1'
    const result = await this.executeQuery(query, [taxId])
    return result.length > 0
  }

  async checkExistsByEmail(email: string): Promise<boolean> {
    const query = 'SELECT 1 FROM organizations WHERE email = $1'
    const result = await this.executeQuery(query, [email])
    return result.length > 0
  }

  async checkExistsByPhone(phone: string): Promise<boolean> {
    const query = 'SELECT 1 FROM organizations WHERE phone = $1'
    const result = await this.executeQuery(query, [phone])
    return result.length > 0
  }
}
