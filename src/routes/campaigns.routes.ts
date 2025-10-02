import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'
import { CampaignsController } from '@/controllers'
import { registerController } from '@/decorators'

export const campaignsRoutes: ExpressRouter = Router()

export const campaignsSwaggerPaths = registerController(
  campaignsRoutes,
  CampaignsController,
)
