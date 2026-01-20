import { Hono } from 'hono';
import type { Env } from './types/bindings';
import { corsMiddleware } from './middleware/cors';
import { errorMiddleware } from './middleware/error';
import { devAuthMiddleware } from './middleware/auth';
import githubRoutes from './routes/github';
import cloudflareRoutes from './routes/cloudflare';
import healthRoutes from './routes/health';
import projectsRoutes from './routes/projects';
import controlsRoutes from './routes/controls';
import alertsRoutes from './routes/alerts';
import { scheduledHealthCheck } from './scheduled/health-check';

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', async (c, next) => {
  // Apply CORS
  const cors = corsMiddleware(c.env.FRONTEND_URL);
  await cors(c, next);
});

app.use('*', errorMiddleware);

// Use dev auth in development (skip JWT validation)
app.use('/api/*', devAuthMiddleware());

// Health check for the API itself
app.get('/', (c) => {
  return c.json({
    name: 'Jersey Bee Dashboard API',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.route('/api/github', githubRoutes);
app.route('/api/cloudflare', cloudflareRoutes);
app.route('/api/health', healthRoutes);
app.route('/api/projects', projectsRoutes);
app.route('/api/controls', controlsRoutes);
app.route('/api/alerts', alertsRoutes);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: 'Not found',
      timestamp: new Date().toISOString(),
    },
    404
  );
});

// Export for Cloudflare Workers
export default {
  fetch: app.fetch,
  scheduled: scheduledHealthCheck,
};
