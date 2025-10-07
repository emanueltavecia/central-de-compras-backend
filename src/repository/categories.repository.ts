// src/repository/CategoryRepository.ts

import { BaseRepository } from './base.repository'
// CORREÇÃO: Importando CategorySchema e CategoryFiltersSchema DIRETAMENTE DO ARQUIVO
import { CategorySchema, CategoryFiltersSchema } from '@/schemas' 
import { PoolClient } from '@/database' 

// A interface foi removida daqui, como no código limpo

export class CategoryRepository extends BaseRepository {
    private toSnakeCase(str: string): string {
        return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    }

    // --- CREATE ---
    async create(
        category: Omit<CategorySchema, 'id' | 'createdAt'>,
    ): Promise<CategorySchema> {
        const query = `
            INSERT INTO categories (
                name, parent_id, description
            ) VALUES ($1, $2, $3)
            RETURNING *
        `
        const params = [
            category.name,
            category.parentId || null,
            category.description || null,
        ]
        const result = await this.executeQuery<CategorySchema>(query, params)
        return result[0]
    }

    // --- FIND ALL ---
    async findAll(filters: CategoryFiltersSchema = {}): Promise<CategorySchema[]> {
        const conditions: string[] = []
        const params: any[] = []
        let paramIndex = 1

        if (filters.parentId !== undefined) {
            if (filters.parentId === null) {
                conditions.push(`parent_id IS NULL`)
            } else {
                conditions.push(`parent_id = $${paramIndex}`)
                params.push(filters.parentId)
                paramIndex++
            }
        }

        const whereClause =
            conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
        const query = `SELECT * FROM categories ${whereClause} ORDER BY name ASC`

        return this.executeQuery<CategorySchema>(query, params)
    }

    // --- FIND BY ID ---
    async findById(id: string): Promise<CategorySchema | null> {
        const query = 'SELECT * FROM categories WHERE id = $1'
        const result = await this.executeQuery<CategorySchema>(query, [id])
        return result[0] || null
    }

    // --- UPDATE ---
    async update(
        id: string,
        category: Partial<Omit<CategorySchema, 'id' | 'createdAt'>>,
    ): Promise<CategorySchema | null> {
        const fields: string[] = []
        const params: any[] = []
        let paramIndex = 1

        Object.entries(category).forEach(([key, value]) => {
            if (value !== undefined) {
                const snakeKey = this.toSnakeCase(key)
                fields.push(`${snakeKey} = $${paramIndex}`)
                params.push(value)
                paramIndex++
            }
        })

        if (fields.length === 0) return null

        params.push(id)
        const query = `UPDATE categories SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`

        const result = await this.executeQuery<CategorySchema>(query, params)
        return result[0] || null
    }

    // --- DELETE ---
    async delete(id: string): Promise<boolean> {
        return this.executeTransaction(async (client: PoolClient) => {
            const result = await client.query('DELETE FROM categories WHERE id = $1', [id])
            return (result.rowCount || 0) > 0
        })
    }
}