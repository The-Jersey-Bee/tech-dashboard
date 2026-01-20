import { Hono } from 'hono';
import type { Env } from '../types/bindings';
import { CloudflareService } from '../services/cloudflare.service';
import { DbService } from '../services/db.service';
import { CacheService } from '../services/cache.service';
import { successResponse } from '../utils/response';
import { ValidationError } from '../utils/response';

const controls = new Hono<{ Bindings: Env }>();

// POST /api/controls/deploy/:project - Trigger Pages deployment
controls.post('/deploy/:project', async (c) => {
  const { project } = c.req.param();

  const cf = new CloudflareService(
    c.env.CLOUDFLARE_API_TOKEN,
    c.env.CLOUDFLARE_ACCOUNT_ID
  );

  try {
    const deployment = await cf.triggerPageDeploy(project);

    // Create an alert for the deployment
    const db = new DbService(c.env.DB);
    await db.createAlert({
      type: 'deploy_triggered',
      severity: 'info',
      title: `Deployment triggered for ${project}`,
      message: `A new deployment has been triggered for the ${project} Pages project.`,
      source: 'controls',
      metadata: {
        project,
        deploymentId: deployment.id,
      },
    });

    // Clear pages cache
    const cache = new CacheService(c.env.CACHE);
    await cache.delete(CacheService.keys.cloudflarePages());

    return c.json(successResponse(deployment));
  } catch (error) {
    // Create alert for failed deployment
    const db = new DbService(c.env.DB);
    await db.createAlert({
      type: 'deploy_failure',
      severity: 'critical',
      title: `Deployment failed for ${project}`,
      message: error instanceof Error ? error.message : 'Unknown error',
      source: 'controls',
      metadata: { project },
    });

    throw error;
  }
});

// POST /api/controls/cache/purge - Purge cache
controls.post('/cache/purge', async (c) => {
  const body = await c.req.json<{
    type: 'zone' | 'kv' | 'all';
    zoneId?: string;
    urls?: string[];
  }>();

  if (!body.type) {
    throw new ValidationError('type is required (zone, kv, or all)');
  }

  const results: string[] = [];

  // Purge KV cache
  if (body.type === 'kv' || body.type === 'all') {
    const cache = new CacheService(c.env.CACHE);
    // Clear known cache keys
    await cache.delete(CacheService.keys.cloudflareWorkers());
    await cache.delete(CacheService.keys.cloudflarePages());
    await cache.delete(CacheService.keys.cloudflareD1());
    await cache.delete(CacheService.keys.healthStatus());
    results.push('KV cache cleared');
  }

  // Purge Cloudflare zone cache
  if ((body.type === 'zone' || body.type === 'all') && body.zoneId) {
    const cf = new CloudflareService(
      c.env.CLOUDFLARE_API_TOKEN,
      c.env.CLOUDFLARE_ACCOUNT_ID
    );

    await cf.purgeCache(body.zoneId, body.urls);
    results.push(
      body.urls
        ? `Zone cache purged for ${body.urls.length} URLs`
        : 'Full zone cache purged'
    );
  }

  // Create alert
  const db = new DbService(c.env.DB);
  await db.createAlert({
    type: 'system',
    severity: 'info',
    title: 'Cache purged',
    message: results.join(', '),
    source: 'controls',
    metadata: { type: body.type, results },
  });

  return c.json(successResponse({ results }));
});

// POST /api/controls/refresh - Refresh all cached data
controls.post('/refresh', async (c) => {
  const cache = new CacheService(c.env.CACHE);

  // Clear all known cache keys
  const keysToDelete = [
    CacheService.keys.cloudflareWorkers(),
    CacheService.keys.cloudflarePages(),
    CacheService.keys.cloudflareD1(),
    CacheService.keys.healthStatus(),
    CacheService.keys.githubRepos(c.env.GITHUB_ORG),
    CacheService.keys.githubActivity(c.env.GITHUB_ORG),
  ];

  await Promise.all(keysToDelete.map((key) => cache.delete(key)));

  return c.json(
    successResponse({
      message: 'Cache refreshed',
      keysCleared: keysToDelete.length,
    })
  );
});

export default controls;
