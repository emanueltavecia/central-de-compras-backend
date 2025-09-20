import { ApiResponse } from '@/types'

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
