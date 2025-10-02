import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'
import { UsersController } from '@/controllers'
import { registerController } from '@/decorators'
import { authMiddleware } from '@/middlewares'

export const usersRoutes: ExpressRouter = Router()

usersRoutes.use(authMiddleware)

export const usersSwaggerPaths = registerController(
  usersRoutes,
  UsersController,
)
