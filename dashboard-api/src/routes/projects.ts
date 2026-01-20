import { Hono } from 'hono';
import type { Env } from '../types/bindings';
import { DbService } from '../services/db.service';
import { successResponse } from '../utils/response';
import { NotFoundError, ValidationError } from '../utils/response';
import type { CreateProjectInput, UpdateProjectInput } from '../types/api';

const projects = new Hono<{ Bindings: Env }>();

// GET /api/projects - List all projects
projects.get('/', async (c) => {
  const db = new DbService(c.env.DB);
  const allProjects = await db.listProjects();

  // Get health status for each project
  const healthChecks = await db.listHealthChecks();
  const latestResults = await db.getLatestHealthResults();

  const projectsWithStatus = allProjects.map((project) => {
    const projectChecks = healthChecks.filter(
      (hc) => hc.projectId === project.id
    );
    const projectResults = projectChecks
      .map((hc) => latestResults.get(hc.id))
      .filter(Boolean);

    // Determine overall status from health checks
    let status = project.status;
    if (projectResults.length > 0) {
      const hasDown = projectResults.some((r) => r?.status === 'down');
      const hasDegraded = projectResults.some((r) => r?.status === 'degraded');
      if (hasDown) status = 'offline';
      else if (hasDegraded) status = 'degraded';
      else status = 'online';
    }

    return {
      ...project,
      status,
      healthChecks: projectChecks.length,
    };
  });

  return c.json(successResponse(projectsWithStatus));
});

// GET /api/projects/:id - Get specific project
projects.get('/:id', async (c) => {
  const { id } = c.req.param();
  const db = new DbService(c.env.DB);

  const project = await db.getProject(id);
  if (!project) {
    throw new NotFoundError('Project');
  }

  // Get associated health checks
  const allChecks = await db.listHealthChecks();
  const projectChecks = allChecks.filter((hc) => hc.projectId === id);
  const latestResults = await db.getLatestHealthResults();

  const checksWithResults = projectChecks.map((check) => ({
    ...check,
    latestResult: latestResults.get(check.id) || null,
  }));

  return c.json(
    successResponse({
      ...project,
      healthChecks: checksWithResults,
    })
  );
});

// POST /api/projects - Create project
projects.post('/', async (c) => {
  const body = await c.req.json<CreateProjectInput>();

  if (!body.name || !body.type) {
    throw new ValidationError('name and type are required');
  }

  const validTypes = ['worker', 'pages', 'd1', 'automation', 'external', 'github'];
  if (!validTypes.includes(body.type)) {
    throw new ValidationError(
      `type must be one of: ${validTypes.join(', ')}`
    );
  }

  const db = new DbService(c.env.DB);
  const project = await db.createProject(body);

  return c.json(successResponse(project), 201);
});

// PUT /api/projects/:id - Update project
projects.put('/:id', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json<UpdateProjectInput>();

  const db = new DbService(c.env.DB);

  const existing = await db.getProject(id);
  if (!existing) {
    throw new NotFoundError('Project');
  }

  const updated = await db.updateProject(id, body);
  return c.json(successResponse(updated));
});

// DELETE /api/projects/:id - Delete project
projects.delete('/:id', async (c) => {
  const { id } = c.req.param();
  const db = new DbService(c.env.DB);

  const existing = await db.getProject(id);
  if (!existing) {
    throw new NotFoundError('Project');
  }

  await db.deleteProject(id);
  return c.json(successResponse({ deleted: true }));
});

export default projects;
