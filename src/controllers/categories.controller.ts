import { Request, Response } from 'express'
import { ApiController, ApiRoute } from '@/decorators'
import { createErrorResponse, createSuccessResponse } from '@/utils'
import {
  CategorySchema,
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

  // ------------------------------------------------------------------
  // ROTA: POST /categories - Criar nova categoria
  // ------------------------------------------------------------------
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
  async createCategory(categoryData: CategorySchema, req: Request, res: Response) {
    try {
      // Remove campos read-only
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

  // ------------------------------------------------------------------
  // ROTA: GET /categories - Listar categorias com filtro (parentId)
  // ------------------------------------------------------------------
// ... (Método listCategories está correto)
  async listCategories(req: Request, res: Response) {
    try {
      const { parentId } = req.query as { parentId?: string }
      let filterParentId: string | null | undefined = parentId
      if (parentId === 'null') {
        filterParentId = null
      } else if (parentId === '') {
        filterParentId = undefined
      }
      const categories = await this.categoriesService.listCategories(filterParentId)

      return res
        .status(200)
        .json(createSuccessResponse('Categorias listadas com sucesso', categories))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  // ------------------------------------------------------------------
  // ROTA: GET /categories/:id - Obter por ID
  // ------------------------------------------------------------------
// ... (Método getCategoryById está correto)
  async getCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const category = await this.categoriesService.getCategoryById(id)

      return res
        .status(200)
        .json(createSuccessResponse('Categoria encontrada com sucesso', category))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  // ------------------------------------------------------------------
  // ROTA: PUT /categories/:id - Atualizar categoria
  // ------------------------------------------------------------------
// ... (Método updateCategory está correto)
  async updateCategory(
    categoryData: Partial<CategorySchema>,
    req: Request,
    res: Response,
  ) {
    try {
      const { id } = req.params
      const updated = await this.categoriesService.updateCategory(id, categoryData)

      return res
        .status(200)
        .json(createSuccessResponse('Categoria atualizada com sucesso', updated))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  // ------------------------------------------------------------------
  // ROTA: DELETE /categories/:id - Excluir categoria
  // ------------------------------------------------------------------
// ... (Método deleteCategory está correto)
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