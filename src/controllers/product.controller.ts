
import { ApiController, ApiRoute } from '@/decorators'
import { ProductSchema, ErrorResponseSchema, SuccessResponseSchema } from '@/schemas'
import { Request, Response } from 'express'
import { ProductRepository } from '@/repository'

@ApiController('/products', ['Product'])
export class ProductController {
  private productRepository: ProductRepository

  constructor() {
    this.productRepository = new ProductRepository()
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
      const products = await this.productRepository.findAll()
      return {
        success: true,
        message: 'Produtos listados com sucesso',
        data: products,
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao listar produtos',
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
      const product = await this.productRepository.findById(id)
      if (!product) {
        return {
          success: false,
          message: 'Produto não encontrado',
          data: null,
        }
      }
      return {
        success: true,
        message: 'Produto encontrado com sucesso',
        data: product,
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao buscar produto',
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }
}
