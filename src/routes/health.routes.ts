import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'
import { HealthController } from '@/controllers'
import { registerController } from '@/decorators'

export const healthRoutes: ExpressRouter = Router()

export const healthSwaggerPaths = registerController(
  healthRoutes,
  HealthController,
)
