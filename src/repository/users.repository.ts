import { BaseRepository } from './base.repository'
import { UserSchema } from '@/schemas'

export class UsersRepository extends BaseRepository {
    async findAllByOrganization(
      organizationId: string,
      filters?: { status?: string; roleId?: string },
  ): Promise<UserSchema[]> {
      const conditions: string[] = ['u.organization_id = $1']
      const params: any[] = [organizationId]
      let paramIndex = 2

      if (filters?.status) {
        conditions.push(`u.status = $${paramIndex++}`)
        params.push(filters.status)
      }

      if (filters?.roleId) {
        conditions.push(`u.role_id = $${paramIndex++}`)
        params.push(filters.roleId)
      }

    const query = `
    SELECT 
        u.id,
        u.email,
        u.full_name,
        u.phone,
        u.role_id,
        u.organization_id,
        u.status,
        u.created_by,
        u.created_at,
        r.id as role_id,
        r.name as role_name,
        r.description as role_description,
        r.created_at as role_created_at,
        COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
            'id', p.id,
            'name', p.name,
            'description', p.description
            )
        ) FILTER (WHERE p.id IS NOT NULL),
        '[]'::json
        ) as role_permissions
    FROM users u
    INNER JOIN roles r ON u.role_id = r.id
    LEFT JOIN role_permissions rp ON r.id = rp.role_id
    LEFT JOIN permissions p ON rp.permission_id = p.id
    WHERE ${conditions.join(' AND ')}
    GROUP BY u.id, r.id
    ORDER BY u.created_at DESC
    `

    const result = await this.executeQuery<any>(query, params)

    return result.map((row) => ({
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    roleId: row.role_id,
    organizationId: row.organization_id,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at,
    role: {
        id: row.role_id,
        name: row.role_name,
        description: row.role_description,
        createdAt: row.role_created_at,
        permissions: row.role_permissions || [],
    },
    }))
  }

  async findById(id: string, organizationId: string): Promise<UserSchema | null> {
    const query = `
    SELECT 
        u.id,
        u.email,
        u.full_name,
        u.phone,
        u.role_id,
        u.organization_id,
        u.status,
        u.created_by,
        u.created_at,
        r.id as role_id,
        r.name as role_name,
        r.description as role_description,
        r.created_at as role_created_at,
        COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
            'id', p.id,
            'name', p.name,
            'description', p.description
            )
        ) FILTER (WHERE p.id IS NOT NULL),
        '[]'::json
        ) as role_permissions
    FROM users u
    INNER JOIN roles r ON u.role_id = r.id
    LEFT JOIN role_permissions rp ON r.id = rp.role_id
    LEFT JOIN permissions p ON rp.permission_id = p.id
    WHERE u.id = $1 AND u.organization_id = $2
    GROUP BY u.id, r.id
    `

    const result = await this.executeQuery<any>(query, [id, organizationId])
    if (result.length === 0) return null

    const row = result[0]
    return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    roleId: row.role_id,
    organizationId: row.organization_id,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at,
    role: {
        id: row.role_id,
        name: row.role_name,
        description: row.role_description,
        createdAt: row.role_created_at,
        permissions: row.role_permissions || [],
    },
    }
  }

  async create(
    userData: Partial<UserSchema>,
    createdBy: string,
  ): Promise<UserSchema> {
    const query = `
      INSERT INTO users (email, password, full_name, phone, role_id, organization_id, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `

    const result = await this.executeQuery<any>(query, [
      userData.email,
      userData.password,
      userData.fullName || null,
      userData.phone || null,
      userData.roleId,
      userData.organizationId,
      createdBy,
    ])

    return this.findById(result[0].id, userData.organizationId!) as Promise<UserSchema>
  }

  async update(
    id: string,
    organizationId: string,
    userData: Partial<UserSchema>,
  ): Promise<UserSchema | null> {
    const fields: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (userData.email) {
      fields.push(`email = $${paramIndex++}`)
      params.push(userData.email)
    }
    if (userData.fullName) {
      fields.push(`full_name = $${paramIndex++}`)
      params.push(userData.fullName)
    }
    if (userData.phone) {
      fields.push(`phone = $${paramIndex++}`)
      params.push(userData.phone)
    }
    if (userData.roleId) {
      fields.push(`role_id = $${paramIndex++}`)
      params.push(userData.roleId)
    }
    if (userData.password) {
      fields.push(`password = $${paramIndex++}`)
      params.push(userData.password)
    }

    if (fields.length === 0) return this.findById(id, organizationId)

    params.push(id, organizationId)

    const query = `
      UPDATE users
      SET ${fields.join(', ')}, updated_at = now()
      WHERE id = $${paramIndex++} AND organization_id = $${paramIndex++}
      RETURNING id
    `

    const result = await this.executeQuery<any>(query, params)
    if (result.length === 0) return null

    return this.findById(result[0].id, organizationId)
  }

  async updateStatus(id: string, organizationId: string, status: string): Promise<UserSchema | null> {
    const query = `
      UPDATE users
      SET status = $1
      WHERE id = $2 AND organization_id = $3
      RETURNING id
    `

    const result = await this.executeQuery<any>(query, [status, id, organizationId])
    if (result.length === 0) return null

    return this.findById(result[0].id, organizationId)
  }

  async delete(id: string, organizationId: string): Promise<void> {
    const query = `
      UPDATE users
      SET status = 'inactive'
      WHERE id = $1 AND organization_id = $2
    `
    await this.executeQuery(query, [id, organizationId])
  }

  async updatePassword(id: string, organizationId: string, hashedPassword: string): Promise<void> {
    const query = `
      UPDATE users
      SET password = $1
      WHERE id = $2 AND organization_id = $3
    `
    await this.executeQuery(query, [hashedPassword, id, organizationId])
  }

  async getUserPermissions(id: string, organizationId: string): Promise<string[]> {
    const query = `
      SELECT p.name
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      INNER JOIN role_permissions rp ON r.id = rp.role_id
      INNER JOIN permissions p ON rp.permission_id = p.id
      WHERE u.id = $1 AND u.organization_id = $2
    `
    const result = await this.executeQuery<{ name: string }>(query, [id, organizationId])
    return result.map((row) => row.name)
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const query = 'SELECT 1 FROM users WHERE email = $1'
    const result = await this.executeQuery(query, [email])
    return result.length > 0
  }
}
