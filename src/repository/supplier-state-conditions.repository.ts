import { BaseRepository } from './base.repository'
import { SupplierStateConditionSchema } from '@/schemas'
import { AuthenticatedRequest } from '@/middlewares'

interface FindAllFilters {
  supplierOrgId?: string
  state?: string
  userOrgId?: string
  isSupplier?: boolean
}

export class SupplierStateConditionsRepository extends BaseRepository {
  async findAll(filters: FindAllFilters): Promise<SupplierStateConditionSchema[]> {
    let query = `
      SELECT 
        id,
        supplier_org_id as "supplierOrgId",
        state,
        cashback_percent as "cashbackPercent",
        payment_term_days as "paymentTermDays",
        unit_price_adjustment as "unitPriceAdjustment",
        effective_from as "effectiveFrom",
        effective_to as "effectiveTo",
        created_at as "createdAt"
      FROM supplier_state_conditions
      WHERE 1=1
    `
    const params: any[] = []

    if (filters.isSupplier && filters.userOrgId) {
      params.push(filters.userOrgId)
      query += ` AND supplier_org_id = $${params.length}`
    } else if (filters.supplierOrgId) {
      params.push(filters.supplierOrgId)
      query += ` AND supplier_org_id = $${params.length}`
    }

    if (filters.state) {
      params.push(filters.state)
      query += ` AND state = $${params.length}`
    }

    query += ` ORDER BY created_at DESC`

    return this.executeQuery<SupplierStateConditionSchema>(query, params)
  }

  async findById(id: string, currentUser: AuthenticatedRequest['user']): Promise<SupplierStateConditionSchema | null> {
    const query = `
      SELECT 
        id,
        supplier_org_id as "supplierOrgId",
        state,
        cashback_percent as "cashbackPercent",
        payment_term_days as "paymentTermDays",
        unit_price_adjustment as "unitPriceAdjustment",
        effective_from as "effectiveFrom",
        effective_to as "effectiveTo",
        created_at as "createdAt"
      FROM supplier_state_conditions
      WHERE id = $1
    `
    const result = await this.executeQuery<SupplierStateConditionSchema>(query, [id])

    if (result.length === 0) return null

    const condition = result[0]

    if (
        currentUser!.role?.name === 'SUPPLIER' &&
        condition.supplierOrgId !== currentUser!.organizationId
    ) {
        throw { statusCode: 403, message: 'Acesso negado', errorCode: 'FORBIDDEN' }
    }

    return condition
  }

  async create(
    conditionData: SupplierStateConditionSchema,
    currentUser: AuthenticatedRequest['user'],
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
      throw { statusCode: 409, message: 'Já existe condição para este fornecedor e estado', errorCode: 'CONDITION_EXISTS' }
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
      RETURNING 
        id,
        supplier_org_id as "supplierOrgId",
        state,
        cashback_percent as "cashbackPercent",
        payment_term_days as "paymentTermDays",
        unit_price_adjustment as "unitPriceAdjustment",
        effective_from as "effectiveFrom",
        effective_to as "effectiveTo",
        created_at as "createdAt"
    `
    const result = await this.executeQuery<SupplierStateConditionSchema>(query, [
      conditionData.supplierOrgId,
      conditionData.state,
      conditionData.cashbackPercent ?? null,
      conditionData.paymentTermDays ?? null,
      conditionData.unitPriceAdjustment ?? null,
      conditionData.effectiveFrom ?? null,
      conditionData.effectiveTo ?? null,
    ])

    return result[0]
  }

  async update(
    id: string,
    conditionData: SupplierStateConditionSchema,
    currentUser: AuthenticatedRequest['user'],
  ): Promise<SupplierStateConditionSchema> {
    const existing = await this.findById(id, currentUser)
    if (!existing) {
      throw { statusCode: 404, message: 'Condição não encontrada', errorCode: 'CONDITION_NOT_FOUND' }
    }

    const query = `
      UPDATE supplier_state_conditions
      SET
        cashback_percent = COALESCE($1, cashback_percent),
        payment_term_days = COALESCE($2, payment_term_days),
        unit_price_adjustment = COALESCE($3, unit_price_adjustment),
        effective_from = COALESCE($4, effective_from),
        effective_to = COALESCE($5, effective_to)
      WHERE id = $6
      RETURNING 
        id,
        supplier_org_id as "supplierOrgId",
        state,
        cashback_percent as "cashbackPercent",
        payment_term_days as "paymentTermDays",
        unit_price_adjustment as "unitPriceAdjustment",
        effective_from as "effectiveFrom",
        effective_to as "effectiveTo",
        created_at as "createdAt"
    `
    const result = await this.executeQuery<SupplierStateConditionSchema>(query, [
      conditionData.cashbackPercent ?? null,
      conditionData.paymentTermDays ?? null,
      conditionData.unitPriceAdjustment ?? null,
      conditionData.effectiveFrom ?? null,
      conditionData.effectiveTo ?? null,
      id,
    ])

    return result[0]
  }

  async delete(id: string, currentUser: AuthenticatedRequest['user']): Promise<void> {
    const existing = await this.findById(id, currentUser)
    if (!existing) {
      throw { statusCode: 404, message: 'Condição não encontrada', errorCode: 'CONDITION_NOT_FOUND' }
    }

    const query = `DELETE FROM supplier_state_conditions WHERE id = $1`
    await this.executeQuery(query, [id])
  }

  async findBySupplierAndState(
    supplierOrgId: string,
    state: string,
    currentUser: AuthenticatedRequest['user'],
  ): Promise<SupplierStateConditionSchema | null> {
    const query = `
      SELECT 
        id,
        supplier_org_id as "supplierOrgId",
        state,
        cashback_percent as "cashbackPercent",
        payment_term_days as "paymentTermDays",
        unit_price_adjustment as "unitPriceAdjustment",
        effective_from as "effectiveFrom",
        effective_to as "effectiveTo",
        created_at as "createdAt"
      FROM supplier_state_conditions
      WHERE supplier_org_id = $1
        AND state = $2
        AND (effective_from IS NULL OR effective_from <= NOW())
        AND (effective_to IS NULL OR effective_to >= NOW())
      LIMIT 1
    `
    const result = await this.executeQuery<SupplierStateConditionSchema>(query, [
      supplierOrgId,
      state,
    ])

    return result.length > 0 ? result[0] : null
  }
}
