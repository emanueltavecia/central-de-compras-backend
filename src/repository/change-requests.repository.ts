import { BaseRepository } from './base.repository'
import { ChangeRequestSchema } from '@/schemas'
import { ChangeRequestStatus } from '@/enums'

export class ChangeRequestsRepository extends BaseRepository {
  async findAll(filters?: {
    status?: ChangeRequestStatus
    organizationId?: string
    userId?: string
  }): Promise<ChangeRequestSchema[]> {
    const conditions: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (filters?.status) {
      conditions.push(`cr.status = $${paramIndex++}`)
      params.push(filters.status)
    }

    if (filters?.organizationId) {
      conditions.push(`cr.organization_id = $${paramIndex++}`)
      params.push(filters.organizationId)
    }

    if (filters?.userId) {
      conditions.push(`cr.user_id = $${paramIndex++}`)
      params.push(filters.userId)
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const query = `
      SELECT 
        cr.id as "id",
        cr.user_id as "userId",
        cr.organization_id as "organizationId",
        cr.requested_changes as "requestedChanges",
        cr.status as "status",
        cr.reviewed_by as "reviewedBy",
        cr.reviewed_at as "reviewedAt",
        cr.review_note as "reviewNote",
        cr.created_at as "createdAt",
        u.full_name as "userFullName",
        u.email as "userEmail",
        o.legal_name as "organizationLegalName",
        o.type as "organizationType"
      FROM change_requests cr
  INNER JOIN users u ON cr.user_id = u.id
  INNER JOIN organizations o ON cr.organization_id = o.id
      ${whereClause}
      ORDER BY cr.created_at DESC
    `

    const result = await this.executeQuery<any>(query, params)

    return result.map((row) => ({
      id: row.id,
      userId: row.userId,
      organizationId: row.organizationId,
      requestedChanges: row.requestedChanges,
      status: row.status,
      reviewedBy: row.reviewedBy,
      reviewedAt: row.reviewedAt,
      reviewNote: row.reviewNote,
      createdAt: row.createdAt,
      user: {
        fullName: row.userFullName,
        email: row.userEmail,
      },
      organization: {
        legalName: row.organizationLegalName,
        type: row.organizationType,
      },
    }))
  }

  async findById(id: string): Promise<ChangeRequestSchema | null> {
    const query = `
      SELECT 
        cr.id as "id",
        cr.user_id as "userId",
        cr.organization_id as "organizationId",
        cr.requested_changes as "requestedChanges",
        cr.status as "status",
        cr.reviewed_by as "reviewedBy",
        cr.reviewed_at as "reviewedAt",
        cr.review_note as "reviewNote",
        cr.created_at as "createdAt",
        u.full_name as "userFullName",
        u.email as "userEmail",
        o.legal_name as "organizationLegalName",
        o.type as "organizationType",
        o.trade_name as "organizationTradeName",
        o.tax_id as "organizationTaxId",
        o.phone as "organizationPhone",
        o.email as "organizationEmail"
      FROM change_requests cr
      INNER JOIN users u ON cr.user_id = u.id
      INNER JOIN organizations o ON cr.organization_id = o.id
      WHERE cr.id = $1
    `

    const result = await this.executeQuery<any>(query, [id])
    if (result.length === 0) return null

    const row = result[0]
    return {
      id: row.id,
      userId: row.userId,
      organizationId: row.organizationId,
      requestedChanges: row.requestedChanges,
      status: row.status,
      reviewedBy: row.reviewedBy,
      reviewedAt: row.reviewedAt,
      reviewNote: row.reviewNote,
      createdAt: row.createdAt,
      user: {
        fullName: row.userFullName,
        email: row.userEmail,
      },
      organization: {
        legalName: row.organizationLegalName,
        type: row.organizationType,
        tradeName: row.organizationTradeName,
        taxId: row.organizationTaxId,
        phone: row.organizationPhone,
        email: row.organizationEmail,
      },
    }
  }

  async create(
    userId: string,
    organizationId: string,
    requestedChanges: Record<string, any>,
  ): Promise<ChangeRequestSchema> {
    const query = `
      INSERT INTO change_requests (user_id, organization_id, requested_changes)
      VALUES ($1, $2, $3)
      RETURNING 
        id as "id",
        user_id as "userId",
        organization_id as "organizationId",
        requested_changes as "requestedChanges",
        status as "status",
        reviewed_by as "reviewedBy",
        reviewed_at as "reviewedAt",
        review_note as "reviewNote",
        created_at as "createdAt"
    `

    const result = await this.executeQuery<any>(query, [
      userId,
      organizationId,
      JSON.stringify(requestedChanges),
    ])

    return {
      id: result[0].id,
      userId: result[0].userId,
      organizationId: result[0].organizationId,
      requestedChanges: result[0].requestedChanges,
      status: result[0].status,
      reviewedBy: result[0].reviewedBy,
      reviewedAt: result[0].reviewedAt,
      reviewNote: result[0].reviewNote,
      createdAt: result[0].createdAt,
    }
  }

  async review(
    id: string,
    reviewedBy: string,
    status: ChangeRequestStatus.APPROVED | ChangeRequestStatus.REJECTED,
    reviewNote?: string,
  ): Promise<ChangeRequestSchema | null> {
    const query = `
      UPDATE change_requests
      SET status = $1, reviewed_by = $2, reviewed_at = NOW(), review_note = $3
      WHERE id = $4 AND status = 'pending'
      RETURNING 
        id as "id",
        user_id as "userId",
        organization_id as "organizationId",
        requested_changes as "requestedChanges",
        status as "status",
        reviewed_by as "reviewedBy",
        reviewed_at as "reviewedAt",
        review_note as "reviewNote",
        created_at as "createdAt"
    `

    const result = await this.executeQuery<any>(query, [
      status,
      reviewedBy,
      reviewNote || null,
      id,
    ])

    if (result.length === 0) return null

    return {
      id: result[0].id,
      userId: result[0].userId,
      organizationId: result[0].organizationId,
      requestedChanges: result[0].requestedChanges,
      status: result[0].status,
      reviewedBy: result[0].reviewedBy,
      reviewedAt: result[0].reviewedAt,
      reviewNote: result[0].reviewNote,
      createdAt: result[0].createdAt,
    }
  }

  async countPending(organizationId?: string): Promise<number> {
    let query = `SELECT COUNT(*) as count FROM change_requests WHERE status = 'pending'`
    const params: any[] = []

    if (organizationId) {
      query += ` AND organization_id = $1`
      params.push(organizationId)
    }

    const result = await this.executeQuery<{ count: string }>(query, params)
    return parseInt(result[0].count, 10)
  }

  async delete(id: string): Promise<void> {
    await this.executeQuery(`DELETE FROM change_requests WHERE id = $1`, [id])
  }
}
