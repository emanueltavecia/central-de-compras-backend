import { getApiPropertyMetadata, ApiPropertyOptions } from '@/decorators'

export interface JSONSchemaProperty {
  type: string
  description?: string
  format?: string
  enum?: readonly (string | number)[] | Record<string, string | number>
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  properties?: Record<string, JSONSchemaProperty>
  items?: JSONSchemaProperty & { required?: string[] }
  readOnly?: boolean
  writeOnly?: boolean
}

export interface SwaggerSchemaProperty extends JSONSchemaProperty {
  example?: any
  required?: string[]
}

export interface SwaggerSchema {
  type: 'object'
  properties: Record<string, SwaggerSchemaProperty>
  required?: string[]
}

function getPropertyType(target: any, propertyKey: string | symbol): string {
  const type = Reflect.getMetadata('design:type', target, propertyKey)

  if (type === String) return 'string'
  if (type === Number) return 'number'
  if (type === Boolean) return 'boolean'
  if (type === Array) return 'array'
  if (type === Object) return 'object'
  if (type === Date) return 'string'

  return 'string'
}

export function createSchemaFromClass(
  ClassConstructor: new () => any,
  includeExamples: boolean = true,
): SwaggerSchema {
  const instance = new ClassConstructor()
  const metadata = getApiPropertyMetadata(instance)

  const properties: Record<string, SwaggerSchemaProperty> = {}
  const required: string[] = []

  Object.keys(metadata).forEach((propertyKey) => {
    const options: ApiPropertyOptions = metadata[propertyKey]
    const propertyType = options.type || getPropertyType(instance, propertyKey)

    const {
      required: isRequired,
      example,
      schema,
      ...validationOptions
    } = options

    const property: SwaggerSchemaProperty = {
      type: propertyType,
      ...validationOptions,
    }

    if (
      property.enum &&
      typeof property.enum === 'object' &&
      !Array.isArray(property.enum)
    ) {
      property.enum = Object.values(property.enum)
    }

    if (includeExamples && example !== undefined) {
      property.example = example
    }

    if (propertyType === 'array' && schema) {
      const nestedSchema = createSchemaFromClass(schema, includeExamples)
      property.items = {
        type: 'object',
        properties: nestedSchema.properties,
        required: nestedSchema.required,
      }
    } else if (propertyType === 'object' && schema) {
      const nestedSchema = createSchemaFromClass(schema, includeExamples)
      property.properties = nestedSchema.properties
      if (nestedSchema.required) {
        property.required = nestedSchema.required
      }
    } else if (
      propertyType === 'object' &&
      example &&
      typeof example === 'object'
    ) {
      const exampleProperties: Record<string, SwaggerSchemaProperty> = {}
      Object.keys(example).forEach((key) => {
        const value = example[key]
        const valueType = typeof value
        const prop: SwaggerSchemaProperty = {
          type:
            valueType === 'object' && value instanceof Date
              ? 'string'
              : valueType,
        }
        if (includeExamples) {
          prop.example = value
        }
        exampleProperties[key] = prop
      })
      property.properties = exampleProperties
    }

    properties[propertyKey] = property

    if (isRequired !== false) {
      required.push(propertyKey)
    }
  })

  return {
    type: 'object',
    properties,
    required: required.length > 0 ? required : undefined,
  }
}
