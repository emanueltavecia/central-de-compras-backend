import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'
import { AuthController } from '@/controllers'
import { registerController } from '@/decorators'

export const authRoutes: ExpressRouter = Router()

export const authSwaggerPaths = registerController(authRoutes, AuthController)
