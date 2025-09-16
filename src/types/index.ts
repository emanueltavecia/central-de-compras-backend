import { FastifyRequest, FastifyReply } from 'fastify'

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export type RouteHandler<
  Params = unknown,
  Querystring = unknown,
  Body = unknown,
> = (
  request: FastifyRequest<{
    Params: Params
    Querystring: Querystring
    Body: Body
  }>,
  reply: FastifyReply,
) => Promise<void>

export interface ValidationError {
  field: string
  message: string
  value?: any
}
