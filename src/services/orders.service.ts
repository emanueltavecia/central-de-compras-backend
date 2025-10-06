import {
  OrdersRepository,
  PaymentConditionsRepository,
  CampaignsRepository,
  SupplierStateConditionsRepository,
  ProductRepository,
} from '@/repository'
import {
  OrderSchema,
  OrderFiltersSchema,
  OrderCalculationRequestSchema,
  OrderCalculationResponseSchema,
  CampaignSchema,
  AdjustmentDetailsSchema,
} from '@/schemas'
import { CampaignScope, CampaignType } from '@/enums'
import { HttpError } from '@/utils'

export class OrdersService {
  private ordersRepository: OrdersRepository
  private paymentConditionsRepository: PaymentConditionsRepository
  private campaignsRepository: CampaignsRepository
  private supplierStateConditionsRepository: SupplierStateConditionsRepository
  private productRepository: ProductRepository

  constructor() {
    this.ordersRepository = new OrdersRepository()
    this.paymentConditionsRepository = new PaymentConditionsRepository()
    this.campaignsRepository = new CampaignsRepository()
    this.supplierStateConditionsRepository =
      new SupplierStateConditionsRepository()
    this.productRepository = new ProductRepository()
  }

  private removeReadOnlyFields(data: OrderSchema): OrderSchema {
    const {
      id: _id,
      placedAt: _placedAt,
      createdAt: _createdAt,
      totalCashback: _totalCashback,
      appliedSupplierStateConditionId: _appliedSupplierStateConditionId,
      ...cleanData
    } = data
    return cleanData as OrderSchema
  }

  async createOrder(
    orderData: Omit<OrderSchema, 'id' | 'createdAt' | 'placedAt'>,
  ): Promise<OrderSchema> {
    try {
      const cleanData = this.removeReadOnlyFields(orderData as OrderSchema)

      if (cleanData.items && cleanData.items.length > 0) {
        const calculationRequest: OrderCalculationRequestSchema = {
          storeOrgId: cleanData.storeOrgId!,
          supplierOrgId: cleanData.supplierOrgId!,
          shippingAddressId: cleanData.shippingAddressId,
          paymentConditionId: cleanData.paymentConditionId,
          items: cleanData.items,
        }

        const calculatedValues =
          await this.calculateOrderValues(calculationRequest)

        cleanData.subtotalAmount = calculatedValues.subtotalAmount
        cleanData.shippingCost = calculatedValues.shippingCost
        cleanData.adjustments = calculatedValues.adjustments
        cleanData.totalAmount = calculatedValues.totalAmount

        if (
          calculatedValues.totalCashback > 0 ||
          calculatedValues.appliedSupplierStateConditionId
        ) {
          cleanData.totalCashback = calculatedValues.totalCashback
          cleanData.appliedSupplierStateConditionId =
            calculatedValues.appliedSupplierStateConditionId
        }
      }

      const createdOrder = await this.ordersRepository.create(
        cleanData as OrderSchema,
      )

      return createdOrder
    } catch (error) {
      console.error('Error creating order:', error)
      throw new HttpError('Erro ao criar pedido', 500, 'ORDER_CREATE_ERROR')
    }
  }

  async getOrderById(id: string): Promise<OrderSchema> {
    try {
      const order = await this.ordersRepository.findById(id)

      if (!order) {
        throw new HttpError('Pedido não encontrado', 404, 'ORDER_NOT_FOUND')
      }

      return order
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error getting order by id:', error)
      throw new HttpError('Erro ao buscar pedido', 500, 'ORDER_GET_ERROR')
    }
  }

  async getAllOrders(filters: OrderFiltersSchema = {}): Promise<OrderSchema[]> {
    try {
      const result = await this.ordersRepository.findAll(filters)

      return result.orders
    } catch (error) {
      console.error('Error getting orders:', error)
      throw new HttpError('Erro ao buscar pedidos', 500, 'ORDERS_GET_ERROR')
    }
  }

