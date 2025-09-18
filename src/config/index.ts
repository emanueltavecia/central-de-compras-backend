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
