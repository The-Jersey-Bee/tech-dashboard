import type { Context, Next } from 'hono';
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  errorResponse,
} from '../utils/response';

export async function errorMiddleware(c: Context, next: Next): Promise<Response | void> {
  try {
    await next();
  } catch (error) {
    console.error('Error:', error);

    if (error instanceof ValidationError) {
      return c.json(errorResponse(error.message), 400);
    }

    if (error instanceof NotFoundError) {
      return c.json(errorResponse(error.message), 404);
    }

    if (error instanceof UnauthorizedError) {
      return c.json(errorResponse(error.message), 401);
    }

    // Handle fetch/network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return c.json(errorResponse('External service unavailable'), 503);
    }

    // Generic error
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return c.json(errorResponse(message), 500);
  }
}
