import { BaseRepository } from './base.repository'
import { OrderSchema, OrderFiltersSchema } from '@/schemas'
import { PoolClient } from '@/database'
import { OrderStatus } from '@/enums'

export class OrdersRepository extends BaseRepository {
  private async findByIdWithTransaction(
    id: string,
    client: PoolClient,
  ): Promise<OrderSchema> {
    const orderQuery = `
      SELECT o.*,
             json_build_object(
               'id', store_org.id,
               'type', store_org.type,
               'legalName', store_org.legal_name,
               'tradeName', store_org.trade_name,
               'taxId', store_org.tax_id,
               'phone', store_org.phone,
               'email', store_org.email,
               'website', store_org.website,
               'active', store_org.active,
               'createdAt', store_org.created_at
             ) as store_org,
             json_build_object(
               'id', supplier_org.id,
               'type', supplier_org.type,
               'legalName', supplier_org.legal_name,
               'tradeName', supplier_org.trade_name,
               'taxId', supplier_org.tax_id,
               'phone', supplier_org.phone,
               'email', supplier_org.email,
               'website', supplier_org.website,
               'active', supplier_org.active,
               'createdAt', supplier_org.created_at
             ) as supplier_org
      FROM orders o
      LEFT JOIN organizations store_org ON o.store_org_id = store_org.id
      LEFT JOIN organizations supplier_org ON o.supplier_org_id = supplier_org.id
      WHERE o.id = $1
    `
    const orderResult = await client.query(orderQuery, [id])
    const order = orderResult.rows[0]

    if (!order) {
      throw new Error('Order not found')
    }

    const itemsQuery = `
      SELECT * FROM order_items WHERE order_id = $1
    `
    const itemsResult = await client.query(itemsQuery, [id])

    order.items = itemsResult.rows.map((row) => ({
      id: row.id,
      productId: row.product_id,
      productNameSnapshot: row.product_name_snapshot,
      quantity: row.quantity,
      unitPrice: row.unit_price,
      unitPriceAdjusted: row.unit_price_adjusted,
      totalPrice: row.total_price,
      appliedCashbackAmount: row.applied_cashback_amount,
    }))

    const statusHistoryQuery = `
      SELECT 
        osh.*,
        json_build_object(
          'id', u.id,
          'email', u.email,
          'fullName', u.full_name,
          'phone', u.phone,
          'roleId', u.role_id,
          'organizationId', u.organization_id,
          'status', u.status,
          'profileImageUrl', u.profile_image_url,
          'createdAt', u.created_at
        ) as changed_by_user
      FROM order_status_history osh
      LEFT JOIN users u ON osh.changed_by = u.id
      WHERE osh.order_id = $1 
      ORDER BY osh.created_at ASC
    `
    const statusHistoryResult = await client.query(statusHistoryQuery, [id])

    order.statusHistory = statusHistoryResult.rows

    return order as OrderSchema
  }

  async create(order: OrderSchema): Promise<OrderSchema> {
    return this.executeTransaction(async (client) => {
      const orderQuery = `
        INSERT INTO orders (
          store_org_id, supplier_org_id, status, shipping_address_id,
          subtotal_amount, shipping_cost, adjustments, total_amount,
          payment_condition_id, created_by, total_cashback, applied_supplier_state_condition_id, cashback_used
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `

      const orderParams = [
        order.storeOrgId,
        order.supplierOrgId,
        order.status || OrderStatus.PLACED,
        order.shippingAddressId ?? null,
        order.subtotalAmount ?? 0,
        order.shippingCost ?? 0,
        order.adjustments ?? 0,
        order.totalAmount ?? 0,
        order.paymentConditionId ?? null,
        order.createdBy ?? null,
        order.totalCashback ?? 0,
        order.appliedSupplierStateConditionId ?? null,
        order.cashbackUsed ?? 0,
      ]

      const orderResult = await client.query(orderQuery, orderParams)
      const createdOrder = orderResult.rows[0]

      if (order.items && order.items.length > 0) {
        const itemInserts = order.items
          .map((_, index) => {
            const baseIndex = index * 7
            return `($1, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8})`
          })
          .join(', ')

        const itemQuery = `
          INSERT INTO order_items (
            order_id, product_id, product_name_snapshot, unit_price, unit_price_adjusted, quantity, total_price, applied_cashback_amount
          ) VALUES ${itemInserts}
        `

        const itemParams = [createdOrder.id]
        order.items.forEach((item) => {
          itemParams.push(
            item.productId,
            item.productNameSnapshot,
            item.unitPrice.toString(),
            item.unitPriceAdjusted.toString(),
            item.quantity.toString(),
            item.totalPrice.toString(),
            (item.appliedCashbackAmount ?? 0).toString(),
          )
        })

        await client.query(itemQuery, itemParams)
      }

      const statusHistoryQuery = `
        INSERT INTO order_status_history (
          order_id, previous_status, new_status, changed_by, note
        ) VALUES ($1, $2, $3, $4, $5)
      `

      const statusHistoryParams = [
        createdOrder.id,
        null,
        createdOrder.status,
        order.createdBy ?? null,
        'Pedido criado',
      ]

      await client.query(statusHistoryQuery, statusHistoryParams)

      return this.findByIdWithTransaction(createdOrder.id, client)
    })
  }

