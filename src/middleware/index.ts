import { FastifyRequest, FastifyReply } from 'fastify'
import { createErrorResponse } from '@/utils'

export async function requestLogger(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const start = Date.now()

  request.log.info(
    {
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
    },
    'Request received',
  )

  const originalSend = reply.send.bind(reply)
  reply.send = function (payload: any) {
    const duration = Date.now() - start
    request.log.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        duration,
      },
      'Request completed',
    )
    return originalSend(payload)
  }
}

export async function validateJsonContentType(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentType = request.headers['content-type']
    if (!contentType || !contentType.includes('application/json')) {
      return reply
        .status(400)
        .send(
          createErrorResponse(
            'Content-Type must be application/json',
            'INVALID_CONTENT_TYPE',
          ),
        )
    }
  }
}

export async function errorHandler(
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  request.log.error(error)

  const statusCode = reply.statusCode >= 400 ? reply.statusCode : 500

  reply
    .status(statusCode)
    .send(
      createErrorResponse(error.message || 'Internal Server Error', error.name),
    )
}
