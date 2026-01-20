import { Hono } from 'hono';
import type { Env } from '../types/bindings';
import { DbService } from '../services/db.service';
import { GitHubService } from '../services/github.service';
import { successResponse } from '../utils/response';
import { NotFoundError } from '../utils/response';
import type { ActivityItem } from '../types/alerts';

const alerts = new Hono<{ Bindings: Env }>();

// GET /api/alerts - List alerts
alerts.get('/', async (c) => {
  const limit = parseInt(c.req.query('limit') || '50', 10);
  const unacknowledgedOnly = c.req.query('unacknowledged') === 'true';

  const db = new DbService(c.env.DB);
  const allAlerts = await db.listAlerts(limit, unacknowledgedOnly);

  return c.json(successResponse(allAlerts));
});

// GET /api/alerts/unacknowledged/count - Get unacknowledged count
alerts.get('/unacknowledged/count', async (c) => {
  const db = new DbService(c.env.DB);
  const unacknowledged = await db.listAlerts(1000, true);

  return c.json(
    successResponse({
      count: unacknowledged.length,
      critical: unacknowledged.filter((a) => a.severity === 'critical').length,
      warning: unacknowledged.filter((a) => a.severity === 'warning').length,
      info: unacknowledged.filter((a) => a.severity === 'info').length,
    })
  );
});

// GET /api/alerts/:id - Get specific alert
alerts.get('/:id', async (c) => {
  const { id } = c.req.param();
  const db = new DbService(c.env.DB);

  const alert = await db.getAlert(id);
  if (!alert) {
    throw new NotFoundError('Alert');
  }

  return c.json(successResponse(alert));
});

// POST /api/alerts/:id/acknowledge - Acknowledge alert
alerts.post('/:id/acknowledge', async (c) => {
  const { id } = c.req.param();
  const db = new DbService(c.env.DB);

  const alert = await db.getAlert(id);
  if (!alert) {
    throw new NotFoundError('Alert');
  }

  await db.acknowledgeAlert(id);

  return c.json(successResponse({ acknowledged: true }));
});

// POST /api/alerts/acknowledge-all - Acknowledge all alerts
alerts.post('/acknowledge-all', async (c) => {
  const db = new DbService(c.env.DB);
  const unacknowledged = await db.listAlerts(1000, true);

  for (const alert of unacknowledged) {
    await db.acknowledgeAlert(alert.id);
  }

  return c.json(
    successResponse({
      acknowledged: unacknowledged.length,
    })
  );
});

// GET /api/alerts/feed - Unified activity feed
alerts.get('/feed', async (c) => {
  const limit = parseInt(c.req.query('limit') || '30', 10);

  const db = new DbService(c.env.DB);
  const gh = new GitHubService(c.env.GITHUB_TOKEN, c.env.GITHUB_ORG);

  // Get recent alerts
  const recentAlerts = await db.listAlerts(20);

  // Get GitHub activity
  let githubActivity: ActivityItem[] = [];
  try {
    const ghActivity = await gh.getOrgActivity(20);
    githubActivity = ghActivity.map((a) => ({
      id: a.id,
      type: 'github' as const,
      title: a.title,
      description: `${a.type} by ${a.actor}`,
      source: a.repo,
      url: a.url,
      timestamp: a.timestamp,
      metadata: a.metadata,
    }));
  } catch {
    // GitHub activity unavailable
  }

  // Get recent health check results
  const checks = await db.listHealthChecks();
  const healthActivity: ActivityItem[] = [];

  for (const check of checks.slice(0, 5)) {
    const history = await db.getHealthHistory(check.id, 3);
    for (const result of history) {
      if (result.status !== 'healthy') {
        healthActivity.push({
          id: result.id,
          type: 'health',
          title: `${check.name}: ${result.status}`,
          description: result.error || `Response time: ${result.responseTime}ms`,
          source: check.url,
          timestamp: result.checkedAt,
          severity: result.status === 'down' ? 'critical' : 'warning',
        });
      }
    }
  }

  // Convert alerts to activity items
  const alertActivity: ActivityItem[] = recentAlerts.map((a) => ({
    id: a.id,
    type: 'alert',
    title: a.title,
    description: a.message,
    source: a.source,
    timestamp: a.createdAt,
    severity: a.severity,
    metadata: a.metadata || undefined,
  }));

  // Combine and sort by timestamp
  const allActivity = [
    ...alertActivity,
    ...githubActivity,
    ...healthActivity,
  ]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, limit);

  return c.json(successResponse(allActivity));
});

export default alerts;
