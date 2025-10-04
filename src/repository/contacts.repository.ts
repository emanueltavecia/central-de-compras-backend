import { BaseRepository } from './base.repository'
import { ContactSchema } from '@/schemas'
import { PoolClient } from '@/database' // Necessário para executeTransaction

// Define a estrutura de filtros, seguindo o padrão ProductFiltersSchema
// Para contatos, o único filtro necessário na rota index é organizationId
interface ContactFiltersSchema {
    organizationId?: string;
}

export class ContactRepository extends BaseRepository {

    // --- HELPER: COPIADO DO ProductRepository para updates dinâmicos ---
    private toSnakeCase(str: string): string {
        return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    }

    // --- CREATE (Inserir Novo Contato) ---
    async create(
        contact: Omit<ContactSchema, 'id' | 'createdAt'>,
    ): Promise<ContactSchema> {
        const query = `
            INSERT INTO contacts (
              organization_id, name, email, phone, role, is_primary
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `
        const params = [
            contact.organizationId,
            contact.name,
            contact.email,
            contact.phone || null, // Permite nulo
            contact.role || null,  // Permite nulo
            contact.isPrimary ?? false, // Garante que é booleano (padrão false)
        ]
        const result = await this.executeQuery<ContactSchema>(query, params)
        return result[0]
    }

    // --- FIND ALL (Listar e Filtrar Contatos) ---
    async findAll(filters: ContactFiltersSchema = {}): Promise<ContactSchema[]> {
        const conditions: string[] = []
        const params: any[] = []
        let paramIndex = 1

        if (filters.organizationId) {
            conditions.push(`organization_id = $${paramIndex}`)
            params.push(filters.organizationId)
            paramIndex++
        }

        const whereClause =
            conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
        const query = `SELECT * FROM contacts ${whereClause} ORDER BY name ASC`

        return this.executeQuery<ContactSchema>(query, params)
    }

    // --- FIND BY ID (Buscar Contato Único) ---
    async findById(id: string): Promise<ContactSchema | null> {
        const query = 'SELECT * FROM contacts WHERE id = $1'
        const result = await this.executeQuery<ContactSchema>(query, [id])
        return result[0] || null
    }

    // --- UPDATE (Atualizar Dados do Contato) ---
    async update(
        id: string,
        contact: Partial<Omit<ContactSchema, 'id' | 'createdAt'>>,
    ): Promise<ContactSchema | null> {
        const fields: string[] = []
        const params: any[] = []
        let paramIndex = 1

        Object.entries(contact).forEach(([key, value]) => {
            if (value !== undefined) {
              const snakeKey = this.toSnakeCase(key) // Usa o helper
              fields.push(`${snakeKey} = $${paramIndex}`)
              params.push(value)
              paramIndex++
            }
        })

        if (fields.length === 0) return null

        params.push(id)
        const query = `UPDATE contacts SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`

        const result = await this.executeQuery<ContactSchema>(query, params)
        return result[0] || null
    }

    // --- DELETE (Remover Contato) ---
    async delete(id: string): Promise<boolean> {
        // Usa executeTransaction para garantir a verificação do rowCount
        return this.executeTransaction(async (client: PoolClient) => {
            const result = await client.query('DELETE FROM contacts WHERE id = $1', [id])
            // Retorna true se alguma linha foi afetada
            return (result.rowCount || 0) > 0
        })
    }
}