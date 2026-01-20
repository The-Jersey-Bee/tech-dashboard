import { Hono } from 'hono';
import type { Env } from '../types/bindings';
import { CloudflareService } from '../services/cloudflare.service';
import { CacheService } from '../services/cache.service';
import { successResponse } from '../utils/response';

const cloudflare = new Hono<{ Bindings: Env }>();

// GET /api/cloudflare/resources - Get all resources
cloudflare.get('/resources', async (c) => {
  const cf = new CloudflareService(
    c.env.CLOUDFLARE_API_TOKEN,
    c.env.CLOUDFLARE_ACCOUNT_ID
  );

  const resources = await cf.getAllResources();
  return c.json(successResponse(resources));
});

// GET /api/cloudflare/workers - List all workers
cloudflare.get('/workers', async (c) => {
  try {
    // Debug: check if secrets are available
    if (!c.env.CLOUDFLARE_API_TOKEN) {
      return c.json({ success: false, error: 'CLOUDFLARE_API_TOKEN not configured' }, 500);
    }
    if (!c.env.CLOUDFLARE_ACCOUNT_ID) {
      return c.json({ success: false, error: 'CLOUDFLARE_ACCOUNT_ID not configured' }, 500);
    }

    const cache = new CacheService(c.env.CACHE);
    const cacheKey = CacheService.keys.cloudflareWorkers();

    const cached = await cache.get(cacheKey);
    if (cached) {
      return c.json(successResponse(cached));
    }

    const cf = new CloudflareService(
      c.env.CLOUDFLARE_API_TOKEN,
      c.env.CLOUDFLARE_ACCOUNT_ID
    );

    const workers = await cf.listWorkers();
    await cache.set(cacheKey, workers, CacheService.ttl.cloudflareResources);

    return c.json(successResponse(workers));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: message }, 500);
  }
});

// GET /api/cloudflare/workers/:name - Get specific worker
cloudflare.get('/workers/:name', async (c) => {
  const { name } = c.req.param();

  const cf = new CloudflareService(
    c.env.CLOUDFLARE_API_TOKEN,
    c.env.CLOUDFLARE_ACCOUNT_ID
  );

  const worker = await cf.getWorker(name);
  return c.json(successResponse(worker));
});

// GET /api/cloudflare/pages - List all Pages projects
cloudflare.get('/pages', async (c) => {
  const cache = new CacheService(c.env.CACHE);
  const cacheKey = CacheService.keys.cloudflarePages();

  const cached = await cache.get(cacheKey);
  if (cached) {
    return c.json(successResponse(cached));
  }

  const cf = new CloudflareService(
    c.env.CLOUDFLARE_API_TOKEN,
    c.env.CLOUDFLARE_ACCOUNT_ID
  );

  const pages = await cf.listPages();
  await cache.set(cacheKey, pages, CacheService.ttl.cloudflareResources);

  return c.json(successResponse(pages));
});

// GET /api/cloudflare/pages/:project - Get specific Pages project
cloudflare.get('/pages/:project', async (c) => {
  const { project } = c.req.param();

  const cf = new CloudflareService(
    c.env.CLOUDFLARE_API_TOKEN,
    c.env.CLOUDFLARE_ACCOUNT_ID
  );

  const page = await cf.getPage(project);
  return c.json(successResponse(page));
});

// GET /api/cloudflare/pages/:project/deployments - Get deployments
cloudflare.get('/pages/:project/deployments', async (c) => {
  const { project } = c.req.param();

  const cf = new CloudflareService(
    c.env.CLOUDFLARE_API_TOKEN,
    c.env.CLOUDFLARE_ACCOUNT_ID
  );

  const deployments = await cf.getPageDeployments(project);
  return c.json(successResponse(deployments));
});

// GET /api/cloudflare/d1 - List D1 databases
cloudflare.get('/d1', async (c) => {
  const cache = new CacheService(c.env.CACHE);
  const cacheKey = CacheService.keys.cloudflareD1();

  const cached = await cache.get(cacheKey);
  if (cached) {
    return c.json(successResponse(cached));
  }

  const cf = new CloudflareService(
    c.env.CLOUDFLARE_API_TOKEN,
    c.env.CLOUDFLARE_ACCOUNT_ID
  );

  const databases = await cf.listD1Databases();
  await cache.set(cacheKey, databases, CacheService.ttl.cloudflareResources);

  return c.json(successResponse(databases));
});

// GET /api/cloudflare/d1/:id - Get specific D1 database
cloudflare.get('/d1/:id', async (c) => {
  const { id } = c.req.param();

  const cf = new CloudflareService(
    c.env.CLOUDFLARE_API_TOKEN,
    c.env.CLOUDFLARE_ACCOUNT_ID
  );

  const database = await cf.getD1Database(id);
  return c.json(successResponse(database));
});

export default cloudflare;
