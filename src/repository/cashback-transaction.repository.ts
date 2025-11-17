import { BaseRepository } from './base.repository'
import { CashbackTransactionSchema, CashbackFiltersSchema } from '@/schemas'
import { CashbackTransactionType, CashbackReferenceType } from '@/enums'
import { HttpError } from '@/utils'

export class CashbackTransactionRepository extends BaseRepository {
  async create(data: {
    cashbackWalletId: string
    orderId: string
    type: CashbackTransactionType
    amount: number
    referenceId?: string
    referenceType?: CashbackReferenceType
    description?: string
  }): Promise<CashbackTransactionSchema> {
    const query = `
      INSERT INTO cashback_transactions (
        cashback_wallet_id, 
        order_id, 
        type, 
        amount, 
        reference_id, 
        reference_type, 
        description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `

    const result = await this.executeQuery<CashbackTransactionSchema>(query, [
      data.cashbackWalletId,
      data.orderId,
      data.type,
      data.amount,
      data.referenceId,
      data.referenceType,
      data.description,
    ])

    if (!result[0]) {
      throw new HttpError(
        'Failed to create cashback transaction',
        500,
        'CASHBACK_TRANSACTION_CREATE_ERROR',
      )
    }

    return result[0]
  }

  async findByOrganizationId(
    organizationId: string,
    filters?: CashbackFiltersSchema,
  ): Promise<CashbackTransactionSchema[]> {
    let query = `
      SELECT ct.*, o.store_org_id, o.supplier_org_id, o.total_amount as order_total
      FROM cashback_transactions ct
      JOIN cashback_wallets cw ON ct.cashback_wallet_id = cw.id
      JOIN orders o ON ct.order_id = o.id
      WHERE cw.organization_id = $1
    `

    const params: any[] = [organizationId]
    let paramCount = 1

    if (filters?.orderId) {
      paramCount++
      query += ` AND ct.order_id = $${paramCount}`
      params.push(filters.orderId)
    }

    query += ' ORDER BY ct.created_at DESC'

    return await this.executeQuery<CashbackTransactionSchema>(query, params)
  }

  async findByOrderId(orderId: string): Promise<CashbackTransactionSchema[]> {
    const query = `
      SELECT * FROM cashback_transactions
      WHERE order_id = $1
      ORDER BY created_at DESC
    `
    return await this.executeQuery<CashbackTransactionSchema>(query, [orderId])
  }

  async getTotalEarnedByOrganization(organizationId: string): Promise<number> {
    const query = `
      SELECT COALESCE(SUM(ct.amount), 0) as total
      FROM cashback_transactions ct
      JOIN cashback_wallets cw ON ct.cashback_wallet_id = cw.id
      WHERE cw.organization_id = $1 AND ct.type = 'earned'
    `
    const result = await this.executeQuery<{ total: number }>(query, [
      organizationId,
    ])
    return result[0]?.total || 0
  }

  async getTotalUsedByOrganization(organizationId: string): Promise<number> {
    const query = `
      SELECT COALESCE(SUM(ct.amount), 0) as total
      FROM cashback_transactions ct
      JOIN cashback_wallets cw ON ct.cashback_wallet_id = cw.id
      WHERE cw.organization_id = $1 AND ct.type = 'used'
    `
    const result = await this.executeQuery<{ total: number }>(query, [
      organizationId,
    ])
    return result[0]?.total || 0
  }
}
