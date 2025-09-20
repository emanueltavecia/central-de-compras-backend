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
