import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'
import { SupplierStateConditionsController } from '@/controllers'
import { registerController } from '@/decorators'

export const supplierStateConditionsRoutes: ExpressRouter = Router()

export const supplierStateConditionsSwaggerPaths = registerController(
  supplierStateConditionsRoutes,
  SupplierStateConditionsController,
)
