import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'
import { OrganizationsController } from '@/controllers'
import { registerController } from '@/decorators'

export const organizationsRoutes: ExpressRouter = Router()

export const organizationsSwaggerPaths = registerController(
  organizationsRoutes,
  OrganizationsController,
)
