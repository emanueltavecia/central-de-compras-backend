import { BaseRepository } from './base.repository'
import { UserSchema } from '@/schemas'

export class AuthRepository extends BaseRepository {
  async findByEmail(email: string): Promise<UserSchema | null> {
    const query = `
      SELECT 
        u.id as "id",
        u.email as "email",
        u.password as "password",
        u.full_name as "fullName",
        u.phone as "phone",
        u.role_id as "roleId",
        u.organization_id as "organizationId",
        u.status as "status",
        u.created_by as "createdBy",
        u.created_at as "createdAt",
        u.profile_image_url as "profileImageUrl",
        r.id as "roleId",
        r.name as "roleName",
        r.description as "roleDescription",
        r.created_at as "roleCreatedAt",
        o.id as "organizationId",
        o.type as "organizationType",
        o.legal_name as "organizationLegalName",
        o.trade_name as "organizationTradeName",
        o.tax_id as "organizationTaxId",
        o.phone as "organizationPhone",
        o.email as "organizationEmail",
        o.website as "organizationWebsite",
        o.active as "organizationActive",
        o.created_at as "organizationCreatedAt",
        (
          SELECT COALESCE(JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', p.id,
              'name', p.name,
              'description', p.description
            )
          ), '[]'::json)
          FROM permissions p
          INNER JOIN role_permissions rp ON p.id = rp.permission_id
          WHERE rp.role_id = r.id
        ) as "rolePermissions",
        (
          SELECT COALESCE(JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', a.id,
              'organizationId', a.organization_id,
              'street', a.street,
              'number', a.number,
              'complement', a.complement,
              'neighborhood', a.neighborhood,
              'city', a.city,
              'state', a.state,
              'postalCode', a.postal_code,
              'isPrimary', a.is_primary,
              'createdAt', a.created_at
            )
          ), '[]'::json)
          FROM addresses a
          WHERE a.organization_id = o.id
        ) as "organizationAddresses"
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      LEFT JOIN organizations o ON u.organization_id = o.id
      WHERE u.email = $1
    `

    const result = await this.executeQuery<any>(query, [email])

    if (result.length === 0) {
      return null
    }

    const user = result[0]
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      fullName: user.fullName,
      phone: user.phone,
      roleId: user.roleId,
      organizationId: user.organizationId,
      status: user.status,
      createdBy: user.createdBy,
      createdAt: user.createdAt,
      profileImageUrl: user.profileImageUrl || undefined,
      role: {
        id: user.roleId,
        name: user.roleName,
        description: user.roleDescription,
        createdAt: user.roleCreatedAt,
        permissions: user.rolePermissions || [],
      },
      organization: user.organizationId
        ? {
            id: user.organizationId,
            type: user.organizationType,
            legalName: user.organizationLegalName,
            tradeName: user.organizationTradeName,
            taxId: user.organizationTaxId,
            phone: user.organizationPhone,
            email: user.organizationEmail,
            website: user.organizationWebsite,
            active: user.organizationActive,
            createdAt: user.organizationCreatedAt,
            address: user.organizationAddresses || [],
          }
        : undefined,
    }
  }

  async findById(id: string): Promise<UserSchema | null> {
    const query = `
      SELECT 
        u.id as "id",
        u.email as "email",
        u.full_name as "fullName",
        u.phone as "phone",
        u.role_id as "roleId",
        u.organization_id as "organizationId",
        u.status as "status",
        u.created_by as "createdBy",
        u.created_at as "createdAt",
        u.profile_image_url as "profileImageUrl",
        r.id as "roleId",
        r.name as "roleName",
        r.description as "roleDescription",
        r.created_at as "roleCreatedAt",
        o.id as "organizationId",
        o.type as "organizationType",
        o.legal_name as "organizationLegalName",
        o.trade_name as "organizationTradeName",
        o.tax_id as "organizationTaxId",
        o.phone as "organizationPhone",
        o.email as "organizationEmail",
        o.website as "organizationWebsite",
        o.active as "organizationActive",
        o.created_at as "organizationCreatedAt",
        (
          SELECT COALESCE(JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', p.id,
              'name', p.name,
              'description', p.description
            )
          ), '[]'::json)
          FROM permissions p
          INNER JOIN role_permissions rp ON p.id = rp.permission_id
          WHERE rp.role_id = r.id
        ) as "rolePermissions",
        (
          SELECT COALESCE(JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', a.id,
              'organizationId', a.organization_id,
              'street', a.street,
              'number', a.number,
              'complement', a.complement,
              'neighborhood', a.neighborhood,
              'city', a.city,
              'state', a.state,
              'postalCode', a.postal_code,
              'isPrimary', a.is_primary,
              'createdAt', a.created_at
            )
          ), '[]'::json)
          FROM addresses a
          WHERE a.organization_id = o.id
        ) as "organizationAddresses"
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      LEFT JOIN organizations o ON u.organization_id = o.id
      WHERE u.id = $1
    `

    const result = await this.executeQuery<any>(query, [id])

    if (result.length === 0) {
      return null
    }

    const user = result[0]
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      roleId: user.roleId,
      organizationId: user.organizationId,
      status: user.status,
      createdBy: user.createdBy,
      createdAt: user.createdAt,
      profileImageUrl: user.profileImageUrl || undefined,
      role: {
        id: user.roleId,
        name: user.roleName,
        description: user.roleDescription,
        createdAt: user.roleCreatedAt,
        permissions: user.rolePermissions || [],
      },
      organization: user.organizationId
        ? {
            id: user.organizationId,
            type: user.organizationType,
            legalName: user.organizationLegalName,
            tradeName: user.organizationTradeName,
            taxId: user.organizationTaxId,
            phone: user.organizationPhone,
            email: user.organizationEmail,
            website: user.organizationWebsite,
            active: user.organizationActive,
            createdAt: user.organizationCreatedAt,
            address: user.organizationAddresses || [],
          }
        : undefined,
    }
  }

  async create(
    userData: Partial<UserSchema>,
    createdBy: string,
  ): Promise<UserSchema> {
    const query = `
      INSERT INTO users (email, password, full_name, phone, role_id, organization_id, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, full_name, phone, role_id, organization_id, status, created_by, created_at
    `

    const result = await this.executeQuery<any>(query, [
      userData.email,
      userData.password,
      userData.fullName || null,
      userData.phone || null,
      userData.roleId,
      userData.organizationId || null,
      createdBy,
    ])

    const newUser = result[0]

    return this.findById(newUser.id) as Promise<UserSchema>
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const query = 'SELECT 1 FROM users WHERE email = $1'
    const result = await this.executeQuery(query, [email])
    return result.length > 0
  }

  async checkRoleExists(roleId: string): Promise<boolean> {
    const query = 'SELECT 1 FROM roles WHERE id = $1'
    const result = await this.executeQuery(query, [roleId])
    return result.length > 0
  }

  async checkOrganizationExists(organizationId: string): Promise<boolean> {
    const query = 'SELECT 1 FROM organizations WHERE id = $1 AND active = TRUE'
    const result = await this.executeQuery(query, [organizationId])
    return result.length > 0
  }

  async getRolePermissions(roleId: string): Promise<string[]> {
    const query = `
      SELECT p.name
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = $1
    `

    const result = await this.executeQuery<{ name: string }>(query, [roleId])
    return result.map((row) => row.name)
  }
}
