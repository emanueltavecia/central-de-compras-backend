import { OrganizationsRepository, UsersRepository } from '@/repository'
import { StatsSchema } from '@/schemas'
import { OrgType } from '@/enums'

export class StatsService {
  private organizationsRepository = new OrganizationsRepository()
  private usersRepository = new UsersRepository()

  async getStats(): Promise<StatsSchema> {
    const [stores, suppliers, totalUsers] = await Promise.all([
      this.organizationsRepository.findAll({ type: OrgType.STORE }),
      this.organizationsRepository.findAll({ type: OrgType.SUPPLIER }),
      this.usersRepository.findAll({}),
    ])

    return {
      totalStores: stores.length,
      totalSuppliers: suppliers.length,
      totalUsers: totalUsers.length,
    }
  }
}
