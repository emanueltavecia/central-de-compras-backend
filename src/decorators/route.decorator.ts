import { Request, Response } from 'express'
import type { Router as ExpressRouter } from 'express'
import { createSchemaFromClass } from '@/utils/schema.utils'

export function ApiRoute(config: {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch'
  path: string
  summary: string
  tags?: string[]
  responses?: Record<number, new () => any>
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
    const fullPath = controllerMeta.prefix + route.path
    const handler = route.handler.bind(controller)

    const routerMethod = router[route.method as keyof ExpressRouter] as (
      path: string,
      handler: (req: Request, res: Response) => void,
    ) => void
    routerMethod.call(router, fullPath, async (req: Request, res: Response) => {
      try {
        const result = await handler(req, res)
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
    })

    if (!swaggerPaths[fullPath]) {
      swaggerPaths[fullPath] = {}
    }

    swaggerPaths[fullPath][route.method] = {
      tags: route.tags || controllerMeta.tags || [],
      summary: route.summary,
      responses: {},
    }

    if (route.responses) {
      Object.entries(route.responses).forEach(([status, SchemaClass]) => {
        const schema = createSchemaFromClass(SchemaClass as new () => any, true)
        swaggerPaths[fullPath][route.method].responses[status] = {
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
    paths: allPaths,
  }
}
