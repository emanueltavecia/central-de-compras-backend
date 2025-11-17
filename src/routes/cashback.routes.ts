import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'
import { CashbackController } from '@/controllers'
import { registerController } from '@/decorators'

export const cashbackRoutes: ExpressRouter = Router()

export const cashbackSwaggerPaths = registerController(
  cashbackRoutes,
  CashbackController,
)
