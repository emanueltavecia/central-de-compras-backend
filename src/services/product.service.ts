import { ProductRepository } from '@/repository'
import { ProductSchema, UpdateProductStatusSchema } from '@/schemas'

export class ProductService {
  private productRepository: ProductRepository

  constructor() {
    this.productRepository = new ProductRepository()
  }

  async listProducts(filters: {
    status?: boolean;
    description?: string;
    name?: string;
    categoryId?: string;
    supplierOrgId?: string;
  }) {
    return this.productRepository.findAll(filters)
  }

  async getProductById(id: string) {
    return this.productRepository.findById(id)
  }

  async createProduct(productData: Omit<ProductSchema, 'id' | 'createdAt' | 'active' | 'createdBy'> & { createdBy?: string }) {
    return this.productRepository.create(productData)
  }

  async updateProduct(id: string, productData: Partial<Omit<ProductSchema, 'id' | 'createdAt' | 'createdBy'>>) {
    return this.productRepository.update(id, productData)
  }

  async updateProductStatus(id: string, statusData: UpdateProductStatusSchema) {
    return this.productRepository.updateStatus(id, statusData.active)
  }
}
