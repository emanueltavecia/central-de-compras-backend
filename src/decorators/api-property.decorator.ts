import { Enum } from '@/types'
import 'reflect-metadata'

export type ApiPropertyType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'array'
  | 'object'

export interface SchemaType {
  new (...args: any[]): any
}

export interface ApiPropertyOptions {
  description?: string
  example?: any
  required?: boolean
  type?: ApiPropertyType
  format?: string
  enum?: Enum
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  schema?: SchemaType
  readOnly?: boolean
  writeOnly?: boolean
}

export interface ApiResponseOptions {
  status: number
  description?: string
  type?: new () => any
  isArray?: boolean
}

const API_PROPERTY_METADATA_KEY = Symbol('ApiProperty')
const API_RESPONSE_METADATA_KEY = Symbol('ApiResponse')

export function ApiProperty(
  options: ApiPropertyOptions = {},
): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const existingMetadata =
      Reflect.getMetadata(API_PROPERTY_METADATA_KEY, target) || {}
    existingMetadata[propertyKey] = options
    Reflect.defineMetadata(API_PROPERTY_METADATA_KEY, existingMetadata, target)
  }
}

export function ApiResponse(options: ApiResponseOptions): ClassDecorator {
  return (target: any) => {
    const existingMetadata =
      Reflect.getMetadata(API_RESPONSE_METADATA_KEY, target) || []
    existingMetadata.push(options)
    Reflect.defineMetadata(API_RESPONSE_METADATA_KEY, existingMetadata, target)
  }
}

export function getApiPropertyMetadata(
  target: any,
): Record<string | symbol, ApiPropertyOptions> {
  return Reflect.getMetadata(API_PROPERTY_METADATA_KEY, target) || {}
}

export function getApiResponseMetadata(target: any): ApiResponseOptions[] {
  return Reflect.getMetadata(API_RESPONSE_METADATA_KEY, target) || []
}
