import 'reflect-metadata'
import { config } from './config'
import express, { Express, Request, Response } from 'express'
import path from 'path'
import fs from 'fs'
import cors from 'cors'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'

import { registerRoutes, swaggerPaths } from '@/routes'
import { generateSwaggerSpec } from '@/decorators'
import { database } from '@/database/connection'
import { SWAGGER_HTML } from './utils/swagger-html'

const app: Express = express()

const isDbConnected = await database.testConnection()
if (!isDbConnected) {
  console.warn('Database connection failed, but server will continue')
}

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  }),
)

app.use(cors(config.cors))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const uploadsBase = path.join(process.cwd(), 'uploads')
fs.mkdirSync(path.join(uploadsBase, 'profile'), { recursive: true })
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    res.setHeader('Access-Control-Allow-Origin', config.cors.origin as string)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    next()
  },
  express.static(uploadsBase),
)

registerRoutes(app)

const swaggerSpec = generateSwaggerSpec(swaggerPaths)

app.get('/docs/swagger.json', (req, res) => {
  res.json(swaggerSpec)
})

app.get('/docs', (req, res) => {
  res.send(SWAGGER_HTML)
})

app.listen(config.server.port, config.server.host, () => {
  console.log(
    `Servidor rodando em http://${config.server.host}:${config.server.port}`,
  )
  console.log(
    `Documentação disponível em http://${config.server.host}:${config.server.port}/docs`,
  )
})

export default app
