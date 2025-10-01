
import { Express } from 'express'
import { healthRoutes, healthSwaggerPaths } from './health.routes'
import { authRoutes, authSwaggerPaths } from './auth.routes'
import { campaignsRoutes, campaignsSwaggerPaths } from './campaigns.routes'
import { productRoutes, productSwaggerPaths } from './product.routes'

export function registerRoutes(app: Express) {
  app.use(healthRoutes)
  app.use(authRoutes)
  app.use(campaignsRoutes)
  app.use(productRoutes)
}

export const swaggerPaths = {
  health: healthSwaggerPaths,
  auth: authSwaggerPaths,
  campaigns: campaignsSwaggerPaths,
  product: productSwaggerPaths,
}
