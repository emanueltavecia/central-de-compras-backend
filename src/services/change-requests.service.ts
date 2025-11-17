import { ChangeRequestsRepository, OrganizationsRepository, UsersRepository } from '@/repository'
import {
  ChangeRequestSchema,
  CreateChangeRequestSchema,
  ReviewChangeRequestSchema,
} from '@/schemas'
import { ChangeRequestStatus } from '@/enums'
import { HttpError } from '@/utils'

export class ChangeRequestsService {
  private changeRequestsRepository: ChangeRequestsRepository
  private organizationsRepository: OrganizationsRepository
  private usersRepository: UsersRepository

  constructor() {
    this.changeRequestsRepository = new ChangeRequestsRepository()
    this.organizationsRepository = new OrganizationsRepository()
    this.usersRepository = new UsersRepository()
  }

  async getAllChangeRequests(filters?: {
    status?: ChangeRequestStatus
    organizationId?: string
    userId?: string
  }): Promise<ChangeRequestSchema[]> {
    return this.changeRequestsRepository.findAll(filters)
  }

  async getChangeRequestById(id: string): Promise<ChangeRequestSchema> {
    const changeRequest = await this.changeRequestsRepository.findById(id)
    if (!changeRequest) {
      throw new HttpError(
        'Solicitação não encontrada',
        404,
        'CHANGE_REQUEST_NOT_FOUND',
      )
    }
    return changeRequest
  }

  async createChangeRequest(
    userId: string,
    organizationId: string,
    data: CreateChangeRequestSchema,
  ): Promise<ChangeRequestSchema> {
    // Verificar se a organização existe
    const organization =
      await this.organizationsRepository.findById(organizationId)
    if (!organization) {
      throw new HttpError(
        'Organização não encontrada',
        404,
        'ORGANIZATION_NOT_FOUND',
      )
    }

    // Criar a solicitação
    return this.changeRequestsRepository.create(
      userId,
      organizationId,
      data.requestedChanges,
    )
  }

  async reviewChangeRequest(
    id: string,
    reviewedBy: string,
    data: ReviewChangeRequestSchema,
  ): Promise<ChangeRequestSchema> {
    // Buscar a solicitação
    const changeRequest = await this.changeRequestsRepository.findById(id)
    if (!changeRequest) {
      throw new HttpError(
        'Solicitação não encontrada',
        404,
        'CHANGE_REQUEST_NOT_FOUND',
      )
    }

    if (changeRequest.status !== ChangeRequestStatus.PENDING) {
      throw new HttpError(
        'Solicitação já foi revisada',
        400,
        'CHANGE_REQUEST_ALREADY_REVIEWED',
      )
    }

    // Se for aprovado, atualizar os dados do usuário
    if (data.status === ChangeRequestStatus.APPROVED) {
      await this.usersRepository.update(
        changeRequest.userId,
        changeRequest.organizationId,
        changeRequest.requestedChanges as any,
      )
    }

    // Atualizar o status da solicitação
    const reviewed = await this.changeRequestsRepository.review(
      id,
      reviewedBy,
      data.status,
      data.reviewNote,
    )

    if (!reviewed) {
      throw new HttpError(
        'Erro ao revisar solicitação',
        500,
        'REVIEW_FAILED',
      )
    }

    return reviewed
  }

  async getPendingCount(organizationId?: string): Promise<number> {
    return this.changeRequestsRepository.countPending(organizationId)
  }

  async deleteChangeRequest(id: string): Promise<void> {
    const changeRequest = await this.changeRequestsRepository.findById(id)
    if (!changeRequest) {
      throw new HttpError(
        'Solicitação não encontrada',
        404,
        'CHANGE_REQUEST_NOT_FOUND',
      )
    }

    await this.changeRequestsRepository.delete(id)
  }
}
