import { Router, Router as ExpressRouter } from 'express'
import { registerController } from '@/decorators'
import { PaymentConditionsController } from '@/controllers/payment-conditions.controller'

export const paymentConditionsRoutes: ExpressRouter = Router()

export const paymentConditionsSwaggerPaths = registerController(
  paymentConditionsRoutes,
  PaymentConditionsController,
)



