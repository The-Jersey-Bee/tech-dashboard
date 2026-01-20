import type { Context, Next } from 'hono';

export function corsMiddleware(allowedOrigin: string) {
  return async (c: Context, next: Next): Promise<Response | void> => {
    const origin = c.req.header('Origin') || '';

    // Allow localhost for development and the configured frontend URL
    const isAllowed =
      origin === allowedOrigin ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin.includes('.pages.dev');

    const corsOrigin = isAllowed ? origin : allowedOrigin;

    // Set CORS headers
    c.header('Access-Control-Allow-Origin', corsOrigin);
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    c.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With'
    );
    c.header('Access-Control-Max-Age', '86400');

    // Handle OPTIONS preflight requests
    if (c.req.method === 'OPTIONS') {
      return c.body(null, 204);
    }

    await next();
  };
}
