import { Hono } from 'hono';
import type { Env } from '../types/bindings';
import { DbService } from '../services/db.service';
import { HealthService } from '../services/health.service';
import { CacheService } from '../services/cache.service';
import { successResponse } from '../utils/response';
import { NotFoundError, ValidationError } from '../utils/response';
import type { CreateHealthCheckInput } from '../types/health';

const health = new Hono<{ Bindings: Env }>();

// GET /api/health/status - Overall health status summary
health.get('/status', async (c) => {
  const cache = new CacheService(c.env.CACHE);
  const cacheKey = CacheService.keys.healthStatus();

  const cached = await cache.get(cacheKey);
  if (cached) {
    return c.json(successResponse(cached));
  }

  const db = new DbService(c.env.DB);
  const healthService = new HealthService();

  const latestResults = await db.getLatestHealthResults();

  const results = Array.from(latestResults.values());
  const summary = healthService.calculateSummary(results);

  await cache.set(cacheKey, summary, CacheService.ttl.healthStatus);

  return c.json(successResponse(summary));
});

// GET /api/health/checks - List all health checks
health.get('/checks', async (c) => {
  const db = new DbService(c.env.DB);
  const checks = await db.listHealthChecks();
  const latestResults = await db.getLatestHealthResults();

  // Enrich checks with latest result
  const enrichedChecks = checks.map((check) => ({
    ...check,
    latestResult: latestResults.get(check.id) || null,
  }));

  return c.json(successResponse(enrichedChecks));
});

// GET /api/health/checks/:id - Get specific health check
health.get('/checks/:id', async (c) => {
  const { id } = c.req.param();
  const db = new DbService(c.env.DB);

  const check = await db.getHealthCheck(id);
  if (!check) {
    throw new NotFoundError('Health check');
  }

  const history = await db.getHealthHistory(id, 50);
  const healthService = new HealthService();

  return c.json(
    successResponse({
      ...check,
      history,
      uptime: healthService.calculateUptime(history),
      avgResponseTime: healthService.calculateAvgResponseTime(history),
    })
  );
});

// POST /api/health/checks - Create health check
health.post('/checks', async (c) => {
  const body = await c.req.json<CreateHealthCheckInput>();

  if (!body.projectId || !body.name || !body.url) {
    throw new ValidationError('projectId, name, and url are required');
  }

  // Validate URL
  try {
    new URL(body.url);
  } catch {
    throw new ValidationError('Invalid URL format');
  }

  const db = new DbService(c.env.DB);
  const check = await db.createHealthCheck(body);

  return c.json(successResponse(check), 201);
});

// PUT /api/health/checks/:id - Update health check
health.put('/checks/:id', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  const db = new DbService(c.env.DB);

  const existing = await db.getHealthCheck(id);
  if (!existing) {
    throw new NotFoundError('Health check');
  }

  const updated = await db.updateHealthCheck(id, body);
  return c.json(successResponse(updated));
});

// DELETE /api/health/checks/:id - Delete health check
health.delete('/checks/:id', async (c) => {
  const { id } = c.req.param();
  const db = new DbService(c.env.DB);

  const existing = await db.getHealthCheck(id);
  if (!existing) {
    throw new NotFoundError('Health check');
  }

  await db.deleteHealthCheck(id);
  return c.json(successResponse({ deleted: true }));
});

// GET /api/health/checks/:id/history - Get check history
health.get('/checks/:id/history', async (c) => {
  const { id } = c.req.param();
  const limit = parseInt(c.req.query('limit') || '100', 10);

  const db = new DbService(c.env.DB);

  const check = await db.getHealthCheck(id);
  if (!check) {
    throw new NotFoundError('Health check');
  }

  const history = await db.getHealthHistory(id, limit);
  return c.json(successResponse(history));
});

// POST /api/health/checks/:id/trigger - Trigger immediate check
health.post('/checks/:id/trigger', async (c) => {
  const { id } = c.req.param();
  const db = new DbService(c.env.DB);

  const check = await db.getHealthCheck(id);
  if (!check) {
    throw new NotFoundError('Health check');
  }

  const healthService = new HealthService();
  const result = await healthService.executeCheck(check);

  await db.saveHealthResult(result);

  // Clear health status cache
  const cache = new CacheService(c.env.CACHE);
  await cache.delete(CacheService.keys.healthStatus());

  return c.json(successResponse(result));
});

export default health;
