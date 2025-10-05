import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'
import { OrdersController } from '@/controllers'
import { registerController } from '@/decorators'

export const ordersRoutes: ExpressRouter = Router()

export const ordersSwaggerPaths = registerController(
  ordersRoutes,
  OrdersController,
)
