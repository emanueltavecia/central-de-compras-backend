import { Request, Response } from 'express'

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
  request: Request<Params, any, Body, Querystring>,
  response: Response,
) => Promise<void>

export interface ValidationError {
  field: string
  message: string
  value?: any
}

export type Enum =
  | readonly (string | number)[]
  | Record<string, string | number>
