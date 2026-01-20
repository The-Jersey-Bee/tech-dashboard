import type { Context, Next } from 'hono';

// Simple auth middleware - validates that requests come from our frontend
// In production, you'd want to verify JWT tokens properly
export function authMiddleware(_jwtSecret: string) {
  return async (c: Context, next: Next) => {
    // Skip auth for health check endpoints that need to be public
    if (c.req.path === '/api/health/status') {
      return next();
    }

    const authHeader = c.req.header('Authorization');

    // For now, just check that there's a bearer token
    // In production, verify the Google JWT or use a custom token
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const token = authHeader.substring(7);

    // Basic token validation - in production, verify with Google's public keys
    // or use the jwtSecret for custom tokens
    if (!token || token.length < 10) {
      return c.json({ success: false, error: 'Invalid token' }, 401);
    }

    // Store token info in context for later use
    c.set('token', token);

    await next();
  };
}

// Optional: Skip auth for development
export function devAuthMiddleware() {
  return async (c: Context, next: Next) => {
    c.set('token', 'dev-token');
    await next();
  };
}
