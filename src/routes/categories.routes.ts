import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'
import { registerController } from '@/decorators'
import { CategoriesController } from '@/controllers'

export const categoriesRoutes: ExpressRouter = Router()

export const categoriesSwaggerPaths = registerController(
  categoriesRoutes,
  CategoriesController,
)
