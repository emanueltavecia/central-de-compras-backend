import { database, PoolClient } from '@/database'
import humps from 'humps'

export abstract class BaseRepository {
  protected async executeQuery<T = any>(
    query: string,
    params?: any[],
  ): Promise<T[]> {
    try {
      const result = await database.query(query, params)
      return humps.camelizeKeys(result.rows) as T[]
    } catch (error) {
      console.error('Database query error:', error)
      throw new Error(`Database operation failed: ${error}`)
    }
  }

  protected async executeTransaction<T>(
    callback: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    try {
      return await database.transaction(callback)
    } catch (error) {
      console.error('Database transaction error:', error)
      throw new Error(`Database transaction failed: ${error}`)
    }
  }
}
