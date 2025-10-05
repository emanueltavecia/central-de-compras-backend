import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'
import { UsersController } from '@/controllers'
import { registerController } from '@/decorators'

export const usersRoutes: ExpressRouter = Router()

export const usersSwaggerPaths = registerController(
  usersRoutes,
  UsersController,
)
