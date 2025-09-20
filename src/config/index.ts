import dotenv from 'dotenv'

dotenv.config()

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || 'localhost',
    environment: process.env.NODE_ENV || 'development',
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
