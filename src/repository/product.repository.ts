import { BaseRepository } from './base.repository'
import { ProductSchema } from '@/schemas'

export class ProductRepository extends BaseRepository {
  async create(product: Omit<ProductSchema, 'id' | 'createdAt' | 'active' | 'createdBy'> & { createdBy?: string }): Promise<ProductSchema> {
    const query = `
      INSERT INTO products (
        supplier_org_id, category_id, name, description, unit, base_price, available_quantity, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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
      product.createdBy || null
    ]
    const result = await this.executeQuery<ProductSchema>(query, params)
    return result[0]
  }
  async findAll(filters: {
    status?: boolean;
    description?: string;
    name?: string;
    categoryId?: string;
    supplierOrgId?: string;
  } = {}): Promise<ProductSchema[]> {
    let query = 'SELECT * FROM products WHERE 1=1'
    const params: any[] = []
    if (filters.status !== undefined) {
      params.push(filters.status)
      query += ` AND active = $${params.length}`
    }
    if (filters.description) {
      params.push(`%${filters.description}%`)
      query += ` AND description ILIKE $${params.length}`
    }
    if (filters.name) {
      params.push(`%${filters.name}%`)
      query += ` AND name ILIKE $${params.length}`
    }
    if (filters.categoryId) {
      params.push(filters.categoryId)
      query += ` AND category_id = $${params.length}`
    }
    if (filters.supplierOrgId) {
      params.push(filters.supplierOrgId)
      query += ` AND supplier_org_id = $${params.length}`
    }
    return this.executeQuery<ProductSchema>(query, params)
  }
  async update(id: string, product: Partial<Omit<ProductSchema, 'id' | 'createdAt' | 'createdBy'>>): Promise<ProductSchema | null> {
    const fields = []
    const params: any[] = []
    let idx = 1
    for (const key of Object.keys(product)) {
      fields.push(`${this.toSnakeCase(key)} = $${idx++}`)
      params.push((product as any)[key])
    }
    if (fields.length === 0) return null
    params.push(id)
    const query = `UPDATE products SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`
    const result = await this.executeQuery<ProductSchema>(query, params)
    return result[0] || null
  }

  async updateStatus(id: string, active: boolean): Promise<ProductSchema | null> {
    const query = 'UPDATE products SET active = $1 WHERE id = $2 RETURNING *'
    const result = await this.executeQuery<ProductSchema>(query, [active, id])
    return result[0] || null
  }

  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
  }

  async findById(id: string): Promise<ProductSchema | null> {
    const query = 'SELECT * FROM product WHERE id = $1'
    const result = await this.executeQuery<ProductSchema>(query, [id])
    return result[0] || null
  }
}
