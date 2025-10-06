import { Pool, PoolClient, types } from 'pg'
import { Decimal } from 'decimal.js'
import { config } from '@/config'

const NUMERIC_TYPE_OID = 1700

types.setTypeParser(NUMERIC_TYPE_OID, (val: string) =>
  val == null ? null : new Decimal(val).toNumber(),
)

class Database {
  private pool: Pool

  constructor() {
    this.pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.name,
      ssl: config.database.ssl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err)
    })
  }

  async getConnection(): Promise<PoolClient> {
    return this.pool.connect()
  }

  async query(text: string, params?: any[]): Promise<any> {
    const client = await this.getConnection()
    try {
      const result = await client.query(text, params)
      return result
    } finally {
      client.release()
    }
  }

  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.getConnection()
    try {
      await client.query('BEGIN')
      const result = await callback(client)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  async close(): Promise<void> {
    await this.pool.end()
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.query('SELECT NOW()')
      console.log('Database connection successful:', result.rows[0])
      return true
    } catch (error) {
      console.error('Database connection failed:', error)
      return false
    }
  }
}

export const database = new Database()
export type { PoolClient }
