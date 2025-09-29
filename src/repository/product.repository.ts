import { BaseRepository } from './base.repository'
import { ProductSchema } from '@/schemas'

export class ProductRepository extends BaseRepository {
  async findAll(): Promise<ProductSchema[]> {
    const query = 'SELECT * FROM product'
    return this.executeQuery<ProductSchema>(query)
  }

  async findById(id: string): Promise<ProductSchema | null> {
    const query = 'SELECT * FROM product WHERE id = $1'
    const result = await this.executeQuery<ProductSchema>(query, [id])
    return result[0] || null
  }
}
