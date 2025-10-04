import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'
import { ContactsController } from '@/controllers'
import { registerController } from '@/decorators'

export const contactsRoutes: ExpressRouter = Router()

export const contactsSwaggerPaths = registerController(contactsRoutes, ContactsController)