  async updateOrder(id: string, orderData: OrderSchema): Promise<OrderSchema> {
    try {
      const existingOrder = await this.ordersRepository.findById(id)

      if (!existingOrder) {
        throw new HttpError('Pedido não encontrado', 404, 'ORDER_NOT_FOUND')
      }

      const cleanData = this.removeReadOnlyFields(orderData as OrderSchema)

      const updatedOrder = await this.ordersRepository.update(id, cleanData)

      if (!updatedOrder) {
        throw new HttpError(
          'Erro ao atualizar pedido',
          500,
          'ORDER_UPDATE_ERROR',
        )
      }

      return updatedOrder
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error updating order:', error)
      throw new HttpError('Erro ao atualizar pedido', 500, 'ORDER_UPDATE_ERROR')
    }
  }

  async deleteOrder(id: string): Promise<void> {
    try {
      const existingOrder = await this.ordersRepository.findById(id)

      if (!existingOrder) {
        throw new HttpError('Pedido não encontrado', 404, 'ORDER_NOT_FOUND')
      }

      const deleted = await this.ordersRepository.delete(id)

      if (!deleted) {
        throw new HttpError('Erro ao deletar pedido', 500, 'ORDER_DELETE_ERROR')
      }
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error deleting order:', error)
      throw new HttpError('Erro ao deletar pedido', 500, 'ORDER_DELETE_ERROR')
    }
  }

  async calculateOrderValues(
    calculationData: OrderCalculationRequestSchema,
  ): Promise<OrderCalculationResponseSchema> {
    try {
      let subtotalAmount = 0
      let calculatedItems = calculationData.items.map((item) => {
        const itemTotal = item.unitPrice * item.quantity
        subtotalAmount += itemTotal

        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          unitPriceAdjusted: item.unitPrice,
          totalPrice: itemTotal,
          appliedCashbackAmount: 0,
        }
      })

      let adjustments = 0
      let totalCashback = 0
      let appliedSupplierStateConditionId: string | undefined
      const adjustmentDetails: AdjustmentDetailsSchema = {}

      if (calculationData.storeOrgId && calculationData.supplierOrgId) {
        try {
          const storeState = calculationData.storeState || 'SP'

          const supplierStateConditions =
            await this.supplierStateConditionsRepository.findAll({
              supplierOrgId: calculationData.supplierOrgId,
              state: storeState,
            })

          if (supplierStateConditions && supplierStateConditions.length > 0) {
            const activeCondition = supplierStateConditions[0]
            appliedSupplierStateConditionId = activeCondition.id

            if (
              activeCondition.unitPriceAdjustment &&
              activeCondition.unitPriceAdjustment !== 1.0
            ) {
              calculatedItems = calculatedItems.map((item) => {
                const adjustedUnitPrice =
                  item.unitPrice * activeCondition.unitPriceAdjustment!
                const adjustedTotalPrice = adjustedUnitPrice * item.quantity

                return {
                  ...item,
                  unitPriceAdjusted: Math.round(adjustedUnitPrice * 100) / 100,
                  totalPrice: Math.round(adjustedTotalPrice * 100) / 100,
                }
              })

              subtotalAmount = calculatedItems.reduce(
                (sum, item) => sum + item.totalPrice,
                0,
              )
            }

            if (
              activeCondition.cashbackPercent &&
              activeCondition.cashbackPercent > 0
            ) {
              const stateCashback =
                (subtotalAmount * activeCondition.cashbackPercent) / 100
              totalCashback += stateCashback
            }

            adjustmentDetails.supplierStateCondition = {
              id: activeCondition.id,
              state: activeCondition.state,
              unitPriceAdjustment: activeCondition.unitPriceAdjustment || 1.0,
              cashbackPercent: activeCondition.cashbackPercent || 0,
            }
          }
        } catch (error) {
          console.warn('Error fetching supplier state conditions:', error)
        }
      }

      if (calculationData.paymentConditionId) {
        try {
          const paymentCondition =
            await this.paymentConditionsRepository.findById(
              calculationData.paymentConditionId,
            )
          if (paymentCondition) {
            adjustmentDetails.paymentCondition = {
              id: paymentCondition.id,
              name: paymentCondition.name || 'Condição de pagamento',
              paymentMethod: paymentCondition.paymentMethod,
            }
          }
        } catch (error) {
          console.warn('Error fetching payment condition:', error)
        }
      }

      try {
        const campaigns = await this.campaignsRepository.findAll({
          supplierOrgId: calculationData.supplierOrgId,
          active: true,
        })

        if (campaigns.campaigns && campaigns.campaigns.length > 0) {
          adjustmentDetails.campaigns = []

          for (const campaign of campaigns.campaigns) {
            const campaignApplies = await this.checkCampaignApplies(
              campaign,
              calculationData,
              subtotalAmount,
            )

            if (campaignApplies) {
              adjustmentDetails.campaigns.push({
                id: campaign.id,
                name: campaign.name,
                type: campaign.type,
                cashbackPercent: campaign.cashbackPercent,
                giftProductId: campaign.giftProductId,
              })

              if (
                campaign.type === CampaignType.CASHBACK &&
                campaign.cashbackPercent
              ) {
                const campaignCashback =
                  (subtotalAmount * campaign.cashbackPercent) / 100
                totalCashback += campaignCashback
              }
            }
          }
        }
      } catch (error) {
        console.warn('Error fetching campaigns:', error)
      }

      if (totalCashback > 0) {
        calculatedItems = calculatedItems.map((item) => {
          const itemCashback =
            (item.totalPrice / subtotalAmount) * totalCashback
          return {
            ...item,
            appliedCashbackAmount: Math.round(itemCashback * 100) / 100,
          }
        })
      }

      const shippingCost = calculationData.shippingAddressId ? 25.0 : 0

      const totalAmount = subtotalAmount + shippingCost + adjustments

      return {
        subtotalAmount: Math.round(subtotalAmount * 100) / 100,
        shippingCost: Math.round(shippingCost * 100) / 100,
        adjustments: Math.round(adjustments * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalCashback: Math.round(totalCashback * 100) / 100,
        appliedSupplierStateConditionId,
        adjustmentDetails,
        calculatedItems,
      }
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error calculating order values:', error)
      throw new HttpError(
        'Erro ao calcular valores do pedido',
        500,
        'ORDER_CALCULATION_ERROR',
      )
    }
  }

