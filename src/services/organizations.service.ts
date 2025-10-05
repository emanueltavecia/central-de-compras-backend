import { OrganizationsRepository } from '@/repository'
import { OrganizationSchema } from '@/schemas'
import { HttpError } from '@/utils'

export class OrganizationsService {
  private organizationRepository: OrganizationsRepository

  constructor() {
    this.organizationRepository = new OrganizationsRepository()
  }

  private removeReadOnlyFields(
    data: OrganizationSchema,
  ): Partial<OrganizationSchema> {
    const {
      id: _id,
      createdAt: _createdAt,
      createdBy: _createdBy,
      ...cleanData
    } = data
    return cleanData
  }

  async getOrganizations(filters?: {
    type?: string
    active?: boolean
  }): Promise<OrganizationSchema[]> {
    try {
      return await this.organizationRepository.findAll(filters)
    } catch (error) {
      console.error('Error listing organizations:', error)
      throw new HttpError(
        'Erro ao buscar organizações',
        500,
        'ORGANIZATIONS_GET_ERROR',
      )
    }
  }

  async getOrganizationById(id: string): Promise<OrganizationSchema> {
    try {
      const organization = await this.organizationRepository.findById(id)

      if (!organization) {
        throw new HttpError(
          'Organização não encontrada',
          404,
          'ORGANIZATION_NOT_FOUND',
        )
      }

      return organization
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error getting organization by id:', error)
      throw new HttpError(
        'Erro ao buscar organização',
        500,
        'ORGANIZATION_GET_ERROR',
      )
    }
  }

  async createOrganization(
    organizationData: Omit<
      OrganizationSchema,
      'id' | 'createdAt' | 'createdBy'
    >,
    createdBy: string,
  ): Promise<OrganizationSchema> {
    try {
      const cleanData = this.removeReadOnlyFields(
        organizationData as OrganizationSchema,
      )

      if (cleanData.taxId) {
        const existsByDocument =
          await this.organizationRepository.checkExistsByDocument(
            cleanData.taxId,
          )
        if (existsByDocument) {
          throw new HttpError(
            'Documento já cadastrado',
            409,
            'ORGANIZATION_DOCUMENT_EXISTS',
          )
        }
      }

      if (cleanData.email) {
        const existsByEmail =
          await this.organizationRepository.checkExistsByEmail(cleanData.email)
        if (existsByEmail) {
          throw new HttpError(
            'Email já cadastrado',
            409,
            'ORGANIZATION_EMAIL_EXISTS',
          )
        }
      }

      return await this.organizationRepository.create(
        cleanData as Omit<OrganizationSchema, 'id' | 'createdAt' | 'createdBy'>,
        createdBy,
      )
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error creating organization:', error)
      throw new HttpError(
        'Erro ao criar organização',
        500,
        'ORGANIZATION_CREATE_ERROR',
      )
    }
  }

  async updateOrganization(
    id: string,
    organizationData: Partial<
      Omit<OrganizationSchema, 'id' | 'createdAt' | 'createdBy'>
    >,
  ): Promise<OrganizationSchema> {
    try {
      const existingOrganization =
        await this.organizationRepository.findById(id)

      if (!existingOrganization) {
        throw new HttpError(
          'Organização não encontrada',
          404,
          'ORGANIZATION_NOT_FOUND',
        )
      }

      const cleanData = this.removeReadOnlyFields(
        organizationData as OrganizationSchema,
      )

      if (cleanData.taxId && cleanData.taxId !== existingOrganization.taxId) {
        const existsByDocument =
          await this.organizationRepository.checkExistsByDocument(
            cleanData.taxId,
          )
        if (existsByDocument) {
          throw new HttpError(
            'Documento já cadastrado',
            409,
            'ORGANIZATION_DOCUMENT_EXISTS',
          )
        }
      }

      if (cleanData.email && cleanData.email !== existingOrganization.email) {
        const existsByEmail =
          await this.organizationRepository.checkExistsByEmail(cleanData.email)
        if (existsByEmail) {
          throw new HttpError(
            'Email já cadastrado',
            409,
            'ORGANIZATION_EMAIL_EXISTS',
          )
        }
      }

      const updatedOrganization = await this.organizationRepository.update(
        id,
        cleanData,
      )

      if (!updatedOrganization) {
        throw new HttpError(
          'Erro ao atualizar organização',
          500,
          'ORGANIZATION_UPDATE_ERROR',
        )
      }

      return updatedOrganization
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error updating organization:', error)
      throw new HttpError(
        'Erro ao atualizar organização',
        500,
        'ORGANIZATION_UPDATE_ERROR',
      )
    }
  }

  async deleteOrganization(
    id: string,
  ): Promise<{ deleted: boolean; inactivated: boolean }> {
    try {
      const existingOrganization =
        await this.organizationRepository.findById(id)

      if (!existingOrganization) {
        throw new HttpError(
          'Organização não encontrada',
          404,
          'ORGANIZATION_NOT_FOUND',
        )
      }

      const hasRelations = await this.organizationRepository.hasRelations(id)

      if (hasRelations) {
        await this.organizationRepository.updateStatus(id, false)
        return { deleted: false, inactivated: true }
      } else {
        await this.organizationRepository.deletePermanent(id)
        return { deleted: true, inactivated: false }
      }
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error deleting organization:', error)
      throw new HttpError(
        'Erro ao deletar organização',
        500,
        'ORGANIZATION_DELETE_ERROR',
      )
    }
  }

  async updateOrganizationStatus(
    id: string,
    active: boolean,
  ): Promise<OrganizationSchema> {
    try {
      const existingOrganization =
        await this.organizationRepository.findById(id)

      if (!existingOrganization) {
        throw new HttpError(
          'Organização não encontrada',
          404,
          'ORGANIZATION_NOT_FOUND',
        )
      }

      const updatedOrganization =
        await this.organizationRepository.updateStatus(id, active)

      if (!updatedOrganization) {
        throw new HttpError(
          'Erro ao atualizar status da organização',
          500,
          'ORGANIZATION_UPDATE_STATUS_ERROR',
        )
      }

      return updatedOrganization
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error updating organization status:', error)
      throw new HttpError(
        'Erro ao atualizar status da organização',
        500,
        'ORGANIZATION_UPDATE_STATUS_ERROR',
      )
    }
  }

  async getOrganizationUsers(id: string): Promise<any[]> {
    try {
      const existingOrganization =
        await this.organizationRepository.findById(id)

      if (!existingOrganization) {
        throw new HttpError(
          'Organização não encontrada',
          404,
          'ORGANIZATION_NOT_FOUND',
        )
      }

      return await this.organizationRepository.findUsers(id)
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error getting organization users:', error)
      throw new HttpError(
        'Erro ao buscar usuários da organização',
        500,
        'ORGANIZATION_USERS_GET_ERROR',
      )
    }
  }
}
