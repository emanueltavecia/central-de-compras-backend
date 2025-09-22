import { Express } from 'express'
import { healthRoutes, healthSwaggerPaths } from './health.routes'
import { authRoutes, authSwaggerPaths } from './auth.routes'

export function registerRoutes(app: Express) {
  app.use(healthRoutes)
  app.use(authRoutes)
}

export const swaggerPaths = {
  health: healthSwaggerPaths,
  auth: authSwaggerPaths,
}
