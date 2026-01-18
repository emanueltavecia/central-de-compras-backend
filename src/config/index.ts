import dotenv from 'dotenv'
import { SignOptions } from 'jsonwebtoken'
import path from 'path'

dotenv.config()

const isProduction = process.env.NODE_ENV === 'production'
const isVercel = process.env.VERCEL === '1'

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || 'localhost',
    environment: process.env.NODE_ENV || 'development',
  },
  uploads: {
    baseDir:
      isProduction || isVercel
        ? path.join('/tmp', 'uploads')
        : path.join(process.cwd(), 'uploads'),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'admin',
    name: process.env.DB_NAME || 'central-de-compras-db',
    url:
      process.env.DATABASE_URL ||
      'postgresql://postgres:admin@localhost:5432/central-de-compras-db',
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'JWT_SECRET',
    expiresIn: (process.env.JWT_EXPIRES_IN ||
      '24h') as SignOptions['expiresIn'],
  },
  swagger: {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Interdisciplinar API',
        description: 'API documentation for Interdisciplinar project',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || '3000'}`,
          description: 'Development server',
        },
      ],
    },
    apis: ['./src/routes/*.ts'],
  },
}
