import { Router, Router as ExpressRouter } from 'express'
import { registerController } from '@/decorators'
import { ProductController } from '@/controllers/product.controller'

export const productRoutes: ExpressRouter = Router()

export const productSwaggerPaths = registerController(productRoutes, ProductController)
