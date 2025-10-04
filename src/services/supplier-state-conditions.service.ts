import { SupplierStateConditionsRepository } from '@/repository/supplier-state-conditions.repository'
import { SupplierStateConditionSchema } from '@/schemas'
import { UserSchema } from '@/schemas'

export class SupplierStateConditionsService {
  private repo = new SupplierStateConditionsRepository()

  async getAll(
    currentUser: UserSchema,
    filters?: { supplierOrgId?: string; state?: string },
  ) {
    return this.repo.findAll({
      supplierOrgId: filters?.supplierOrgId,
      state: filters?.state,
      userOrgId: currentUser.organizationId,
      isSupplier: currentUser.role?.name === 'SUPPLIER',
    })
  }

  async getById(id: string, currentUser: UserSchema) {
    return this.repo.findById(id, currentUser)
  }

  async create(
    conditionData: SupplierStateConditionSchema,
    currentUser: UserSchema,
  ) {
    return this.repo.create(conditionData, currentUser)
  }

  async update(
    id: string,
    conditionData: SupplierStateConditionSchema,
    currentUser: UserSchema,
  ) {
    return this.repo.update(id, conditionData, currentUser)
  }

  async delete(id: string, currentUser: UserSchema) {
    return this.repo.delete(id, currentUser)
  }

  async getBySupplierAndState(
    supplierOrgId: string,
    state: string,
    currentUser: UserSchema,
  ) {
    return this.repo.findBySupplierAndState(supplierOrgId, state, currentUser)
  }
}
