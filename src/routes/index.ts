import { Express } from 'express'
import { healthRoutes, healthSwaggerPaths } from './health.routes'
import { authRoutes, authSwaggerPaths } from './auth.routes'
import { campaignsRoutes, campaignsSwaggerPaths } from './campaigns.routes'
import { productRoutes, productSwaggerPaths } from './product.routes'
import {
  paymentConditionsRoutes,
  paymentConditionsSwaggerPaths,
} from './payment-conditions.routes'
import { contactsRoutes, contactsSwaggerPaths } from './contacts.routes'
import { usersRoutes, usersSwaggerPaths } from './users.routes'
import {
  organizationsRoutes,
  organizationsSwaggerPaths,
} from './organizations.routes'
import {
  organizationAddressesRoutes,
  organizationAddressesSwaggerPaths,
} from './organization-addresses.routes'
import {
  supplierStateConditionsRoutes,
  supplierStateConditionsSwaggerPaths,
} from './supplier-state-conditions.routes'

export function registerRoutes(app: Express) {
  app.use(healthRoutes)
  app.use(authRoutes)
  app.use(campaignsRoutes)
  app.use(productRoutes)
  app.use(paymentConditionsRoutes)
  app.use(contactsRoutes)
  app.use(usersRoutes)
  app.use(organizationsRoutes)
  app.use(organizationAddressesRoutes)
  app.use(supplierStateConditionsRoutes)
}

export const swaggerPaths = {
  health: healthSwaggerPaths,
  auth: authSwaggerPaths,
  campaigns: campaignsSwaggerPaths,
  product: productSwaggerPaths,
  paymentConditions: paymentConditionsSwaggerPaths,
  contacts: contactsSwaggerPaths,
  users: usersSwaggerPaths,
  organizations: organizationsSwaggerPaths,
  organizationAddresses: organizationAddressesSwaggerPaths,
  supplierStateConditions: supplierStateConditionsSwaggerPaths,
}
