import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'
import { OrganizationAddressesController } from '@/controllers/organization-addresses.controller'
import { registerController } from '@/decorators'

export const organizationAddressesRoutes: ExpressRouter = Router()

export const organizationAddressesSwaggerPaths = registerController(
  organizationAddressesRoutes,
  OrganizationAddressesController,
)
