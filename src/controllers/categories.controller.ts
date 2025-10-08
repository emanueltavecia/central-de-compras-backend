import { Request, Response } from 'express'
import { ApiController, ApiRoute } from '@/decorators'
import { createErrorResponse, createSuccessResponse } from '@/utils'
import {
  CategorySchema,
  CategoryFiltersSchema,
  ErrorResponseSchema,
  SuccessResponseSchema,
  IdParamSchema,
} from '@/schemas'
import { CategoriesService } from '@/services/categories.service'

@ApiController('/categories', ['Categories'])
export class CategoriesController {
  private categoriesService: CategoriesService

  constructor() {
    this.categoriesService = new CategoriesService()
  }

  @ApiRoute({
    method: 'post',
    path: '/',
    summary: 'Criar nova categoria',
    body: CategorySchema,
    responses: {
      201: SuccessResponseSchema.create({
        schema: CategorySchema,
        dataDescription: 'Dados da categoria criada',
        message: 'Categoria criada com sucesso',
      }),
      400: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async createCategory(
    categoryData: CategorySchema,
    req: Request,
    res: Response,
  ) {
    try {
      const { id: _id, createdAt: _createdAt, ...dataToCreate } = categoryData
      const createdCategory = await this.categoriesService.createCategory(
        dataToCreate as Omit<CategorySchema, 'id' | 'createdAt'>,
      )

      return res
        .status(201)
        .json(
          createSuccessResponse(
            'Categoria criada com sucesso',
            createdCategory,
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
    summary: 'Listar categorias',
    query: CategoryFiltersSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: CategorySchema,
        isArray: true,
        dataDescription: 'Lista de categorias',
        message: 'Categorias listadas com sucesso',
      }),
      400: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async listCategories(req: Request, res: Response) {
    try {
      const filters = req.query as CategoryFiltersSchema
      const categories = await this.categoriesService.listCategories(filters)

      return res
        .status(200)
        .json(
          createSuccessResponse('Categorias listadas com sucesso', categories),
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
    summary: 'Buscar categoria por ID',
    params: IdParamSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: CategorySchema,
        dataDescription: 'Dados da categoria',
        message: 'Categoria encontrada com sucesso',
      }),
      400: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async getCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const category = await this.categoriesService.getCategoryById(id)

      return res
        .status(200)
        .json(
          createSuccessResponse('Categoria encontrada com sucesso', category),
        )
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'put',
    path: '/:id',
    summary: 'Atualizar categoria',
    params: IdParamSchema,
    body: CategorySchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: CategorySchema,
        dataDescription: 'Dados da categoria atualizada',
        message: 'Categoria atualizada com sucesso',
      }),
      400: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async updateCategory(
    categoryData: CategorySchema,
    req: Request,
    res: Response,
  ) {
    try {
      const { id } = req.params
      const { id: _id, createdAt: _createdAt, ...dataToUpdate } = categoryData

      const updated = await this.categoriesService.updateCategory(
        id,
        dataToUpdate,
      )

      return res
        .status(200)
        .json(
          createSuccessResponse('Categoria atualizada com sucesso', updated),
        )
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'delete',
    path: '/:id',
    summary: 'Excluir categoria',
    params: IdParamSchema,
    responses: {
      200: SuccessResponseSchema.create({
        dataDescription: 'Confirmação de exclusão',
        message: 'Categoria excluída com sucesso',
      }),
      400: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params
      await this.categoriesService.deleteCategory(id)

      return res
        .status(200)
        .json(createSuccessResponse('Categoria excluída com sucesso', null))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }
}
