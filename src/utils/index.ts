import { ApiResponse } from '@/types'

export function createSuccessResponse<T>(
  message: string,
  data?: T,
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
  }
}

export function createErrorResponse(
  message: string,
  error?: string,
): ApiResponse {
  return {
    success: false,
    message,
    error,
  }
}

export * from './schema.utils'
