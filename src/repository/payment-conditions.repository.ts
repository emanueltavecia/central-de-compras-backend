import { BaseRepository } from './base.repository'
import { PaymentConditionSchema, PaymentConditionFiltersSchema } from '@/schemas'

export class PaymentConditionsRepository extends BaseRepository {
  async create(
    data: Omit<PaymentConditionSchema, 'id' | 'createdAt' | 'active'>,
  ): Promise<PaymentConditionSchema> {
    const query = `
      INSERT INTO payment_conditions (
        supplier_org_id, name, payment_term_days, payment_method, notes, active
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `
    const params = [
      data.supplierOrgId,
      data.name || null,
      data.paymentTermDays ?? 0,
      data.paymentMethod,
      data.notes || null,
      true,
    ]
    const result = await this.executeQuery<PaymentConditionSchema>(query, params)
    return result[0]
  }

  async findAll(
    filters: PaymentConditionFiltersSchema = {},
  ): Promise<PaymentConditionSchema[]> {
    const conditions: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (filters.status !== undefined) {
      conditions.push(`active = $${paramIndex}`)
      params.push(filters.status)
      paramIndex++
    }

    if (filters.name) {
      conditions.push(`name ILIKE $${paramIndex}`)
      params.push(`%${filters.name}%`)
      paramIndex++
    }

    if (filters.supplierOrgId) {
      conditions.push(`supplier_org_id = $${paramIndex}`)
      params.push(filters.supplierOrgId)
      paramIndex++
    }

    if (filters.createdAt) {
      conditions.push(`DATE(created_at) = $${paramIndex}`)
      params.push(filters.createdAt)
      paramIndex++
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const query = `SELECT * FROM payment_conditions ${whereClause} ORDER BY created_at DESC`

    return this.executeQuery<PaymentConditionSchema>(query, params)
  }

  async findById(id: string): Promise<PaymentConditionSchema | null> {
    const query = 'SELECT * FROM payment_conditions WHERE id = $1'
    const result = await this.executeQuery<PaymentConditionSchema>(query, [id])
    return result[0] || null
  }

  async update(
    id: string,
    data: Partial<Omit<PaymentConditionSchema, 'id' | 'createdAt'>>,
  ): Promise<PaymentConditionSchema | null> {
    const fields: string[] = []
    const params: any[] = []
    let paramIndex = 1

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        const snakeKey = this.toSnakeCase(key)
        fields.push(`${snakeKey} = $${paramIndex}`)
        params.push(value)
        paramIndex++
      }
    })

    if (fields.length === 0) return null

    params.push(id)
    const query = `UPDATE payment_conditions SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`

    const result = await this.executeQuery<PaymentConditionSchema>(query, params)
    return result[0] || null
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM payment_conditions WHERE id = $1'
    await this.executeQuery(query, [id])
    return true
  }

  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
  }
}



