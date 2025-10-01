import { ApiController, ApiRoute } from '@/decorators'
import {
  ProductSchema,
  ErrorResponseSchema,
  SuccessResponseSchema,
  UpdateProductStatusSchema,
  IdParamSchema,
  ProductFiltersSchema,
} from '@/schemas'
import { createSuccessResponse, createErrorResponse } from '@/utils'
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
  async createProduct(productData: ProductSchema, req: Request, res: Response) {
    try {
      const createdProduct =
        await this.productService.createProduct(productData)

      return res
        .status(201)
        .json(
          createSuccessResponse(
            'Produto cadastrado com sucesso',
            createdProduct,
          ),
        )
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }
  @ApiRoute({
    method: 'get',
    path: '/',
    summary: 'Lista todos os produtos',
    query: ProductFiltersSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: ProductSchema,
        dataDescription: 'Lista de produtos',
        isArray: true,
        message: 'Produtos listados com sucesso',
      }),
      400: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async listProducts(req: Request, res: Response) {
    try {
      const filters = req.query as ProductFiltersSchema
      const products = await this.productService.listProducts(filters)

      return res
        .status(200)
        .json(createSuccessResponse('Produtos listados com sucesso', products))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }
  @ApiRoute({
    method: 'put',
    path: '/:id',
    summary: 'Edita um produto existente',
    params: IdParamSchema,
    body: ProductSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: ProductSchema,
        dataDescription: 'Produto atualizado',
        message: 'Produto atualizado com sucesso',
      }),
      400: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async updateProduct(
    productData: Partial<ProductSchema>,
    req: Request,
    res: Response,
  ) {
    try {
      const { id } = req.params
      const updated = await this.productService.updateProduct(id, productData)

      return res
        .status(200)
        .json(createSuccessResponse('Produto atualizado com sucesso', updated))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'patch',
    path: '/:id/status',
    summary: 'Atualiza o status (ativo/inativo) do produto',
    params: IdParamSchema,
    body: UpdateProductStatusSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: ProductSchema,
        dataDescription: 'Status atualizado',
        message: 'Status do produto atualizado com sucesso',
      }),
      400: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async updateProductStatus(
    statusData: UpdateProductStatusSchema,
    req: Request,
    res: Response,
  ) {
    try {
      const { id } = req.params
      const updated = await this.productService.updateProductStatus(
        id,
        statusData,
      )

      return res
        .status(200)
        .json(
          createSuccessResponse(
            'Status do produto atualizado com sucesso',
            updated,
          ),
        )
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'get',
    path: '/:id',
    summary: 'Obtém um produto pelo ID',
    params: IdParamSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: ProductSchema,
        dataDescription: 'Produto encontrado',
        message: 'Produto encontrado com sucesso',
      }),
      400: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const product = await this.productService.getProductById(id)

      return res
        .status(200)
        .json(createSuccessResponse('Produto encontrado com sucesso', product))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }
}
