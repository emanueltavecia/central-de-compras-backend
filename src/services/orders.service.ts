import {
  OrdersRepository,
  PaymentConditionsRepository,
  CampaignsRepository,
  SupplierStateConditionsRepository,
  ProductRepository,
  OrganizationsRepository,
} from '@/repository'
import {
  OrderSchema,
  OrderFiltersSchema,
  OrderCalculationRequestSchema,
  OrderCalculationResponseSchema,
  OrderCalculationItemSchema,
  CampaignSchema,
  AdjustmentDetailsSchema,
  OrderItemSchema,
} from '@/schemas'
import { CampaignScope, CampaignType, OrderStatus } from '@/enums'
import { HttpError } from '@/utils'

export class OrdersService {
  private ordersRepository: OrdersRepository
  private paymentConditionsRepository: PaymentConditionsRepository
  private campaignsRepository: CampaignsRepository
  private supplierStateConditionsRepository: SupplierStateConditionsRepository
  private productRepository: ProductRepository
  private organizationsRepository: OrganizationsRepository

  constructor() {
    this.ordersRepository = new OrdersRepository()
    this.paymentConditionsRepository = new PaymentConditionsRepository()
    this.campaignsRepository = new CampaignsRepository()
    this.supplierStateConditionsRepository =
      new SupplierStateConditionsRepository()
    this.productRepository = new ProductRepository()
    this.organizationsRepository = new OrganizationsRepository()
  }

  private removeReadOnlyFields(data: OrderSchema): OrderSchema {
    const {
      id: _id,
      status: _status,
      placedAt: _placedAt,
      createdAt: _createdAt,
      subtotalAmount: _subtotalAmount,
      shippingCost: _shippingCost,
      adjustments: _adjustments,
      totalAmount: _totalAmount,
      totalCashback: _totalCashback,
      appliedSupplierStateConditionId: _appliedSupplierStateConditionId,
      createdBy: _createdBy,
      ...cleanData
    } = data

    const items = data.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }))

    return { ...cleanData, items } as OrderSchema
  }

  async createOrder(
    data: OrderSchema,
    createdBy?: string,
  ): Promise<OrderSchema> {
    try {
      const order = this.removeReadOnlyFields(data)

      const itemsWithProductData: OrderCalculationItemSchema[] = []

      for (const inputItem of order.items) {
        const product = await this.productRepository.findById(
          inputItem.productId,
        )
        if (!product) {
          throw new HttpError(
            `Produto com ID ${inputItem.productId} não encontrado`,
            404,
            'PRODUCT_NOT_FOUND',
          )
        }

        if (!product.active) {
          throw new HttpError(
            `Produto ${product.name} não está ativo`,
            400,
            'PRODUCT_INACTIVE',
          )
        }

        if (
          product.availableQuantity !== undefined &&
          product.availableQuantity < inputItem.quantity
        ) {
          throw new HttpError(
            `Quantidade insuficiente em estoque para o produto ${product.name}. Disponível: ${product.availableQuantity}, Solicitado: ${inputItem.quantity}`,
            400,
            'INSUFFICIENT_STOCK',
          )
        }

        if (product.supplierOrgId !== order.supplierOrgId) {
          throw new HttpError(
            `Produto ${product.name} não pertence ao fornecedor especificado`,
            400,
            'PRODUCT_SUPPLIER_MISMATCH',
          )
        }

        itemsWithProductData.push({
          productId: inputItem.productId,
          productNameSnapshot: product.name,
          quantity: inputItem.quantity,
          unitPrice: product.basePrice,
          unitPriceAdjusted: product.basePrice, // Será recalculado abaixo
          totalPrice: product.basePrice * inputItem.quantity, // Será recalculado abaixo
          appliedCashbackAmount: 0, // Será recalculado abaixo
        })
      }

      const storeOrganization = await this.organizationsRepository.findById(
        order.storeOrgId,
        true,
      )

      if (!storeOrganization) {
        throw new HttpError(
          `Organização da loja com ID ${order.storeOrgId} não encontrada`,
          404,
          'STORE_ORGANIZATION_NOT_FOUND',
        )
      }

      let storeState: string | undefined
      if (storeOrganization.address && storeOrganization.address.length > 0) {
        const primaryAddress = storeOrganization.address.find(
          (addr) => addr.isPrimary,
        )
        storeState = primaryAddress?.state || storeOrganization.address[0].state
      }

      const calculationRequest: OrderCalculationRequestSchema = {
        storeOrgId: order.storeOrgId,
        supplierOrgId: order.supplierOrgId,
        shippingAddressId: order.shippingAddressId,
        paymentConditionId: order.paymentConditionId,
        storeState,
        items: itemsWithProductData,
      }

      const calculatedValues =
        await this.calculateOrderValues(calculationRequest)

      const orderData: OrderSchema = {
        storeOrgId: order.storeOrgId,
        supplierOrgId: order.supplierOrgId,
        status: OrderStatus.PLACED,
        shippingAddressId: order.shippingAddressId,
        paymentConditionId: order.paymentConditionId,
        subtotalAmount: calculatedValues.subtotalAmount,
        shippingCost: calculatedValues.shippingCost,
        adjustments: calculatedValues.adjustments,
        totalAmount: calculatedValues.totalAmount,
        totalCashback: calculatedValues.totalCashback,
        appliedSupplierStateConditionId:
          calculatedValues.appliedSupplierStateConditionId,
        createdBy,
        items: calculatedValues.calculatedItems.map(
          (item) =>
            ({
              productId: item.productId,
              productNameSnapshot:
                itemsWithProductData.find((i) => i.productId === item.productId)
                  ?.productNameSnapshot || '',
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              unitPriceAdjusted: item.unitPriceAdjusted,
              totalPrice: item.totalPrice,
              appliedCashbackAmount: item.appliedCashbackAmount,
            }) as OrderItemSchema,
        ),
      } as OrderSchema

      const createdOrder = await this.ordersRepository.create(orderData)

      return createdOrder
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
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

      const adjustments = 0
      let totalCashback = 0
      let appliedSupplierStateConditionId: string | undefined
      const adjustmentDetails: AdjustmentDetailsSchema = {}

      if (
        calculationData.storeOrgId &&
        calculationData.supplierOrgId &&
        calculationData.storeState
      ) {
        try {
          const storeState = calculationData.storeState

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
