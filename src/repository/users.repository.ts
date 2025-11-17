import { HttpError } from '@/utils'
import { BaseRepository } from './base.repository'
import { UserSchema } from '@/schemas'
import { UserAccountStatus, UserRole } from '@/enums'

export class UsersRepository extends BaseRepository {
  async getRoleIdByName(roleName: string): Promise<string> {
    const query = `SELECT id FROM roles WHERE name = $1 LIMIT 1`
    const result = await this.executeQuery<{ id: string }>(query, [roleName])

    if (result.length === 0) {
      throw new Error(`Role '${roleName}' não encontrada`)
    }

    return result[0].id
  }

  async findAll(filters?: {
    status?: string
    roleId?: string
    organizationId?: string
  }): Promise<UserSchema[]> {
    const conditions: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (filters?.status) {
      conditions.push(`u.status = $${paramIndex++}`)
      params.push(filters.status)
    }

    if (filters?.roleId) {
      conditions.push(`u.role_id = $${paramIndex++}`)
      params.push(filters.roleId)
    }

    if (filters?.organizationId) {
      conditions.push(`u.organization_id = $${paramIndex++}`)
      params.push(filters.organizationId)
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const query = `
      SELECT 
        u.id,
  u.email,
  u.password_plain as "passwordPlain",
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
        o.id as organization_id,
        o.type as organization_type,
        o.legal_name as organization_legal_name,
        o.trade_name as organization_trade_name,
        o.tax_id as organization_tax_id,
        o.phone as organization_phone,
        o.email as organization_email,
        o.website as organization_website,
        o.active as organization_active,
        o.created_at as organization_created_at,
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
      LEFT JOIN organizations o ON u.organization_id = o.id
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      ${whereClause}
      GROUP BY u.id, r.id, o.id
      ORDER BY u.created_at DESC
    `

    return this.executeQuery<UserSchema>(query, params)
  }

  async findById(id: string): Promise<UserSchema | null> {
    const query = `
      SELECT 
        u.id,
  u.email,
  u.password_plain as "passwordPlain",
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
        o.id as organization_id,
        o.type as organization_type,
        o.legal_name as organization_legal_name,
        o.trade_name as organization_trade_name,
        o.tax_id as organization_tax_id,
        o.phone as organization_phone,
        o.email as organization_email,
        o.website as organization_website,
        o.active as organization_active,
        o.created_at as organization_created_at,
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
      LEFT JOIN organizations o ON u.organization_id = o.id
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE u.id = $1
      GROUP BY u.id, r.id, o.id
    `

    const result = await this.executeQuery<any>(query, [id])
    if (result.length === 0) return null

    return result[0]
  }

  async create(
    userData: Partial<UserSchema>,
    createdBy: string,
    passwordPlain?: string,
  ): Promise<UserSchema> {
    const query = `
      INSERT INTO users (email, password, password_plain, full_name, phone, role_id, organization_id, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `

    const result = await this.executeQuery<UserSchema>(query, [
      userData.email,
      userData.password,
      passwordPlain || null,
      userData.fullName || null,
      userData.phone || null,
      userData.roleId,
      userData.organizationId,
      createdBy,
    ])

    return result[0]
  }

  async update(
    id: string,
    organizationId: string,
    userData: Partial<UserSchema>,
    passwordPlain?: string,
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
    if (userData.password) {
      fields.push(`password = $${paramIndex++}`)
      params.push(userData.password)
      fields.push(`password_plain = $${paramIndex++}`)
      params.push(passwordPlain || null)
    }

    if (fields.length === 0) return this.findById(id)

    params.push(id)

    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex++}
      RETURNING *
    `

    const result = await this.executeQuery<UserSchema>(query, params)
    if (result.length === 0) return null

    // Return enriched user with role, organization, and mapped fields
    return this.findById(id)
  }

  async updateStatus(
    id: string,
    organizationId: string,
    status: UserAccountStatus,
  ): Promise<UserSchema | null> {
    const query = `
      UPDATE users
      SET status = $1
      WHERE id = $2
      RETURNING *
    `

    const result = await this.executeQuery<UserSchema>(query, [
      status,
      id,
    ])
    if (result.length === 0) return null

    return result[0]
  }

  async hasRelatedRecords(userId: string): Promise<boolean> {
    const queries = [
      `SELECT 1 FROM products WHERE created_by = $1 LIMIT 1`,
      `SELECT 1 FROM orders WHERE created_by = $1 LIMIT 1`,
      `SELECT 1 FROM organizations WHERE created_by = $1 LIMIT 1`,
    ]

    for (const query of queries) {
      const result = await this.executeQuery<any>(query, [userId])
      if (result.length > 0) return true
    }

    return false
  }

  async delete(id: string): Promise<'deleted' | 'inactivated'> {
    const user = await this.findById(id)
    if (!user)
      throw new HttpError('Usuário não encontrado', 404, 'USER_NOT_FOUND')

    if (user.role?.name === UserRole.ADMIN) {
      throw new HttpError(
        'Não é possível excluir usuário admin',
        400,
        'CANNOT_DELETE_ADMIN',
      )
    }
    const hasRelations = await this.hasRelatedRecords(id)

    if (hasRelations) {
      await this.executeQuery(
        `UPDATE users SET status = 'inactive' WHERE id = $1`,
        [id],
      )
      return 'inactivated'
    } else {
      await this.executeQuery(`DELETE FROM users WHERE id = $1`, [id])
      return 'deleted'
    }
  }

  async getUserPermissions(
    id: string,
    organizationId: string,
  ): Promise<string[]> {
    const query = `
      SELECT p.name
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      INNER JOIN role_permissions rp ON r.id = rp.role_id
      INNER JOIN permissions p ON rp.permission_id = p.id
      WHERE u.id = $1 AND u.organization_id = $2
    `
    const result = await this.executeQuery<{ name: string }>(query, [
      id,
      organizationId,
    ])
    return result.map((row) => row.name)
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const query = 'SELECT 1 FROM users WHERE email = $1'
    const result = await this.executeQuery(query, [email])
    return result.length > 0
  }
}