  async findById(id: string): Promise<OrderSchema | null> {
    const orderQuery = `
      SELECT o.*,
             json_build_object(
               'id', store_org.id,
               'type', store_org.type,
               'legalName', store_org.legal_name,
               'tradeName', store_org.trade_name,
               'taxId', store_org.tax_id,
               'phone', store_org.phone,
               'email', store_org.email,
               'website', store_org.website,
               'active', store_org.active,
               'createdAt', store_org.created_at
             ) as store_org,
             json_build_object(
               'id', supplier_org.id,
               'type', supplier_org.type,
               'legalName', supplier_org.legal_name,
               'tradeName', supplier_org.trade_name,
               'taxId', supplier_org.tax_id,
               'phone', supplier_org.phone,
               'email', supplier_org.email,
               'website', supplier_org.website,
               'active', supplier_org.active,
               'createdAt', supplier_org.created_at
             ) as supplier_org,
             COALESCE(
               (
                 SELECT json_agg(
                   json_build_object(
                     'id', oi.id,
                     'productId', oi.product_id,
                     'productNameSnapshot', oi.product_name_snapshot,
                     'quantity', oi.quantity,
                     'unitPrice', oi.unit_price,
                     'unitPriceAdjusted', oi.unit_price_adjusted,
                     'totalPrice', oi.total_price,
                     'appliedCashbackAmount', oi.applied_cashback_amount
                   )
                 )
                 FROM order_items oi
                 WHERE oi.order_id = o.id
               ),
               '[]'::json
             ) as items,
             COALESCE(
               (
                 SELECT json_agg(
                   json_build_object(
                     'id', osh.id,
                     'orderId', osh.order_id,
                     'previousStatus', osh.previous_status,
                     'newStatus', osh.new_status,
                     'changedBy', json_build_object(
                       'id', u.id,
                       'email', u.email,
                       'fullName', u.full_name,
                       'phone', u.phone,
                       'roleId', u.role_id,
                       'organizationId', u.organization_id,
                       'status', u.status,
                       'profileImageUrl', u.profile_image_url,
                       'createdAt', u.created_at
                     ),
                     'note', osh.note,
                     'createdAt', osh.created_at
                   ) ORDER BY osh.created_at ASC
                 )
                 FROM order_status_history osh
                 LEFT JOIN users u ON osh.changed_by = u.id
                 WHERE osh.order_id = o.id
               ),
               '[]'::json
             ) as status_history
      FROM orders o
      LEFT JOIN organizations store_org ON o.store_org_id = store_org.id
      LEFT JOIN organizations supplier_org ON o.supplier_org_id = supplier_org.id
      WHERE o.id = $1
    `

    const result = await this.executeQuery<OrderSchema>(orderQuery, [id])
    return result[0] || null
  }

