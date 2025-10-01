import { Request } from 'express'

declare global {
  namespace Express {
    interface Request {
      validatedQuery?: any
      validatedParams?: any
    }
  }
}

export interface ValidatedRequest<TParams = any, TQuery = any> extends Request {
  validatedParams?: TParams
  validatedQuery?: TQuery
}
