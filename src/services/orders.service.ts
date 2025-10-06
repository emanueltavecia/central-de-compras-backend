import {
  OrdersRepository,
  PaymentConditionsRepository,
  CampaignsRepository,
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

  constructor() {
    this.ordersRepository = new OrdersRepository()
    this.paymentConditionsRepository = new PaymentConditionsRepository()
    this.campaignsRepository = new CampaignsRepository()
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
      return await this.ordersRepository.create(cleanData)
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

  async updateOrder(
    id: string,
    orderData: Partial<Omit<OrderSchema, 'id' | 'createdAt' | 'placedAt'>>,
  ): Promise<OrderSchema> {
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
      const adjustmentDetails: AdjustmentDetailsSchema = {}

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
            const campaignApplies = this.checkCampaignApplies(
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
        adjustmentDetails,
        calculatedItems,
      }
    } catch (error) {
      console.error('Error calculating order values:', error)
      throw new HttpError(
        'Erro ao calcular valores do pedido',
        500,
        'ORDER_CALCULATION_ERROR',
      )
    }
  }

  private checkCampaignApplies(
    campaign: CampaignSchema,
    calculationData: OrderCalculationRequestSchema,
    subtotalAmount: number,
  ): boolean {
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
    }

    if (campaign.scope === CampaignScope.PRODUCT && campaign.productIds) {
      const hasApplicableProduct = calculationData.items.some((item) =>
        campaign.productIds?.includes(item.productId),
      )
      if (!hasApplicableProduct) {
        return false
      }
    }

    return true
  }
}
