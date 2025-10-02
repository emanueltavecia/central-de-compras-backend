import { BaseRepository } from './base.repository'
import { ProductSchema, ProductFiltersSchema } from '@/schemas'

export class ProductRepository extends BaseRepository {
  async create(
    product: Omit<
      ProductSchema,
      'id' | 'createdAt' | 'active' | 'createdBy'
    > & { createdBy?: string },
  ): Promise<ProductSchema> {
    const query = `
      INSERT INTO products (
        supplier_org_id, category_id, name, description, unit, base_price, available_quantity, created_by, active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `
    const params = [
      product.supplierOrgId,
      product.categoryId || null,
      product.name,
      product.description || null,
      product.unit || null,
      product.basePrice,
      product.availableQuantity || null,
      product.createdBy || null,
      true,
    ]
    const result = await this.executeQuery<ProductSchema>(query, params)
    return result[0]
  }

  async findAll(filters: ProductFiltersSchema = {}): Promise<ProductSchema[]> {
    const conditions: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (filters.status !== undefined) {
      conditions.push(`active = $${paramIndex}`)
      params.push(filters.status)
      paramIndex++
    }

    if (filters.description) {
      conditions.push(`description ILIKE $${paramIndex}`)
      params.push(`%${filters.description}%`)
      paramIndex++
    }

    if (filters.name) {
      conditions.push(`name ILIKE $${paramIndex}`)
      params.push(`%${filters.name}%`)
      paramIndex++
    }

    if (filters.categoryId) {
      conditions.push(`category_id = $${paramIndex}`)
      params.push(filters.categoryId)
      paramIndex++
    }

    if (filters.supplierOrgId) {
      conditions.push(`supplier_org_id = $${paramIndex}`)
      params.push(filters.supplierOrgId)
      paramIndex++
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const query = `SELECT * FROM products ${whereClause} ORDER BY created_at DESC`

    return this.executeQuery<ProductSchema>(query, params)
  }

  async update(
    id: string,
    product: Partial<Omit<ProductSchema, 'id' | 'createdAt' | 'createdBy'>>,
  ): Promise<ProductSchema | null> {
    const fields: string[] = []
    const params: any[] = []
    let paramIndex = 1

    Object.entries(product).forEach(([key, value]) => {
      if (value !== undefined) {
        const snakeKey = this.toSnakeCase(key)
        fields.push(`${snakeKey} = $${paramIndex}`)
        params.push(value)
        paramIndex++
      }
    })

    if (fields.length === 0) return null

    params.push(id)
    const query = `UPDATE products SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`

    const result = await this.executeQuery<ProductSchema>(query, params)
    return result[0] || null
  }

  async updateStatus(
    id: string,
    active: boolean,
  ): Promise<ProductSchema | null> {
    const query = 'UPDATE products SET active = $1 WHERE id = $2 RETURNING *'
    const result = await this.executeQuery<ProductSchema>(query, [active, id])
    return result[0] || null
  }

  async findById(id: string): Promise<ProductSchema | null> {
    const query = 'SELECT * FROM products WHERE id = $1'
    const result = await this.executeQuery<ProductSchema>(query, [id])
    return result[0] || null
  }

  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
  }
}
