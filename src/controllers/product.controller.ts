
import { ApiController, ApiRoute } from '@/decorators'
import { ProductSchema, ErrorResponseSchema, SuccessResponseSchema, UpdateProductStatusSchema } from '@/schemas'
import { createSuccessResponse, createErrorResponse, VALIDATION_MESSAGES } from '@/utils'
import { Request, Response } from 'express'
import { ProductService } from '@/services'

@ApiController('/products', ['Product'])
export class ProductController {
  private productService: ProductService

  constructor() {
    this.productService = new ProductService()
  }

  @ApiRoute({
    method: 'post',
    path: '/',
    summary: 'Cadastra um novo produto',
    body: ProductSchema,
    responses: {
      201: SuccessResponseSchema.create({
        schema: ProductSchema,
        dataDescription: 'Produto cadastrado',
        message: 'Produto cadastrado com sucesso',
      }),
      400: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async createProduct(req: Request, res: Response) {
    try {
      const productData = req.body
      const createdProduct = await this.productService.createProduct(productData)
      return {
        success: true,
        message: 'Produto cadastrado com sucesso',
        data: createdProduct,
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao cadastrar produto',
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }
  @ApiRoute({
    method: 'get',
    path: '/',
    summary: 'Lista todos os produtos',
    responses: {
      200: SuccessResponseSchema.create({
        schema: ProductSchema,
        dataDescription: 'Lista de produtos',
        isArray: true,
        message: 'Produtos listados com sucesso',
      }),
      500: ErrorResponseSchema,
    },
  })
  async listProducts(req: Request, res: Response) {
    try {
      const filters = {
        status: req.query.status !== undefined ? req.query.status === 'true' : undefined,
        description: req.query.description as string | undefined,
        name: req.query.name as string | undefined,
        categoryId: req.query.categoryId as string | undefined,
        supplierOrgId: req.query.supplierOrgId as string | undefined,
      }
      const products = await this.productService.listProducts(filters)
      return createSuccessResponse('Produtos listados com sucesso', products)
    } catch (error) {
      return createErrorResponse('Erro ao listar produtos', error instanceof Error ? error.message : String(error))
    }
  }
  @ApiRoute({
    method: 'put',
    path: '/:id',
    summary: 'Edita um produto existente',
    body: ProductSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: ProductSchema,
        dataDescription: 'Produto atualizado',
        message: 'Produto atualizado com sucesso',
      }),
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params
      const productData = req.body
      const updated = await this.productService.updateProduct(id, productData)
      if (!updated) {
        return {
          success: false,
          message: 'Produto não encontrado',
          data: null,
        }
      }
      return {
        success: true,
        message: 'Produto atualizado com sucesso',
        data: updated,
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao atualizar produto',
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  @ApiRoute({
    method: 'patch',
    path: '/:id/status',
    summary: 'Atualiza o status (ativo/inativo) do produto',
    body: UpdateProductStatusSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: ProductSchema,
        dataDescription: 'Status atualizado',
        message: 'Status do produto atualizado com sucesso',
      }),
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async updateProductStatus(req: Request, res: Response) {
    try {
      const { id } = req.params
      const statusData = req.body
      const updated = await this.productService.updateProductStatus(id, statusData)
      if (!updated) {
        return {
          success: false,
          message: 'Produto não encontrado',
          data: null,
        }
      }
      return {
        success: true,
        message: 'Status do produto atualizado com sucesso',
        data: updated,
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao atualizar status do produto',
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  @ApiRoute({
    method: 'get',
    path: '/:id',
    summary: 'Obtém um produto pelo ID',
    responses: {
      200: SuccessResponseSchema.create({
        schema: ProductSchema,
        dataDescription: 'Produto encontrado',
        message: 'Produto encontrado com sucesso',
      }),
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(id)) {
        return createErrorResponse(VALIDATION_MESSAGES.INVALID_UUID)
      }
      const product = await this.productService.getProductById(id)
      if (!product) {
        return createErrorResponse('Produto não encontrado')
      }
      return createSuccessResponse('Produto encontrado com sucesso', product)
    } catch (error) {
  return createErrorResponse('Erro ao buscar produto', error instanceof Error ? error.message : String(error))
    }
  }
}
