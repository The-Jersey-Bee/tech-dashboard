import { Hono } from 'hono';
import type { Env } from '../types/bindings';
import { GitHubService } from '../services/github.service';
import { CacheService } from '../services/cache.service';
import { successResponse } from '../utils/response';

const github = new Hono<{ Bindings: Env }>();

// GET /api/github/repos - List all repos in org
github.get('/repos', async (c) => {
  const cache = new CacheService(c.env.CACHE);
  const cacheKey = CacheService.keys.githubRepos(c.env.GITHUB_ORG);

  // Check cache first
  const cached = await cache.get(cacheKey);
  if (cached) {
    return c.json(successResponse(cached));
  }

  const gh = new GitHubService(c.env.GITHUB_TOKEN, c.env.GITHUB_ORG);
  const repos = await gh.listReposWithHealth();

  // Cache for 10 minutes
  await cache.set(cacheKey, repos, CacheService.ttl.githubRepos);

  return c.json(successResponse(repos));
});

// GET /api/github/repos/:owner/:repo - Get specific repo
github.get('/repos/:owner/:repo', async (c) => {
  const { owner, repo } = c.req.param();
  const cache = new CacheService(c.env.CACHE);
  const cacheKey = CacheService.keys.githubRepo(owner, repo);

  const cached = await cache.get(cacheKey);
  if (cached) {
    return c.json(successResponse(cached));
  }

  const gh = new GitHubService(c.env.GITHUB_TOKEN, c.env.GITHUB_ORG);
  const repoData = await gh.getRepo(owner, repo);

  await cache.set(cacheKey, repoData, CacheService.ttl.githubRepos);

  return c.json(successResponse(repoData));
});

// GET /api/github/repos/:owner/:repo/activity - Get repo activity
github.get('/repos/:owner/:repo/activity', async (c) => {
  const { owner, repo } = c.req.param();

  const gh = new GitHubService(c.env.GITHUB_TOKEN, c.env.GITHUB_ORG);
  const activity = await gh.getRepoActivity(owner, repo);

  return c.json(successResponse(activity));
});

// GET /api/github/repos/:owner/:repo/workflows - Get workflows
github.get('/repos/:owner/:repo/workflows', async (c) => {
  const { owner, repo } = c.req.param();
  const cache = new CacheService(c.env.CACHE);
  const cacheKey = CacheService.keys.githubWorkflows(owner, repo);

  const cached = await cache.get(cacheKey);
  if (cached) {
    return c.json(successResponse(cached));
  }

  const gh = new GitHubService(c.env.GITHUB_TOKEN, c.env.GITHUB_ORG);
  const [workflows, runs] = await Promise.all([
    gh.getWorkflows(owner, repo),
    gh.getWorkflowRuns(owner, repo, 10),
  ]);

  const result = { workflows, recentRuns: runs };
  await cache.set(cacheKey, result, CacheService.ttl.githubActivity);

  return c.json(successResponse(result));
});

// GET /api/github/activity - Org-wide activity feed
github.get('/activity', async (c) => {
  const cache = new CacheService(c.env.CACHE);
  const cacheKey = CacheService.keys.githubActivity(c.env.GITHUB_ORG);

  const cached = await cache.get(cacheKey);
  if (cached) {
    return c.json(successResponse(cached));
  }

  const gh = new GitHubService(c.env.GITHUB_TOKEN, c.env.GITHUB_ORG);
  const activity = await gh.getOrgActivity();

  await cache.set(cacheKey, activity, CacheService.ttl.githubActivity);

  return c.json(successResponse(activity));
});

export default github;