  private async checkCampaignApplies(
    campaign: CampaignSchema,
    calculationData: OrderCalculationRequestSchema,
    subtotalAmount: number,
  ): Promise<boolean> {
    if (campaign.minTotal && subtotalAmount < campaign.minTotal) {
      return false
    }

    if (campaign.minQuantity) {
      const totalQuantity = calculationData.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      )
      if (totalQuantity < campaign.minQuantity) {
        return false
      }
    }

    if (campaign.scope === CampaignScope.CATEGORY && campaign.categoryId) {
      const productIds = calculationData.items.map((item) => item.productId)

      const hasApplicableProduct = await this.checkProductsInCategory(
        productIds,
        campaign.categoryId,
      )

      if (!hasApplicableProduct) {
        return false
      }
    }

    if (campaign.scope === CampaignScope.PRODUCT && campaign.productIds) {
      const hasApplicableProduct = calculationData.items.some((item) =>
        campaign.productIds?.includes(item.productId),
      )
      if (!hasApplicableProduct) {
        return false
      }
    }

    const now = new Date()
    if (campaign.startAt && new Date(campaign.startAt) > now) {
      return false
    }
    if (campaign.endAt && new Date(campaign.endAt) < now) {
      return false
    }

    return true
  }

  private async checkProductsInCategory(
    productIds: string[],
    categoryId: string,
  ): Promise<boolean> {
    for (const productId of productIds) {
      const product = await this.productRepository.findById(productId)
      if (product && product.categoryId === categoryId) {
        return true
      }
    }
    return false
  }
}
