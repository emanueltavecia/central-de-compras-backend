import {
  OrganizationsRepository,
  UsersRepository,
  CampaignsRepository,
  SupplierStateConditionsRepository,
  OrdersRepository,
  PaymentConditionsRepository,
  ProductRepository,
  CashbackWalletRepository,
} from '@/repository'
import {
  AdminStatsSchema,
  SupplierStatsSchema,
  StoreStatsSchema,
} from '@/schemas'
import { OrgType, OrderStatus } from '@/enums'

export class StatsService {
  private organizationsRepository = new OrganizationsRepository()
  private usersRepository = new UsersRepository()
  private campaignsRepository = new CampaignsRepository()
  private supplierStateConditionsRepository =
    new SupplierStateConditionsRepository()
  private ordersRepository = new OrdersRepository()
  private paymentConditionsRepository = new PaymentConditionsRepository()
  private productRepository = new ProductRepository()
  private cashbackWalletRepository = new CashbackWalletRepository()

  async getAdminStats(): Promise<AdminStatsSchema> {
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

  async getSupplierStats(supplierOrgId: string): Promise<SupplierStatsSchema> {
    const [
      campaigns,
      supplierStateConditions,
      orders,
      paymentConditions,
      products,
    ] = await Promise.all([
      this.campaignsRepository.findAll({
        supplierOrgId,
        active: true,
      }),
      this.supplierStateConditionsRepository.findAll({
        supplierOrgId,
      }),
      this.ordersRepository.findAll({
        supplierOrgId,
      }),
      this.paymentConditionsRepository.findAll({
        supplierOrgId,
        status: true,
      }),
      this.productRepository.findAll({
        supplierOrgId,
        status: true,
      }),
    ])

    // Filtrar pedidos ativos (não cancelados, rejeitados, pendentes ou rascunho)
    const activeOrders = orders.orders.filter(
      (order) =>
        order.status !== OrderStatus.CANCELLED &&
        order.status !== OrderStatus.REJECTED &&
        order.status !== OrderStatus.PLACED &&
        order.status !== OrderStatus.DRAFT,
    )

    return {
      activeCampaigns: campaigns.total,
      activeSupplierStateConditions: supplierStateConditions.length,
      activeOrders: activeOrders.length,
      activePaymentConditions: paymentConditions.length,
      activeProducts: products.length,
    }
  }

  async getStoreStats(storeOrgId: string): Promise<StoreStatsSchema> {
    const [placedOrders, confirmedOrders, shippedOrders, cashbackWallet] =
      await Promise.all([
        this.ordersRepository.findAll({
          storeOrgId,
          status: OrderStatus.PLACED,
        }),
        this.ordersRepository.findAll({
          storeOrgId,
          status: OrderStatus.CONFIRMED,
        }),
        this.ordersRepository.findAll({
          storeOrgId,
          status: OrderStatus.SHIPPED,
        }),
        this.cashbackWalletRepository.findByOrganizationId(storeOrgId),
      ])

    return {
      placedOrders: placedOrders.total,
      confirmedOrders: confirmedOrders.total,
      shippedOrders: shippedOrders.total,
      cashbackBalance: cashbackWallet?.availableBalance || 0,
    }
  }
}
