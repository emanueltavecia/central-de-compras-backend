import { Express } from 'express'
import { healthRoutes, healthSwaggerPaths } from './health.routes'
import { authRoutes, authSwaggerPaths } from './auth.routes'
import { campaignsRoutes, campaignsSwaggerPaths } from './campaigns.routes'
import { productRoutes, productSwaggerPaths } from './product.routes'
import { paymentConditionsRoutes, paymentConditionsSwaggerPaths } from './payment-conditions.routes'
import { contactsRoutes, contactsSwaggerPaths } from './contacts.routes'

export function registerRoutes(app: Express) {
  app.use(healthRoutes)
  app.use(authRoutes)
  app.use(campaignsRoutes)
  app.use(productRoutes)
  app.use(paymentConditionsRoutes)
  app.use(contactsRoutes)
}

export const swaggerPaths = {
  health: healthSwaggerPaths,
  auth: authSwaggerPaths,
  campaigns: campaignsSwaggerPaths,
  product: productSwaggerPaths,
  paymentConditions: paymentConditionsSwaggerPaths,
  contacts: contactsSwaggerPaths,
}
