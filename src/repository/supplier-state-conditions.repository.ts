import { BaseRepository } from './base.repository'
import { SupplierStateConditionSchema, UserSchema } from '@/schemas'
import { PoolClient } from '@/database'
import { HttpError } from '@/utils'
import { UserRole } from '@/enums'

interface FindAllFilters {
  supplierOrgId?: string
  state?: string
  userOrgId?: string
  isSupplier?: boolean
}

export class SupplierStateConditionsRepository extends BaseRepository {
  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
  }

  async findAll(
    filters: FindAllFilters,
  ): Promise<SupplierStateConditionSchema[]> {
    const conditions: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (filters.isSupplier && filters.userOrgId) {
      conditions.push(`supplier_org_id = $${paramIndex}`)
      params.push(filters.userOrgId)
      paramIndex++
    } else if (filters.supplierOrgId) {
      conditions.push(`supplier_org_id = $${paramIndex}`)
      params.push(filters.supplierOrgId)
      paramIndex++
    }

    if (filters.state) {
      conditions.push(`state = $${paramIndex}`)
      params.push(filters.state)
      paramIndex++
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const query = `SELECT * FROM supplier_state_conditions ${whereClause} ORDER BY created_at DESC`

    return this.executeQuery<SupplierStateConditionSchema>(query, params)
  }

  async findById(
    id: string,
    currentUser: UserSchema,
  ): Promise<SupplierStateConditionSchema | null> {
    const query = 'SELECT * FROM supplier_state_conditions WHERE id = $1'
    const result = await this.executeQuery<SupplierStateConditionSchema>(
      query,
      [id],
    )

    if (result.length === 0) return null

    const condition = result[0]

    if (
      currentUser!.role?.name === UserRole.SUPPLIER &&
      condition.supplierOrgId !== currentUser!.organizationId
    ) {
      throw new HttpError('Acesso negado', 403, 'FORBIDDEN')
    }

    return condition
  }

  async create(
    conditionData: Omit<SupplierStateConditionSchema, 'id' | 'createdAt'>,
  ): Promise<SupplierStateConditionSchema> {
    const existsQuery = `
      SELECT 1 
      FROM supplier_state_conditions 
      WHERE supplier_org_id = $1 AND state = $2
    `
    const exists = await this.executeQuery(existsQuery, [
      conditionData.supplierOrgId,
      conditionData.state,
    ])
    if (exists.length > 0) {
      throw new HttpError(
        'Já existe condição para este fornecedor e estado',
        409,
        'CONDITION_EXISTS',
      )
    }

    const query = `
      INSERT INTO supplier_state_conditions (
        supplier_org_id,
        state,
        cashback_percent,
        payment_term_days,
        unit_price_adjustment,
        effective_from,
        effective_to
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `
    const result = await this.executeQuery<SupplierStateConditionSchema>(
      query,
      [
        conditionData.supplierOrgId,
        conditionData.state,
        conditionData.cashbackPercent ?? null,
        conditionData.paymentTermDays ?? null,
        conditionData.unitPriceAdjustment ?? null,
        conditionData.effectiveFrom ?? null,
        conditionData.effectiveTo ?? null,
      ],
    )

    return result[0]
  }

  async update(
    id: string,
    conditionData: Partial<
      Omit<SupplierStateConditionSchema, 'id' | 'createdAt'>
    >,
    currentUser: UserSchema,
  ): Promise<SupplierStateConditionSchema | null> {
    const existing = await this.findById(id, currentUser)
    if (!existing) {
      throw new HttpError('Condição não encontrada', 404, 'CONDITION_NOT_FOUND')
    }

    const fields: string[] = []
    const params: any[] = []
    let paramIndex = 1

    Object.entries(conditionData).forEach(([key, value]) => {
      if (value !== undefined) {
        const snakeKey = this.toSnakeCase(key)
        fields.push(`${snakeKey} = $${paramIndex}`)
        params.push(value)
        paramIndex++
      }
    })

    if (fields.length === 0) return existing

    params.push(id)
    const query = `UPDATE supplier_state_conditions SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`

    const result = await this.executeQuery<SupplierStateConditionSchema>(
      query,
      params,
    )
    return result[0] || null
  }

  async delete(id: string, currentUser: UserSchema): Promise<boolean> {
    return this.executeTransaction(async (client: PoolClient) => {
      const existing = await this.findById(id, currentUser)
      if (!existing) {
        throw new HttpError(
          'Condição não encontrada',
          404,
          'CONDITION_NOT_FOUND',
        )
      }

      const result = await client.query(
        'DELETE FROM supplier_state_conditions WHERE id = $1',
        [id],
      )
      return (result.rowCount || 0) > 0
    })
  }

  async findBySupplierAndState(
    supplierOrgId: string,
    state: string,
  ): Promise<SupplierStateConditionSchema | null> {
    const query = `
      SELECT * FROM supplier_state_conditions
      WHERE supplier_org_id = $1
        AND state = $2
        AND (effective_from IS NULL OR effective_from <= NOW())
        AND (effective_to IS NULL OR effective_to >= NOW())
      LIMIT 1
    `
    const result = await this.executeQuery<SupplierStateConditionSchema>(
      query,
      [supplierOrgId, state],
    )

    return result.length > 0 ? result[0] : null
  }
}
