import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'
import { registerController } from '@/decorators'
import { ChangeRequestsController } from '@/controllers'

export const changeRequestsRoutes: ExpressRouter = Router()

export const changeRequestsSwaggerPaths = registerController(
  changeRequestsRoutes,
  ChangeRequestsController,
)
