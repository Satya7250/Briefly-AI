import { AppError } from './app-error';
import { ErrorCodes } from './error-codes';

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details?: unknown) {
    super(message, 401, ErrorCodes.UNAUTHORIZED, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details?: unknown) {
    super(message, 403, ErrorCodes.FORBIDDEN, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation Error', details?: unknown) {
    super(message, 400, ErrorCodes.VALIDATION_ERROR, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found', details?: unknown) {
    super(message, 404, ErrorCodes.NOT_FOUND, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', details?: unknown) {
    super(message, 409, ErrorCodes.CONFLICT, details);
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database Error', details?: unknown) {
    super(message, 500, ErrorCodes.DATABASE_ERROR, details);
  }
}

export class OpenAIError extends AppError {
  constructor(message = 'OpenAI Error', details?: unknown) {
    super(message, 502, ErrorCodes.OPENAI_ERROR, details);
  }
}

export class CorsairError extends AppError {
  constructor(message = 'Corsair Error', details?: unknown) {
    super(message, 502, ErrorCodes.CORSAIR_ERROR, details);
  }
}

export class GmailError extends AppError {
  constructor(message = 'Gmail Not Connected', details?: unknown) {
    super(message, 400, ErrorCodes.GMAIL_NOT_CONNECTED, details);
  }
}

export class CalendarError extends AppError {
  constructor(message = 'Calendar Not Connected', details?: unknown) {
    super(message, 400, ErrorCodes.CALENDAR_NOT_CONNECTED, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate Limit Exceeded', details?: unknown) {
    super(message, 429, ErrorCodes.RATE_LIMITED, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error', details?: unknown) {
    super(message, 500, ErrorCodes.INTERNAL_SERVER_ERROR, details);
  }
}
