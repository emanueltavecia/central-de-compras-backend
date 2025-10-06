import { Router, Router as ExpressRouter } from 'express'
import { registerController } from '@/decorators'
import { PaymentConditionsController } from '@/controllers'

export const paymentConditionsRoutes: ExpressRouter = Router()

export const paymentConditionsSwaggerPaths = registerController(
  paymentConditionsRoutes,
  PaymentConditionsController,
)
