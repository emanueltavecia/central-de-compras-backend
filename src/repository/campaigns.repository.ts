import { BaseRepository } from './base.repository'
import { CampaignSchema, CampaignFiltersSchema } from '@/schemas'
import { PoolClient } from '@/database'

export class CampaignsRepository extends BaseRepository {
  private async findByIdWithTransaction(
    id: string,
    client: PoolClient,
  ): Promise<CampaignSchema> {
    const campaignQuery = `
      SELECT * FROM campaigns WHERE id = $1
    `
    const campaignResult = await client.query(campaignQuery, [id])
    const campaign = campaignResult.rows[0]

    if (!campaign) {
      throw new Error('Campaign not found')
    }

    const productsQuery = `
      SELECT product_id FROM campaign_products WHERE campaign_id = $1
    `
    const productsResult = await client.query(productsQuery, [id])

    campaign.productIds = productsResult.rows.map((row) => row.productId)

    return campaign as CampaignSchema
  }

  async create(
    campaign: Omit<CampaignSchema, 'id' | 'createdAt'>,
  ): Promise<CampaignSchema> {
    return this.executeTransaction(async (client) => {
      const campaignQuery = `
        INSERT INTO campaigns (
          supplier_org_id, name, type, scope, min_total, min_quantity,
          cashback_percent, gift_product_id, category_id,
          start_at, end_at, active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `

      const campaignParams = [
        campaign.supplierOrgId,
        campaign.name,
        campaign.type,
        campaign.scope,
        campaign.minTotal,
        campaign.minQuantity,
        campaign.cashbackPercent,
        campaign.giftProductId,
        campaign.categoryId,
        campaign.startAt,
        campaign.endAt,
        campaign.active ?? true,
      ]

      const campaignResult = await client.query(campaignQuery, campaignParams)
      const createdCampaign = campaignResult.rows[0]

      if (campaign.productIds && campaign.productIds.length > 0) {
        const productInserts = campaign.productIds
          .map((_, index) => `($1, $${index + 2})`)
          .join(', ')

        const productQuery = `
          INSERT INTO campaign_products (campaign_id, product_id)
          VALUES ${productInserts}
        `

        const productParams = [createdCampaign.id, ...campaign.productIds]
        await client.query(productQuery, productParams)
      }

      return this.findByIdWithTransaction(createdCampaign.id, client)
    })
  }

  async findById(id: string): Promise<CampaignSchema | null> {
    const campaignQuery = `
      SELECT c.*,
             COALESCE(
               json_agg(cp.product_id) FILTER (WHERE cp.product_id IS NOT NULL),
               '[]'::json
             ) as product_ids
      FROM campaigns c
      LEFT JOIN campaign_products cp ON c.id = cp.campaign_id
      WHERE c.id = $1
      GROUP BY c.id
    `

    const result = await this.executeQuery<CampaignSchema>(campaignQuery, [id])
    return result[0] || null
  }

  async findAll(
    filters: CampaignFiltersSchema = {},
  ): Promise<{ campaigns: CampaignSchema[]; total: number }> {
    const conditions: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (filters.supplierOrgId) {
      conditions.push(`supplier_org_id = $${paramIndex}`)
      params.push(filters.supplierOrgId)
      paramIndex++
    }

    if (filters.name) {
      conditions.push(`name ILIKE $${paramIndex}`)
      params.push(`%${filters.name}%`)
      paramIndex++
    }

    if (filters.type) {
      conditions.push(`type = $${paramIndex}`)
      params.push(filters.type)
      paramIndex++
    }

    if (filters.scope) {
      conditions.push(`scope = $${paramIndex}`)
      params.push(filters.scope)
      paramIndex++
    }

    if (filters.active !== undefined) {
      conditions.push(`active = $${paramIndex}`)
      params.push(filters.active)
      paramIndex++
    }

    if (filters.startAtFrom) {
      conditions.push(`start_at >= $${paramIndex}`)
      params.push(filters.startAtFrom)
      paramIndex++
    }

    if (filters.endAtTo) {
      conditions.push(`end_at <= $${paramIndex}`)
      params.push(filters.endAtTo)
      paramIndex++
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const dataQuery = `
      SELECT c.*,
             COALESCE(
               json_agg(cp.product_id) FILTER (WHERE cp.product_id IS NOT NULL),
               '[]'::json
             ) as product_ids
      FROM campaigns c
      LEFT JOIN campaign_products cp ON c.id = cp.campaign_id
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `

    const campaignsResult = await this.executeQuery<CampaignSchema>(
      dataQuery,
      params,
    )

    return {
      campaigns: campaignsResult,
      total: campaignsResult.length,
    }
  }

  async update(
    id: string,
    campaign: Partial<Omit<CampaignSchema, 'id' | 'createdAt'>>,
  ): Promise<CampaignSchema | null> {
    return this.executeTransaction(async (client) => {
      const fields: string[] = []
      const params: any[] = []
      let paramIndex = 1

      Object.entries(campaign).forEach(([key, value]) => {
        if (value !== undefined && key !== 'productIds') {
          const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
          fields.push(`${snakeKey} = $${paramIndex}`)
          params.push(value)
          paramIndex++
        }
      })

      if (fields.length > 0) {
        const updateQuery = `
          UPDATE campaigns 
          SET ${fields.join(', ')} 
          WHERE id = $${paramIndex}
        `

        params.push(id)
        await client.query(updateQuery, params)
      }

      if (campaign.productIds !== undefined) {
        await client.query(
          'DELETE FROM campaign_products WHERE campaign_id = $1',
          [id],
        )

        if (campaign.productIds.length > 0) {
          const productInserts = campaign.productIds
            .map((_, index) => `($1, $${index + 2})`)
            .join(', ')

          const productQuery = `
            INSERT INTO campaign_products (campaign_id, product_id)
            VALUES ${productInserts}
          `

          const productParams = [id, ...campaign.productIds]
          await client.query(productQuery, productParams)
        }
      }

      return this.findByIdWithTransaction(id, client)
    })
  }

  async delete(id: string): Promise<boolean> {
    return this.executeTransaction(async (client) => {
      await client.query(
        'DELETE FROM campaign_products WHERE campaign_id = $1',
        [id],
      )

      const result = await client.query('DELETE FROM campaigns WHERE id = $1', [
        id,
      ])

      return (result.rowCount || 0) > 0
    })
  }
}
