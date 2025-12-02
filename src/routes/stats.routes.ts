import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'
import { StatsController } from '@/controllers'
import { registerController } from '@/decorators'

export const statsRoutes: ExpressRouter = Router()

export const statsSwaggerPaths = registerController(
  statsRoutes,
  StatsController,
)
