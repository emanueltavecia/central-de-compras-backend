import { Express } from 'express'
import { healthRoutes, healthSwaggerPaths } from './health.routes'
import { authRoutes, authSwaggerPaths } from './auth.routes'
import { usersRoutes, usersSwaggerPaths } from './users.routes'
import { organizationsRoutes, organizationsSwaggerPaths } from './organizations.routes'
import { supplierStateConditionsRoutes, supplierStateConditionsSwaggerPaths } from './supplier-state-conditions.routes'

export function registerRoutes(app: Express) {
  app.use(healthRoutes)
  app.use(authRoutes)
  app.use('/api', usersRoutes)
  app.use('/api', organizationsRoutes)
  app.use('/api', supplierStateConditionsRoutes)
}

export const swaggerPaths = {
  health: healthSwaggerPaths,
  auth: authSwaggerPaths,
  users: usersSwaggerPaths,
  organizations: organizationsSwaggerPaths,
  supplierStateConditions: supplierStateConditionsSwaggerPaths,
}
