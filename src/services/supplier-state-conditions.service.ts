import { UserRole } from '@/enums'
import { SupplierStateConditionsRepository } from '@/repository'
import { SupplierStateConditionSchema, UserSchema } from '@/schemas'
import { HttpError } from '@/utils'

export class SupplierStateConditionsService {
  private supplierStateConditionsRepository: SupplierStateConditionsRepository

  constructor() {
    this.supplierStateConditionsRepository =
      new SupplierStateConditionsRepository()
  }

  private removeReadOnlyFields(
    data: SupplierStateConditionSchema,
  ): Partial<SupplierStateConditionSchema> {
    const { id: _id, createdAt: _createdAt, ...cleanData } = data
    return cleanData
  }

  async getAll(
    currentUser: UserSchema,
    filters?: { supplierOrgId?: string; state?: string },
  ): Promise<SupplierStateConditionSchema[]> {
    try {
      return await this.supplierStateConditionsRepository.findAll({
        supplierOrgId: filters?.supplierOrgId,
        state: filters?.state,
        userOrgId: currentUser.organizationId,
        isSupplier: currentUser.role?.name === UserRole.SUPPLIER,
      })
    } catch (error) {
      console.error('Error listing supplier state conditions:', error)
      throw new HttpError(
        'Erro ao buscar condições por estado',
        500,
        'SUPPLIER_CONDITIONS_GET_ERROR',
      )
    }
  }

  async getById(
    id: string,
    currentUser: UserSchema,
  ): Promise<SupplierStateConditionSchema> {
    try {
      const condition = await this.supplierStateConditionsRepository.findById(
        id,
        currentUser,
      )

      if (!condition) {
        throw new HttpError(
          'Condição não encontrada',
          404,
          'CONDITION_NOT_FOUND',
        )
      }

      return condition
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error getting supplier state condition by id:', error)
      throw new HttpError(
        'Erro ao buscar condição por estado',
        500,
        'SUPPLIER_CONDITION_GET_ERROR',
      )
    }
  }

  async create(
    conditionData: Omit<SupplierStateConditionSchema, 'id' | 'createdAt'>,
  ): Promise<SupplierStateConditionSchema> {
    try {
      const cleanData = this.removeReadOnlyFields(
        conditionData as SupplierStateConditionSchema,
      )

      if (
        !cleanData.supplierOrgId ||
        typeof cleanData.supplierOrgId !== 'string'
      ) {
        throw new HttpError(
          'supplierOrgId é obrigatório',
          400,
          'SUPPLIER_ORG_ID_REQUIRED',
        )
      }

      if (!cleanData.state || typeof cleanData.state !== 'string') {
        throw new HttpError('state é obrigatório', 400, 'STATE_REQUIRED')
      }

      return await this.supplierStateConditionsRepository.create(
        cleanData as Omit<SupplierStateConditionSchema, 'id' | 'createdAt'>,
      )
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error creating supplier state condition:', error)
      throw new HttpError(
        'Erro ao criar condição por estado',
        500,
        'SUPPLIER_CONDITION_CREATE_ERROR',
      )
    }
  }

  async update(
    id: string,
    conditionData: Partial<
      Omit<SupplierStateConditionSchema, 'id' | 'createdAt'>
    >,
    currentUser: UserSchema,
  ): Promise<SupplierStateConditionSchema> {
    try {
      const existingCondition =
        await this.supplierStateConditionsRepository.findById(id, currentUser)

      if (!existingCondition) {
        throw new HttpError(
          'Condição não encontrada',
          404,
          'CONDITION_NOT_FOUND',
        )
      }

      const cleanData = this.removeReadOnlyFields(
        conditionData as SupplierStateConditionSchema,
      )

      const updatedCondition =
        await this.supplierStateConditionsRepository.update(
          id,
          cleanData as Partial<
            Omit<SupplierStateConditionSchema, 'id' | 'createdAt'>
          >,
          currentUser,
        )

      if (!updatedCondition) {
        throw new HttpError(
          'Erro ao atualizar condição por estado',
          500,
          'SUPPLIER_CONDITION_UPDATE_ERROR',
        )
      }

      return updatedCondition
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error updating supplier state condition:', error)
      throw new HttpError(
        'Erro ao atualizar condição por estado',
        500,
        'SUPPLIER_CONDITION_UPDATE_ERROR',
      )
    }
  }

  async delete(id: string, currentUser: UserSchema): Promise<void> {
    try {
      const deleted = await this.supplierStateConditionsRepository.delete(
        id,
        currentUser,
      )

      if (!deleted) {
        throw new HttpError(
          'Condição não encontrada',
          404,
          'CONDITION_NOT_FOUND',
        )
      }
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error deleting supplier state condition:', error)
      throw new HttpError(
        'Erro ao deletar condição por estado',
        500,
        'SUPPLIER_CONDITION_DELETE_ERROR',
      )
    }
  }

  async getBySupplierAndState(
    supplierOrgId: string,
    state: string,
  ): Promise<SupplierStateConditionSchema> {
    try {
      if (!supplierOrgId || typeof supplierOrgId !== 'string') {
        throw new HttpError(
          'supplierOrgId é obrigatório',
          400,
          'SUPPLIER_ORG_ID_REQUIRED',
        )
      }

      if (!state || typeof state !== 'string') {
        throw new HttpError('state é obrigatório', 400, 'STATE_REQUIRED')
      }

      const condition =
        await this.supplierStateConditionsRepository.findBySupplierAndState(
          supplierOrgId,
          state,
        )

      if (!condition) {
        throw new HttpError(
          'Condições não encontradas para este fornecedor e estado',
          404,
          'CONDITIONS_NOT_FOUND',
        )
      }

      return condition
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error(
        'Error getting supplier state condition by supplier and state:',
        error,
      )
      throw new HttpError(
        'Erro ao buscar condições por fornecedor e estado',
        500,
        'SUPPLIER_CONDITIONS_GET_ERROR',
      )
    }
  }
}
