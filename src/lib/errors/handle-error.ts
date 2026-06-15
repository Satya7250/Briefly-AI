import { logger } from '@/lib/logger';
import { AppError } from '@/lib/errors/app-error';
import { ErrorCodes } from '@/lib/errors/error-codes';

export interface NormalizedError {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Convert any thrown error into a NormalizedError.
 * In production we hide internal details for generic errors.
 */
export function handleError(err: unknown, isProd: boolean = process.env.NODE_ENV === 'production'): NormalizedError {
  if (err instanceof AppError) {
    logger.error('AppError caught', { code: err.code, message: err.message, details: err.details });
    return {
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
      details: isProd ? undefined : err.details,
    };
  }

  // Unknown error - log full stack in dev, hide in prod
  logger.error('Unexpected error', { err: err as any });
  const genericMessage = isProd ? 'Internal Server Error' : (err instanceof Error ? err.message : String(err));
  return {
    statusCode: 500,
    code: ErrorCodes.INTERNAL_SERVER_ERROR,
    message: genericMessage,
    details: isProd ? undefined : err,
  };
}
