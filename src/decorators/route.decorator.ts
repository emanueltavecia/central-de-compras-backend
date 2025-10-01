import { Request, Response } from 'express'
import type { Router as ExpressRouter } from 'express'
import { createSchemaFromClass } from '@/utils'
import {
  validationMiddleware,
  queryValidationMiddleware,
  paramsValidationMiddleware,
  authMiddleware,
  requirePermission,
} from '@/middlewares'
import { PermissionName } from '@/enums'
import { plainToClass } from 'class-transformer'
import { isUUID } from 'class-validator'

export function ApiRoute(config: {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch'
  path: string
  summary: string
  tags?: string[]
  body?: new () => any
  query?: new () => any
  params?: new () => any
  responses?: Record<number, new () => any>
  permissions?: PermissionName[]
  isPublic?: boolean
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const existingRoutes =
      Reflect.getMetadata('api:routes', target.constructor) || []
    existingRoutes.push({
      ...config,
      handler: descriptor.value,
      propertyKey,
    })
    Reflect.defineMetadata('api:routes', existingRoutes, target.constructor)
  }
}

export function ApiController(prefix: string = '', tags: string[] = []) {
  return function (constructor: new (...args: any[]) => any) {
    Reflect.defineMetadata('api:controller', { prefix, tags }, constructor)
  }
}

export function registerController(
  router: ExpressRouter,
  ControllerClass: new () => any,
) {
  const controller = new ControllerClass()
  const controllerMeta =
    Reflect.getMetadata('api:controller', ControllerClass) || {}
  const routes = Reflect.getMetadata('api:routes', ControllerClass) || []

  const swaggerPaths: any = {}

  routes.forEach((route: any) => {
    const fullPath =
      controllerMeta.prefix + (route.path === '/' ? '' : route.path)
    const handler = route.handler.bind(controller)

    const routerMethod = router[route.method as keyof ExpressRouter] as (
      path: string,
      ...handlers: any[]
    ) => void

    const middlewares = []

    const isPublic = route.isPublic ?? false
    const permissions = route.permissions ?? []

    if (!isPublic) {
      middlewares.push(authMiddleware)

      if (permissions.length > 0) {
        permissions.forEach((permission: PermissionName) => {
          middlewares.push(requirePermission(permission))
        })
      }
    }

    if (route.body) {
      middlewares.push(validationMiddleware(route.body))
    }

    if (route.query) {
      middlewares.push(queryValidationMiddleware(route.query))
    }

    if (route.params) {
      middlewares.push(paramsValidationMiddleware(route.params))
    }

    routerMethod.call(
      router,
      fullPath,
      ...middlewares,
      async (req: Request, res: Response) => {
        try {
          let result
          const parsedQuery = plainToClass(route.query, req.query || {})
          if (
            route.method === 'post' ||
            route.method === 'put' ||
            route.method === 'patch'
          ) {
            result = await handler(
              req.body,
              { ...req, query: parsedQuery },
              res,
            )
          } else {
            result = await handler({ ...req, query: parsedQuery }, res)
          }
          if (result && !res.headersSent) {
            res.json(result)
          }
        } catch (error) {
          if (!res.headersSent) {
            const err = error as Error
            res.status(500).json({
              success: false,
              message: err.message || 'Internal Server Error',
              error: err.name,
            })
          }
        }
      },
    )

    const swaggerPath = fullPath.replace(/:([^/]+)/g, '{$1}')

    if (!swaggerPaths[swaggerPath]) {
      swaggerPaths[swaggerPath] = {}
    }

    swaggerPaths[swaggerPath][route.method] = {
      tags: route.tags || controllerMeta.tags || [],
      summary: route.summary,
      security: !isPublic ? [{ bearerAuth: [] }] : [],
      parameters: [],
      requestBody: route.body
        ? {
            required: true,
            content: {
              'application/json': {
                schema: createSchemaFromClass(route.body, true),
              },
            },
          }
        : undefined,
      responses: {},
    }

    if (route.params) {
      const paramSchema = createSchemaFromClass(route.params, true)
      if (paramSchema.properties) {
        Object.entries(paramSchema.properties).forEach(
          ([paramName, paramDef]: [string, any]) => {
            const isUuid =
              paramName === 'id' ||
              (paramDef.description && paramDef.description.includes('UUID')) ||
              (paramDef.example &&
                typeof paramDef.example === 'string' &&
                isUUID(paramDef.example))

            swaggerPaths[swaggerPath][route.method].parameters.push({
              name: paramName,
              in: 'path',
              required: true,
              description: paramDef.description || `Parâmetro ${paramName}`,
              schema: {
                type: paramDef.type || 'string',
                format: isUuid ? 'uuid' : paramDef.format,
                example: paramDef.example,
                pattern: isUuid
                  ? '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
                  : paramDef.pattern,
              },
              example:
                paramDef.example ||
                (paramName === 'id'
                  ? '123e4567-e89b-12d3-a456-426614174000'
                  : undefined),
            })
          },
        )
      }
    }

    if (route.query) {
      const querySchema = createSchemaFromClass(route.query, true)
      if (querySchema.properties) {
        Object.entries(querySchema.properties).forEach(
          ([queryName, queryDef]: [string, any]) => {
            const isRequired =
              querySchema.required && querySchema.required.includes(queryName)
            swaggerPaths[swaggerPath][route.method].parameters.push({
              name: queryName,
              in: 'query',
              required: isRequired || false,
              description:
                queryDef.description || `Parâmetro de consulta ${queryName}`,
              schema: {
                type: queryDef.type || 'string',
                format: queryDef.format,
                example: queryDef.example,
                enum: queryDef.enum,
              },
            })
          },
        )
      }
    }

    if (route.responses) {
      Object.entries(route.responses).forEach(([status, SchemaClass]) => {
        const schema = createSchemaFromClass(SchemaClass as new () => any, true)
        swaggerPaths[swaggerPath][route.method].responses[status] = {
          description:
            status === '200'
              ? 'Success'
              : status === '400'
                ? 'Bad Request'
                : status === '500'
                  ? 'Internal Server Error'
                  : 'Response',
          content: {
            'application/json': {
              schema,
            },
          },
        }
      })
    }
  })

  return swaggerPaths
}

export function generateSwaggerSpec(routers: { [key: string]: any }) {
  let allPaths = {}

  Object.values(routers).forEach((routerPaths) => {
    allPaths = { ...allPaths, ...routerPaths }
  })

  return {
    openapi: '3.0.0',
    info: {
      title: 'Interdisciplinar API',
      description: 'API documentation generated from decorators',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Digite o token JWT de autenticação',
        },
      },
      schemas: {},
    },
    paths: allPaths,
  }
}
