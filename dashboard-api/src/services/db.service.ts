import type { Project, CreateProjectInput, UpdateProjectInput } from '../types/api';
import type {
  HealthCheck,
  HealthCheckResult,
  CreateHealthCheckInput,
} from '../types/health';
import type { Alert, CreateAlertInput } from '../types/alerts';

export class DbService {
  constructor(private db: D1Database) {}

  // Projects
  async listProjects(): Promise<Project[]> {
    const result = await this.db
      .prepare(
        `SELECT id, name, description, type, url, health_url as healthUrl,
         status, created_at as createdAt, updated_at as updatedAt
         FROM projects ORDER BY name`
      )
      .all<Project>();
    return result.results;
  }

  async getProject(id: string): Promise<Project | null> {
    const result = await this.db
      .prepare(
        `SELECT id, name, description, type, url, health_url as healthUrl,
         status, created_at as createdAt, updated_at as updatedAt
         FROM projects WHERE id = ?`
      )
      .bind(id)
      .first<Project>();
    return result;
  }

  async createProject(input: CreateProjectInput): Promise<Project> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await this.db
      .prepare(
        `INSERT INTO projects (id, name, description, type, url, health_url, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 'unknown', ?, ?)`
      )
      .bind(
        id,
        input.name,
        input.description || null,
        input.type,
        input.url || null,
        input.healthUrl || null,
        now,
        now
      )
      .run();

