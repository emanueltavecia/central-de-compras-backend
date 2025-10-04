import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'

import { config } from '@/config'
import { registerRoutes, swaggerPaths } from '@/routes'
import { generateSwaggerSpec } from '@/decorators'
import { database } from '@/database/connection'

export async function createApp(): Promise<Express> {
  const app: Express = express()

  const isDbConnected = await database.testConnection()
  if (!isDbConnected) {
    console.warn('Database connection failed, but server will continue')
  }

  app.use(helmet())

  app.use(cors(config.cors))

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  registerRoutes(app)

  const swaggerSpec = generateSwaggerSpec(swaggerPaths)
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

  app.use((error: Error, request: Request, response: Response) => {
    console.error(error)

    const statusCode = response.statusCode >= 400 ? response.statusCode : 500

    response.status(statusCode).json({
      success: false,
      message: error.message || 'Internal Server Error',
      error: error.name,
    })
  })

  return app
}

export { config }
