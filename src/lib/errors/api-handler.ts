import { NextResponse } from 'next/server';
import { handleError, NormalizedError } from './handle-error';
import { logger } from '@/lib/logger';

/**
 * Higher‑order wrapper for Next.js route handlers.
 * The handler may return a plain object (which will be wrapped in the
 * standardized success JSON) or a native Response (e.g., streaming).
 */
export function apiHandler<
  T = any,
  Q = unknown
>(handler: (request: Q) => Promise<T | Response>) {
  return async (request: Q) => {
    try {
      const result = await handler(request);
      // If the handler already produced a Response (e.g., streaming), forward it.
      if (result instanceof Response) {
        logger.info('API streaming response', { path: (request as any).url });
        return result;
      }
      const response = {
        success: true,
        data: result,
      } as const;
      logger.info('API success', { path: (request as any).url, result });
      return NextResponse.json(response);
    } catch (err) {
      const normalized: NormalizedError = handleError(err);
      const errorResponse = {
        success: false,
        error: {
          code: normalized.code,
          message: normalized.message,
          ...(normalized.details ? { details: normalized.details } : {}),
        },
      } as const;
      logger.error('API error', { path: (request as any).url, error: normalized });
      return NextResponse.json(errorResponse, { status: normalized.statusCode });
    }
  };
}
