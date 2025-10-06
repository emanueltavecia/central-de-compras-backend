// src/repositories/organizations.repository.ts
import { BaseRepository } from './base.repository'
import { OrganizationSchema, UserSchema } from '@/schemas'

export class OrganizationsRepository extends BaseRepository {
  async findAll(filters?: { type?: string; active?: boolean }): Promise<OrganizationSchema[]> {
    let query = `
      SELECT 
        o.id,
        o.name,
        o.type,
        o.email,
        o.phone,
        o.document,
        o.active,
        o.created_by,
        o.created_at
      FROM organizations o
      WHERE 1=1
    `
    const params: any[] = []

    if (filters?.type) {
      params.push(filters.type)
      query += ` AND o.type = $${params.length}`
    }

    if (filters?.active !== undefined) {
      params.push(filters.active)
      query += ` AND o.active = $${params.length}`
    }

    query += ` ORDER BY o.created_at DESC`

    return this.executeQuery<OrganizationSchema>(query, params)
  }

  async findById(id: string): Promise<OrganizationSchema | null> {
    const query = `
      SELECT 
        o.id,
        o.name,
        o.type,
        o.email,
        o.phone,
        o.document,
        o.active,
        o.created_by,
        o.created_at
      FROM organizations o
      WHERE o.id = $1
    `
    const result = await this.executeQuery<OrganizationSchema>(query, [id])
    return result.length > 0 ? result[0] : null
  }

  async create(
    orgData: Partial<OrganizationSchema>,
    createdBy: string,
  ): Promise<OrganizationSchema> {
    const query = `
      INSERT INTO organizations (name, type, email, phone, document, active, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, type, email, phone, document, active, created_by, created_at
    `
    const result = await this.executeQuery<OrganizationSchema>(query, [
      orgData.legalName,
      orgData.type,
      orgData.email || null,
      orgData.phone || null,
      orgData.taxId || null,
      orgData.active ?? true,
      createdBy,
    ])
    return result[0]
  }

  async update(id: string, orgData: Partial<OrganizationSchema>): Promise<OrganizationSchema> {
    const query = `
      UPDATE organizations
      SET 
        name = COALESCE($1, name),
        type = COALESCE($2, type),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        document = COALESCE($5, document),
        active = COALESCE($6, active)
      WHERE id = $7
      RETURNING id, name, type, email, phone, document, active, created_by, created_at
    `
    const result = await this.executeQuery<OrganizationSchema>(query, [
      orgData.legalName ?? null,
      orgData.type ?? null,
      orgData.email ?? null,
      orgData.phone ?? null,
      orgData.taxId ?? null,
      orgData.active ?? null,
      id,
    ])
    return result[0]
  }

  async hasRelations(id: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) AS total
      FROM users
      WHERE organization_id = $1
    `
    const result = await this.executeQuery<{ total: string }>(query, [id])
    return parseInt(result[0].total, 10) > 0
  }

  async deletePermanent(id: string): Promise<void> {
    const query = `DELETE FROM organizations WHERE id = $1`
    await this.executeQuery(query, [id])
  }

  async updateStatus(id: string, active: boolean): Promise<OrganizationSchema> {
    const query = `
      UPDATE organizations
      SET active = $1
      WHERE id = $2
      RETURNING id, name, type, email, phone, document, active, created_by, created_at
    `
    const result = await this.executeQuery<OrganizationSchema>(query, [active, id])
    return result[0]
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

  async checkExistsByDocument(document: string): Promise<boolean> {
    const query = 'SELECT 1 FROM organizations WHERE document = $1'
    const result = await this.executeQuery(query, [document])
    return result.length > 0
  }

  async checkExistsByEmail(email: string): Promise<boolean> {
    const query = 'SELECT 1 FROM organizations WHERE email = $1'
    const result = await this.executeQuery(query, [email])
    return result.length > 0
  }
}
