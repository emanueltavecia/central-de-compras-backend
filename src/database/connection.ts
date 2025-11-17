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

    // Inicializa esquema de forma síncrona
    this.initializeSchema()
  }

  private async initializeSchema() {
    try {
      // Garante coluna password_plain
      await this.pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password_plain TEXT')
      console.log('✓ password_plain column ensured')
      
      // Garante esquema de change_requests
      await this.ensureChangeRequestsSchema()
      console.log('✓ change_requests schema ensured')
    } catch (err) {
      console.error('Failed to initialize database schema:', err)
    }
  }

  private async ensureChangeRequestsSchema() {
    try {
      // Ensure enum type exists
      await this.pool.query(
        "DO $$ BEGIN CREATE TYPE change_request_status AS ENUM ('pending','approved','rejected'); EXCEPTION WHEN duplicate_object THEN null; END $$;"
      )

      // Ensure table exists
      await this.pool.query(
        `CREATE TABLE IF NOT EXISTS change_requests (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          requested_changes JSONB NOT NULL,
          status change_request_status NOT NULL DEFAULT 'pending',
          reviewed_by UUID REFERENCES users(id),
          reviewed_at TIMESTAMP WITH TIME ZONE,
          review_note TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        )`
      )

      // Ensure indexes exist
      await this.pool.query(
        'CREATE INDEX IF NOT EXISTS idx_change_requests_user ON change_requests(user_id)'
      )
      await this.pool.query(
        'CREATE INDEX IF NOT EXISTS idx_change_requests_org ON change_requests(organization_id)'
      )
      await this.pool.query(
        'CREATE INDEX IF NOT EXISTS idx_change_requests_status ON change_requests(status)'
      )
    } catch (err) {
      console.error('Error creating change_requests schema:', err)
      throw err
    }
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