  async findAll(
    filters: OrderFiltersSchema = {},
  ): Promise<{ orders: OrderSchema[]; total: number }> {
    const conditions: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (filters.storeOrgId) {
      conditions.push(`o.store_org_id = $${paramIndex}`)
      params.push(filters.storeOrgId)
      paramIndex++
    }

    if (filters.supplierOrgId) {
      conditions.push(`o.supplier_org_id = $${paramIndex}`)
      params.push(filters.supplierOrgId)
      paramIndex++
    }

    if (filters.status) {
      conditions.push(`o.status = $${paramIndex}`)
      params.push(filters.status)
      paramIndex++
    }

    if (filters.placedAtFrom) {
      conditions.push(`o.placed_at >= $${paramIndex}`)
      params.push(filters.placedAtFrom)
      paramIndex++
    }

    if (filters.placedAtTo) {
      conditions.push(`o.placed_at <= $${paramIndex}`)
      params.push(filters.placedAtTo)
      paramIndex++
    }

    if (filters.createdBy) {
      conditions.push(`o.created_by = $${paramIndex}`)
      params.push(filters.createdBy)
      paramIndex++
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const dataQuery = `
      SELECT o.*,
             json_build_object(
               'id', store_org.id,
               'type', store_org.type,
               'legalName', store_org.legal_name,
               'tradeName', store_org.trade_name,
               'taxId', store_org.tax_id,
               'phone', store_org.phone,
               'email', store_org.email,
               'website', store_org.website,
               'active', store_org.active,
               'createdAt', store_org.created_at
             ) as store_org,
             json_build_object(
               'id', supplier_org.id,
               'type', supplier_org.type,
               'legalName', supplier_org.legal_name,
               'tradeName', supplier_org.trade_name,
               'taxId', supplier_org.tax_id,
               'phone', supplier_org.phone,
               'email', supplier_org.email,
               'website', supplier_org.website,
               'active', supplier_org.active,
               'createdAt', supplier_org.created_at
             ) as supplier_org,
             COALESCE(
               (
                 SELECT json_agg(
                   json_build_object(
                     'id', oi.id,
                     'productId', oi.product_id,
                     'productNameSnapshot', oi.product_name_snapshot,
                     'quantity', oi.quantity,
                     'unitPrice', oi.unit_price,
                     'unitPriceAdjusted', oi.unit_price_adjusted,
                     'totalPrice', oi.total_price,
                     'appliedCashbackAmount', oi.applied_cashback_amount
                   )
                 )
                 FROM order_items oi
                 WHERE oi.order_id = o.id
               ),
               '[]'::json
             ) as items,
             COALESCE(
               (
                 SELECT json_agg(
                   json_build_object(
                     'id', osh.id,
                     'orderId', osh.order_id,
                     'previousStatus', osh.previous_status,
                     'newStatus', osh.new_status,
                     'changedBy', json_build_object(
                       'id', u.id,
                       'email', u.email,
                       'fullName', u.full_name,
                       'phone', u.phone,
                       'roleId', u.role_id,
                       'organizationId', u.organization_id,
                       'status', u.status,
                       'profileImageUrl', u.profile_image_url,
                       'createdAt', u.created_at
                     ),
                     'note', osh.note,
                     'createdAt', osh.created_at
                   ) ORDER BY osh.created_at ASC
                 )
                 FROM order_status_history osh
                 LEFT JOIN users u ON osh.changed_by = u.id
                 WHERE osh.order_id = o.id
               ),
               '[]'::json
             ) as status_history
      FROM orders o
      LEFT JOIN organizations store_org ON o.store_org_id = store_org.id
      LEFT JOIN organizations supplier_org ON o.supplier_org_id = supplier_org.id
      ${whereClause}
      ORDER BY o.created_at DESC
    `

    const ordersResult = await this.executeQuery<OrderSchema>(dataQuery, params)

    return {
      orders: ordersResult,
      total: ordersResult.length,
    }
  }

  async updateStatus(
    orderId: string,
    newStatus: OrderStatus,
    changedBy: string,
    note?: string,
  ): Promise<OrderSchema> {
    return this.executeTransaction(async (client) => {
      const currentOrderQuery = `
        SELECT * FROM orders WHERE id = $1
      `
      const currentOrderResult = await client.query<OrderSchema>(
        currentOrderQuery,
        [orderId],
      )
      const currentOrder = currentOrderResult.rows[0]

      if (!currentOrder) {
        throw new Error('Order not found')
      }

      const previousStatus = currentOrder.status

      const updateQuery = `
        UPDATE orders 
        SET status = $1
        WHERE id = $2
        RETURNING *
      `
      await client.query(updateQuery, [newStatus, orderId])

      const statusHistoryQuery = `
        INSERT INTO order_status_history (
          order_id, previous_status, new_status, changed_by, note
        ) VALUES ($1, $2, $3, $4, $5)
      `

      const statusHistoryParams = [
        orderId,
        previousStatus ?? null,
        newStatus,
        changedBy,
        note ?? null,
      ]

      await client.query(statusHistoryQuery, statusHistoryParams)

      return this.findByIdWithTransaction(orderId, client)
    })
  }
}
