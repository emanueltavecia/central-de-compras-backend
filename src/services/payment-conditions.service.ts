import { PaymentConditionsRepository } from '@/repository'
import {
  PaymentConditionSchema,
  PaymentConditionFiltersSchema,
} from '@/schemas'
import { HttpError } from '@/utils'

export class PaymentConditionsService {
  private repository: PaymentConditionsRepository

  constructor() {
    this.repository = new PaymentConditionsRepository()
  }

  private removeReadOnlyFields(
    data: PaymentConditionSchema,
  ): PaymentConditionSchema {
    const { id: _id, createdAt: _createdAt, active: _active, ...clean } = data
    return clean as PaymentConditionSchema
  }

  async list(
    filters: PaymentConditionFiltersSchema = {},
  ): Promise<PaymentConditionSchema[]> {
    try {
      return await this.repository.findAll(filters)
    } catch (error) {
      console.error('Error listing payment conditions:', error)
      throw new HttpError(
        'Erro ao buscar condições de pagamento',
        500,
        'PAYMENT_CONDITIONS_GET_ERROR',
      )
    }
  }

  async getById(id: string): Promise<PaymentConditionSchema> {
    try {
      const found = await this.repository.findById(id)
      if (!found) {
        throw new HttpError(
          'Condição de pagamento não encontrada',
          404,
          'PAYMENT_CONDITION_NOT_FOUND',
        )
      }
      return found
    } catch (error) {
      if (error instanceof HttpError) throw error
      console.error('Error getting payment condition by id:', error)
      throw new HttpError(
        'Erro ao buscar condição de pagamento',
        500,
        'PAYMENT_CONDITION_GET_ERROR',
      )
    }
  }

  async create(
    data: Omit<PaymentConditionSchema, 'id' | 'createdAt' | 'active'>,
  ): Promise<PaymentConditionSchema> {
    try {
      const clean = this.removeReadOnlyFields(data as PaymentConditionSchema)
      return await this.repository.create(clean)
    } catch (error) {
      console.error('Error creating payment condition:', error)
      throw new HttpError(
        'Erro ao criar condição de pagamento',
        500,
        'PAYMENT_CONDITION_CREATE_ERROR',
      )
    }
  }

  async update(
    id: string,
    data: Partial<Omit<PaymentConditionSchema, 'id' | 'createdAt'>>,
  ): Promise<PaymentConditionSchema> {
    try {
      const existing = await this.repository.findById(id)
      if (!existing) {
        throw new HttpError(
          'Condição de pagamento não encontrada',
          404,
          'PAYMENT_CONDITION_NOT_FOUND',
        )
      }

      const clean = this.removeReadOnlyFields(data as PaymentConditionSchema)
      const updated = await this.repository.update(id, clean)
      if (!updated) {
        throw new HttpError(
          'Erro ao atualizar condição de pagamento',
          500,
          'PAYMENT_CONDITION_UPDATE_ERROR',
        )
      }
      return updated
    } catch (error) {
      if (error instanceof HttpError) throw error
      console.error('Error updating payment condition:', error)
      throw new HttpError(
        'Erro ao atualizar condição de pagamento',
        500,
        'PAYMENT_CONDITION_UPDATE_ERROR',
      )
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const existing = await this.repository.findById(id)
      if (!existing) {
        throw new HttpError(
          'Condição de pagamento não encontrada',
          404,
          'PAYMENT_CONDITION_NOT_FOUND',
        )
      }
      await this.repository.delete(id)
    } catch (error) {
      if (error instanceof HttpError) throw error
      console.error('Error deleting payment condition:', error)
      throw new HttpError(
        'Erro ao apagar condição de pagamento',
        500,
        'PAYMENT_CONDITION_DELETE_ERROR',
      )
    }
  }
}



