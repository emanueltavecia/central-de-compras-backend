import { OrganizationsRepository } from '@/repository'
import { OrganizationSchema } from '@/schemas'

export class OrganizationsService {
  private repo = new OrganizationsRepository()

  async getOrganizations(filters?: { type?: string; active?: boolean }) {
    return this.repo.findAll(filters)
  }

  async getOrganizationById(id: string) {
    return this.repo.findById(id)
  }

  async createOrganization(data: OrganizationSchema, createdBy: string) {
    return this.repo.create(data, createdBy)
  }

  async updateOrganization(id: string, data: OrganizationSchema) {
    return this.repo.update(id, data)
  }

  async deleteOrganization(
    id: string,
  ): Promise<{ deleted: boolean; inactivated: boolean }> {
    const hasRelations = await this.repo.hasRelations(id)

    if (hasRelations) {
      await this.repo.updateStatus(id, false)
      return { deleted: false, inactivated: true }
    } else {
      await this.repo.deletePermanent(id)
      return { deleted: true, inactivated: false }
    }
  }

  async updateOrganizationStatus(id: string, active: boolean) {
    return this.repo.updateStatus(id, active)
  }

  async getOrganizationUsers(id: string) {
    return this.repo.findUsers(id)
  }
}
