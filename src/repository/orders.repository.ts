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
      SELECT * FROM orders WHERE id = $1
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

    order.items = itemsResult.rows

    return order as OrderSchema
  }

  async create(order: OrderSchema): Promise<OrderSchema> {
    return this.executeTransaction(async (client) => {
      const orderQuery = `
        INSERT INTO orders (
          store_org_id, supplier_org_id, status, shipping_address_id,
          subtotal_amount, shipping_cost, adjustments, total_amount,
          payment_condition_id, created_by, total_cashback, applied_supplier_state_condition_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
      ]

      const orderResult = await client.query(orderQuery, orderParams)
      const createdOrder = orderResult.rows[0]

      if (order.items && order.items.length > 0) {
        const itemInserts = order.items
          .map((_, index) => {
            const baseIndex = index * 6
            return `($1, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6})`
          })
          .join(', ')

        const itemQuery = `
          INSERT INTO order_items (
            order_id, product_id, quantity, unit_price, total_price, applied_cashback_amount
          ) VALUES ${itemInserts}
        `

        const itemParams = [createdOrder.id]
        order.items.forEach((item) => {
          itemParams.push(
            item.productId,
            item.quantity.toString(),
            item.unitPrice.toString(),
            item.totalPrice.toString(),
            (item.appliedCashbackAmount ?? 0).toString(),
          )
        })

        await client.query(itemQuery, itemParams)
      }

      return this.findByIdWithTransaction(createdOrder.id, client)
    })
  }

  async findById(id: string): Promise<OrderSchema | null> {
    const orderQuery = `
      SELECT o.*,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', oi.id,
                   'productId', oi.product_id,
                   'quantity', oi.quantity,
                   'unitPrice', oi.unit_price,
                   'totalPrice', oi.total_price,
                   'appliedCashbackAmount', oi.applied_cashback_amount
                 )
               ) FILTER (WHERE oi.id IS NOT NULL),
               '[]'::json
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1
      GROUP BY o.id
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
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', oi.id,
                   'productId', oi.product_id,
                   'quantity', oi.quantity,
                   'unitPrice', oi.unit_price,
                   'totalPrice', oi.total_price,
                   'appliedCashbackAmount', oi.applied_cashback_amount
                 )
               ) FILTER (WHERE oi.id IS NOT NULL),
               '[]'::json
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${whereClause}
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `

    const ordersResult = await this.executeQuery<OrderSchema>(dataQuery, params)

    return {
      orders: ordersResult,
      total: ordersResult.length,
    }
  }

  async update(id: string, order: OrderSchema): Promise<OrderSchema | null> {
    return this.executeTransaction(async (client) => {
      const fields: string[] = []
      const params: any[] = []
      let paramIndex = 1

      Object.entries(order).forEach(([key, value]) => {
        if (
          value !== undefined &&
          key !== 'items' &&
          key !== 'id' &&
          key !== 'createdAt' &&
          key !== 'placedAt'
        ) {
          const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
          fields.push(`${snakeKey} = $${paramIndex}`)
          params.push(value)
          paramIndex++
        }
      })

      if (fields.length > 0) {
        const updateQuery = `
          UPDATE orders 
          SET ${fields.join(', ')} 
          WHERE id = $${paramIndex}
        `

        params.push(id)
        await client.query(updateQuery, params)
      }

      if (order.items !== undefined) {
        await client.query('DELETE FROM order_items WHERE order_id = $1', [id])

        if (order.items.length > 0) {
          const itemInserts = order.items
            .map((_, index) => {
              const baseIndex = index * 6
              return `($1, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6})`
            })
            .join(', ')

          const itemQuery = `
            INSERT INTO order_items (
              order_id, product_id, quantity, unit_price, total_price, applied_cashback_amount
            ) VALUES ${itemInserts}
          `

          const itemParams = [id]
          order.items.forEach((item) => {
            itemParams.push(
              item.productId,
              item.quantity.toString(),
              item.unitPrice.toString(),
              item.totalPrice.toString(),
              (item.appliedCashbackAmount ?? 0).toString(),
            )
          })

          await client.query(itemQuery, itemParams)
        }
      }

      return this.findByIdWithTransaction(id, client)
    })
  }

  async delete(id: string): Promise<boolean> {
    return this.executeTransaction(async (client) => {
      await client.query('DELETE FROM order_items WHERE order_id = $1', [id])

      const result = await client.query('DELETE FROM orders WHERE id = $1', [
        id,
      ])

      return (result.rowCount || 0) > 0
    })
  }

  async updateCashbackAndStateCondition(
    orderId: string,
    totalCashback: number,
    appliedSupplierStateConditionId?: string,
  ): Promise<void> {
    const updateQuery = `
      UPDATE orders 
      SET total_cashback = $1, applied_supplier_state_condition_id = $2
      WHERE id = $3
    `
    await this.executeQuery(updateQuery, [
      totalCashback,
      appliedSupplierStateConditionId,
      orderId,
    ])
  }
}
