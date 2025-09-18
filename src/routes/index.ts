import { Express } from 'express'
import { healthRoutes, healthSwaggerPaths } from './health.routes'

export function registerRoutes(app: Express) {
  app.use(healthRoutes)
}

export const swaggerPaths = {
  health: healthSwaggerPaths,
}
