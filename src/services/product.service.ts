import { ProductRepository } from '@/repository'
import {
  ProductSchema,
  UpdateProductStatusSchema,
  ProductFiltersSchema,
} from '@/schemas'
import { HttpError } from '@/utils'

export class ProductService {
  private productRepository: ProductRepository

  constructor() {
    this.productRepository = new ProductRepository()
  }

  private removeReadOnlyFields(data: ProductSchema): ProductSchema {
    const {
      id: _id,
      active: _active,
      createdAt: _createdAt,
      createdBy: _createdBy,
      ...cleanData
    } = data
    return cleanData as ProductSchema
  }

  async listProducts(
    filters: ProductFiltersSchema = {},
  ): Promise<ProductSchema[]> {
    try {
      return await this.productRepository.findAll(filters)
    } catch (error) {
      console.error('Error getting products:', error)
      throw new HttpError('Erro ao buscar produtos', 500, 'PRODUCTS_GET_ERROR')
    }
  }

  async getProductById(id: string): Promise<ProductSchema> {
    try {
      const product = await this.productRepository.findById(id)

      if (!product) {
        throw new HttpError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND')
      }

      return product
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error getting product by id:', error)
      throw new HttpError('Erro ao buscar produto', 500, 'PRODUCT_GET_ERROR')
    }
  }

  async createProduct(
    productData: Omit<
      ProductSchema,
      'id' | 'createdAt' | 'active' | 'createdBy'
    > & { createdBy?: string },
  ): Promise<ProductSchema> {
    try {
      const cleanData = this.removeReadOnlyFields(productData as ProductSchema)
      return await this.productRepository.create({
        ...cleanData,
        createdBy: productData.createdBy,
      })
    } catch (error) {
      console.error('Error creating product:', error)
      throw new HttpError('Erro ao criar produto', 500, 'PRODUCT_CREATE_ERROR')
    }
  }

  async updateProduct(
    id: string,
    productData: Partial<Omit<ProductSchema, 'id' | 'createdAt' | 'createdBy'>>,
  ): Promise<ProductSchema> {
    try {
      const existingProduct = await this.productRepository.findById(id)

      if (!existingProduct) {
        throw new HttpError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND')
      }

      const cleanData = this.removeReadOnlyFields(productData as ProductSchema)

      const updatedProduct = await this.productRepository.update(id, cleanData)

      if (!updatedProduct) {
        throw new HttpError(
          'Erro ao atualizar produto',
          500,
          'PRODUCT_UPDATE_ERROR',
        )
      }

      return updatedProduct
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error updating product:', error)
      throw new HttpError(
        'Erro ao atualizar produto',
        500,
        'PRODUCT_UPDATE_ERROR',
      )
    }
  }

  async updateProductStatus(
    id: string,
    statusData: UpdateProductStatusSchema,
  ): Promise<ProductSchema> {
    try {
      const existingProduct = await this.productRepository.findById(id)

      if (!existingProduct) {
        throw new HttpError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND')
      }

      const updatedProduct = await this.productRepository.updateStatus(
        id,
        statusData.active,
      )

      if (!updatedProduct) {
        throw new HttpError(
          'Erro ao alterar status do produto',
          500,
          'PRODUCT_STATUS_UPDATE_ERROR',
        )
      }

      return updatedProduct
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error updating product status:', error)
      throw new HttpError(
        'Erro ao alterar status do produto',
        500,
        'PRODUCT_STATUS_UPDATE_ERROR',
      )
    }
  }
}
