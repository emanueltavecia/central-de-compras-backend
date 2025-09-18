import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'
import { HealthController } from '@/controllers/health.controller'
import { registerController } from '@/decorators/route.decorator'

export const healthRoutes: ExpressRouter = Router()

export const healthSwaggerPaths = registerController(
  healthRoutes,
  HealthController,
)
