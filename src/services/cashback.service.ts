import {
  CashbackWalletRepository,
  CashbackTransactionRepository,
  OrganizationsRepository,
} from '@/repository'
import {
  CashbackWalletSchema,
  CashbackTransactionSchema,
  CashbackFiltersSchema,
} from '@/schemas'
import { CashbackTransactionType, CashbackReferenceType } from '@/enums'
import { HttpError } from '@/utils'

export class CashbackService {
  private cashbackWalletRepository: CashbackWalletRepository
  private cashbackTransactionRepository: CashbackTransactionRepository
  private organizationsRepository: OrganizationsRepository

  constructor() {
    this.cashbackWalletRepository = new CashbackWalletRepository()
    this.cashbackTransactionRepository = new CashbackTransactionRepository()
    this.organizationsRepository = new OrganizationsRepository()
  }

  async getWalletByOrganizationId(
    organizationId: string,
  ): Promise<CashbackWalletSchema> {
    const organization =
      await this.organizationsRepository.findById(organizationId)
    if (!organization) {
      throw new HttpError(
        'Organização não encontrada',
        404,
        'ORGANIZATION_NOT_FOUND',
      )
    }

    let wallet =
      await this.cashbackWalletRepository.findByOrganizationId(organizationId)

    if (!wallet) {
      wallet = await this.cashbackWalletRepository.create(organizationId)
    }

    return wallet
  }

  async getTransactionsByOrganizationId(
    organizationId: string,
    filters?: CashbackFiltersSchema,
  ): Promise<CashbackTransactionSchema[]> {
    const organization =
      await this.organizationsRepository.findById(organizationId)
    if (!organization) {
      throw new HttpError(
        'Organização não encontrada',
        404,
        'ORGANIZATION_NOT_FOUND',
      )
    }

    return await this.cashbackTransactionRepository.findByOrganizationId(
      organizationId,
      filters,
    )
  }

  async getTransactionsByOrderId(
    orderId: string,
  ): Promise<CashbackTransactionSchema[]> {
    return await this.cashbackTransactionRepository.findByOrderId(orderId)
  }

  async addCashback(data: {
    organizationId: string
    orderId: string
    amount: number
    referenceId?: string
    referenceType?: CashbackReferenceType
    description?: string
  }): Promise<CashbackTransactionSchema> {
    if (data.amount <= 0) {
      throw new HttpError(
        'O valor do cashback deve ser maior que zero',
        400,
        'INVALID_CASHBACK_AMOUNT',
      )
    }

    const wallet = await this.getWalletByOrganizationId(data.organizationId)

    return await this.cashbackTransactionRepository.create({
      cashbackWalletId: wallet.id!,
      orderId: data.orderId,
      type: CashbackTransactionType.EARNED,
      amount: data.amount,
      referenceId: data.referenceId,
      referenceType: data.referenceType,
      description: data.description || 'Cashback ganho',
    })
  }

  async useCashback(data: {
    organizationId: string
    orderId: string
    amount: number
    description?: string
  }): Promise<CashbackTransactionSchema> {
    if (data.amount <= 0) {
      throw new HttpError(
        'O valor do cashback deve ser maior que zero',
        400,
        'INVALID_CASHBACK_AMOUNT',
      )
    }

    const wallet = await this.getWalletByOrganizationId(data.organizationId)

    const hasBalance = await this.cashbackWalletRepository.hasEnoughBalance(
      data.organizationId,
      data.amount,
    )
    if (!hasBalance) {
      throw new HttpError(
        'Saldo insuficiente de cashback',
        400,
        'INSUFFICIENT_CASHBACK_BALANCE',
      )
    }

    return await this.cashbackTransactionRepository.create({
      cashbackWalletId: wallet.id!,
      orderId: data.orderId,
      type: CashbackTransactionType.USED,
      amount: data.amount,
      description: data.description || 'Cashback utilizado',
    })
  }

  async getBalance(organizationId: string): Promise<number> {
    return await this.cashbackWalletRepository.getBalance(organizationId)
  }

  async hasEnoughBalance(
    organizationId: string,
    amount: number,
  ): Promise<boolean> {
    return await this.cashbackWalletRepository.hasEnoughBalance(
      organizationId,
      amount,
    )
  }

  async getAllWallets(): Promise<CashbackWalletSchema[]> {
    return await this.cashbackWalletRepository.findAll()
  }
}
