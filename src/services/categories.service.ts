
import { CategoryRepository } from '@/repository' 
import { CategorySchema, CategoryFiltersSchema } from '@/schemas'
import { HttpError } from '@/utils'

export class CategoriesService {
  private categoryRepository: CategoryRepository

  constructor() {
    this.categoryRepository = new CategoryRepository()
  }

  private removeReadOnlyFields(data: Partial<CategorySchema>): Partial<Omit<CategorySchema, 'id' | 'createdAt'>> {
    const { id: _id, createdAt: _createdAt, ...cleanData } = data
    return cleanData
  }

  // --- READ (Listar) ---
  async listCategories(
    filters: CategoryFiltersSchema = {},
  ): Promise<CategorySchema[]> {
    try {
      return await this.categoryRepository.findAll(filters)
    } catch (error) {
      console.error('Error listing categories:', error)
      throw new HttpError('Erro ao buscar categorias', 500, 'CATEGORIES_GET_ERROR')
    }
  }

  // --- READ (Por ID) ---
  async getCategoryById(id: string): Promise<CategorySchema> {
    try {
      const category = await this.categoryRepository.findById(id)

      if (!category) {
        throw new HttpError('Categoria não encontrada', 404, 'CATEGORY_NOT_FOUND')
      }

      return category
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error getting category by id:', error)
      throw new HttpError('Erro ao buscar categoria', 500, 'CATEGORY_GET_ERROR')
    }
  }

  // --- CREATE ---
  async createCategory(
    categoryData: Omit<CategorySchema, 'id' | 'createdAt'>,
  ): Promise<CategorySchema> {
    try {
      const cleanData = this.removeReadOnlyFields(categoryData as CategorySchema)
      
      return await this.categoryRepository.create(
        cleanData as Omit<CategorySchema, 'id' | 'createdAt'>,
      )
    } catch (error) {
      console.error('Error creating category:', error)
      throw new HttpError('Erro ao criar categoria', 500, 'CATEGORY_CREATE_ERROR')
    }
  }

  // --- UPDATE ---
  async updateCategory(
    id: string,
    categoryData: Partial<Omit<CategorySchema, 'id' | 'createdAt'>>,
  ): Promise<CategorySchema> {
    try {
      const existingCategory = await this.categoryRepository.findById(id)

      if (!existingCategory) {
        throw new HttpError('Categoria não encontrada', 404, 'CATEGORY_NOT_FOUND')
      }

      const cleanData = this.removeReadOnlyFields(categoryData as CategorySchema)

      const updatedCategory = await this.categoryRepository.update(id, cleanData)

      if (!updatedCategory) {
        throw new HttpError(
          'Erro ao atualizar categoria',
          500,
          'CATEGORY_UPDATE_ERROR',
        )
      }

      return updatedCategory
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error updating category:', error)
      throw new HttpError(
        'Erro ao atualizar categoria',
        500,
        'CATEGORY_UPDATE_ERROR',
      )
    }
  }

  // --- DELETE ---
  async deleteCategory(id: string): Promise<void> {
    try {
      const deleted = await this.categoryRepository.delete(id)
      if (!deleted) {
        throw new HttpError('Categoria não encontrada', 404, 'CATEGORY_NOT_FOUND')
      }
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error deleting category:', error)
      throw new HttpError(
        'Erro ao deletar categoria',
        500,
        'CATEGORY_DELETE_ERROR',
      )
    }
  }
}