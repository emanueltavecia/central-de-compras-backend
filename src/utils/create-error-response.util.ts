import { ApiResponse } from '@/types'

export function createErrorResponse(
  message: string,
  error?: string,
): ApiResponse {
  return {
    success: false,
    message: message || 'Ocorreu um erro interno do servidor',
    error: error || 'INTERNAL_SERVER_ERROR',
  }
}
