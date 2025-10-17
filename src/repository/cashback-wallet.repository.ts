import { BaseRepository } from './base.repository'
import { CashbackWalletSchema } from '@/schemas'
import { HttpError } from '@/utils'

export class CashbackWalletRepository extends BaseRepository {
  async findByOrganizationId(
    organizationId: string,
  ): Promise<CashbackWalletSchema | null> {
    const query = `
      SELECT * FROM cashback_wallets
      WHERE organization_id = $1
    `
    const result = await this.executeQuery<CashbackWalletSchema>(query, [
      organizationId,
    ])
    return result[0] || null
  }

  async create(organizationId: string): Promise<CashbackWalletSchema> {
    const query = `
      INSERT INTO cashback_wallets (organization_id)
      VALUES ($1)
      RETURNING *
    `
    const result = await this.executeQuery<CashbackWalletSchema>(query, [
      organizationId,
    ])

    if (!result[0]) {
      throw new HttpError(
        'Failed to create cashback wallet',
        500,
        'CASHBACK_WALLET_CREATE_ERROR',
      )
    }

    return result[0]
  }

  async getBalance(organizationId: string): Promise<number> {
    const wallet = await this.findByOrganizationId(organizationId)
    return wallet?.availableBalance || 0
  }

  async hasEnoughBalance(
    organizationId: string,
    amount: number,
  ): Promise<boolean> {
    const balance = await this.getBalance(organizationId)
    return balance >= amount
  }

  async findAll(): Promise<CashbackWalletSchema[]> {
    const query = `
      SELECT cw.*, o.legal_name as organization_name
      FROM cashback_wallets cw
      LEFT JOIN organizations o ON cw.organization_id = o.id
      ORDER BY cw.updated_at DESC
    `
    return await this.executeQuery<CashbackWalletSchema>(query)
  }
}