    return (await this.getProject(id))!;
  }

  async updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
    const updates: string[] = [];
    const values: (string | null)[] = [];

    if (input.name !== undefined) {
      updates.push('name = ?');
      values.push(input.name);
    }
    if (input.description !== undefined) {
      updates.push('description = ?');
      values.push(input.description);
    }
    if (input.type !== undefined) {
      updates.push('type = ?');
      values.push(input.type);
    }
    if (input.url !== undefined) {
      updates.push('url = ?');
      values.push(input.url);
    }
    if (input.healthUrl !== undefined) {
      updates.push('health_url = ?');
      values.push(input.healthUrl);
    }
    if (input.status !== undefined) {
      updates.push('status = ?');
      values.push(input.status);
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    await this.db
      .prepare(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    return (await this.getProject(id))!;
  }

  async deleteProject(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM projects WHERE id = ?').bind(id).run();
  }

  // Health Checks
  async listHealthChecks(): Promise<HealthCheck[]> {
    const result = await this.db
      .prepare(
        `SELECT id, project_id as projectId, name, url, method,
         expected_status as expectedStatus, timeout, interval, enabled,
         created_at as createdAt, updated_at as updatedAt
         FROM health_checks ORDER BY name`
      )
      .all<HealthCheck>();
    return result.results;
  }

  async getHealthCheck(id: string): Promise<HealthCheck | null> {
    const result = await this.db
      .prepare(
        `SELECT id, project_id as projectId, name, url, method,
         expected_status as expectedStatus, timeout, interval, enabled,
         created_at as createdAt, updated_at as updatedAt
         FROM health_checks WHERE id = ?`
      )
      .bind(id)
      .first<HealthCheck>();
    return result;
  }

  async createHealthCheck(input: CreateHealthCheckInput): Promise<HealthCheck> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await this.db
      .prepare(
        `INSERT INTO health_checks (id, project_id, name, url, method, expected_status, timeout, interval, enabled, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`
      )
      .bind(
        id,
        input.projectId,
        input.name,
        input.url,
        input.method || 'GET',
        input.expectedStatus || 200,
        input.timeout || 10000,
        input.interval || 300,
        now,
        now
      )
      .run();

    return (await this.getHealthCheck(id))!;
  }

  async updateHealthCheck(
    id: string,
    updates: Partial<HealthCheck>
  ): Promise<HealthCheck> {
    const fields: string[] = [];
    const values: (string | number | boolean | null)[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.url !== undefined) {
      fields.push('url = ?');
      values.push(updates.url);
    }
    if (updates.method !== undefined) {
      fields.push('method = ?');
      values.push(updates.method);
    }
    if (updates.expectedStatus !== undefined) {
      fields.push('expected_status = ?');
      values.push(updates.expectedStatus);
    }
    if (updates.timeout !== undefined) {
      fields.push('timeout = ?');
      values.push(updates.timeout);
    }
    if (updates.interval !== undefined) {
      fields.push('interval = ?');
      values.push(updates.interval);
    }
    if (updates.enabled !== undefined) {
      fields.push('enabled = ?');
      values.push(updates.enabled ? 1 : 0);
    }

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    await this.db
      .prepare(`UPDATE health_checks SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    return (await this.getHealthCheck(id))!;
  }

  async deleteHealthCheck(id: string): Promise<void> {
    await this.db
      .prepare('DELETE FROM health_checks WHERE id = ?')
      .bind(id)
      .run();
  }

  // Health Results
  async saveHealthResult(result: HealthCheckResult): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO health_results (id, check_id, status, response_time, status_code, error, checked_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        result.id,
        result.checkId,
        result.status,
        result.responseTime,
        result.statusCode,
        result.error,
        result.checkedAt
      )
      .run();
  }

  async getHealthHistory(
    checkId: string,
    limit = 100
  ): Promise<HealthCheckResult[]> {
    const result = await this.db
      .prepare(
        `SELECT id, check_id as checkId, status, response_time as responseTime,
         status_code as statusCode, error, checked_at as checkedAt
         FROM health_results WHERE check_id = ?
         ORDER BY checked_at DESC LIMIT ?`
      )
      .bind(checkId, limit)
      .all<HealthCheckResult>();
    return result.results;
  }

  async getLatestHealthResults(): Promise<
    Map<string, HealthCheckResult>
  > {
    const result = await this.db
      .prepare(
        `SELECT hr.id, hr.check_id as checkId, hr.status, hr.response_time as responseTime,
         hr.status_code as statusCode, hr.error, hr.checked_at as checkedAt
         FROM health_results hr
         INNER JOIN (
           SELECT check_id, MAX(checked_at) as max_checked
           FROM health_results GROUP BY check_id
         ) latest ON hr.check_id = latest.check_id AND hr.checked_at = latest.max_checked`
      )
      .all<HealthCheckResult>();

    const map = new Map<string, HealthCheckResult>();
    for (const r of result.results) {
      map.set(r.checkId, r);
    }
    return map;
  }

  // Alerts
  async createAlert(input: CreateAlertInput): Promise<Alert> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await this.db
      .prepare(
        `INSERT INTO alerts (id, type, severity, title, message, source, metadata, acknowledged, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`
      )
      .bind(
        id,
        input.type,
        input.severity,
        input.title,
        input.message,
        input.source,
        input.metadata ? JSON.stringify(input.metadata) : null,
        now
      )
      .run();

    return (await this.getAlert(id))!;
  }

  async getAlert(id: string): Promise<Alert | null> {
    const result = await this.db
      .prepare(
        `SELECT id, type, severity, title, message, source, metadata,
         acknowledged, acknowledged_at as acknowledgedAt, created_at as createdAt
         FROM alerts WHERE id = ?`
      )
      .bind(id)
      .first<Alert & { metadata: string | null }>();

    if (!result) return null;

    return {
      ...result,
      metadata: result.metadata ? JSON.parse(result.metadata) : null,
      acknowledged: Boolean(result.acknowledged),
    };
  }

  async listAlerts(limit = 50, unacknowledgedOnly = false): Promise<Alert[]> {
    const query = unacknowledgedOnly
      ? `SELECT id, type, severity, title, message, source, metadata,
         acknowledged, acknowledged_at as acknowledgedAt, created_at as createdAt
         FROM alerts WHERE acknowledged = 0 ORDER BY created_at DESC LIMIT ?`
      : `SELECT id, type, severity, title, message, source, metadata,
         acknowledged, acknowledged_at as acknowledgedAt, created_at as createdAt
         FROM alerts ORDER BY created_at DESC LIMIT ?`;

    const result = await this.db
      .prepare(query)
      .bind(limit)
      .all<Alert & { metadata: string | null }>();

    return result.results.map((r) => ({
      ...r,
      metadata: r.metadata ? JSON.parse(r.metadata) : null,
      acknowledged: Boolean(r.acknowledged),
    }));
  }

  async acknowledgeAlert(id: string): Promise<void> {
    await this.db
      .prepare(
        'UPDATE alerts SET acknowledged = 1, acknowledged_at = ? WHERE id = ?'
      )
      .bind(new Date().toISOString(), id)
      .run();
  }

  // Stats
  async getHealthStats(): Promise<{
    total: number;
    healthy: number;
    degraded: number;
    down: number;
    unknown: number;
  }> {
    const checks = await this.listHealthChecks();
    const results = await this.getLatestHealthResults();

    let healthy = 0;
    let degraded = 0;
    let down = 0;
    let unknown = 0;

    for (const check of checks) {
      if (!check.enabled) continue;
      const result = results.get(check.id);
      if (!result) {
        unknown++;
      } else {
        switch (result.status) {
          case 'healthy':
            healthy++;
            break;
          case 'degraded':
            degraded++;
            break;
          case 'down':
            down++;
            break;
          default:
            unknown++;
        }
      }
    }

    return { total: checks.length, healthy, degraded, down, unknown };
  }
}
