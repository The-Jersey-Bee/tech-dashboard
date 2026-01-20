import type { Env } from '../types/bindings';
import { DbService } from '../services/db.service';
import { HealthService } from '../services/health.service';
import { CacheService } from '../services/cache.service';
import { HealthStatus } from '../types/health';

export async function scheduledHealthCheck(
  _event: ScheduledEvent,
  env: Env,
  _ctx: ExecutionContext
): Promise<void> {
  console.log('Running scheduled health checks...');

  const db = new DbService(env.DB);
  const healthService = new HealthService();
  const cache = new CacheService(env.CACHE);

  try {
    // Get all enabled health checks
    const checks = await db.listHealthChecks();
    const enabledChecks = checks.filter((c) => c.enabled);

    if (enabledChecks.length === 0) {
      console.log('No enabled health checks found');
      return;
    }

    console.log(`Executing ${enabledChecks.length} health checks...`);

    // Execute all checks in parallel
    const results = await healthService.executeAllChecks(enabledChecks);

    // Get previous results to detect status changes
    const previousResults = await db.getLatestHealthResults();

    // Save results and create alerts for failures/recoveries
    for (const result of results) {
      await db.saveHealthResult(result);

      const check = enabledChecks.find((c) => c.id === result.checkId);
      if (!check) continue;

      const previousResult = previousResults.get(result.checkId);
      const wasHealthy =
        !previousResult || previousResult.status === HealthStatus.HEALTHY;
      const isHealthy = result.status === HealthStatus.HEALTHY;

      // Alert on status changes
      if (wasHealthy && !isHealthy) {
        // Service went down or degraded
        await db.createAlert({
          type: 'health_check_failed',
          severity: result.status === HealthStatus.DOWN ? 'critical' : 'warning',
          title: `${check.name} is ${result.status}`,
          message:
            result.error ||
            `Status code: ${result.statusCode}, Response time: ${result.responseTime}ms`,
          source: check.url,
          metadata: {
            checkId: check.id,
            status: result.status,
            responseTime: result.responseTime,
            statusCode: result.statusCode,
          },
        });
      } else if (!wasHealthy && isHealthy) {
        // Service recovered
        await db.createAlert({
          type: 'health_check_recovered',
          severity: 'info',
          title: `${check.name} has recovered`,
          message: `Response time: ${result.responseTime}ms`,
          source: check.url,
          metadata: {
            checkId: check.id,
            status: result.status,
            responseTime: result.responseTime,
          },
        });
      }

      // Update project status if linked
      if (check.projectId) {
        const projectStatus =
          result.status === HealthStatus.HEALTHY
            ? 'online'
            : result.status === HealthStatus.DEGRADED
              ? 'degraded'
              : 'offline';

        await db.updateProject(check.projectId, { status: projectStatus });
      }
    }

    // Clear health status cache so next request gets fresh data
    await cache.delete(CacheService.keys.healthStatus());

    // Log summary
    const summary = healthService.calculateSummary(results);
    console.log(
      `Health check complete: ${summary.healthy} healthy, ${summary.degraded} degraded, ${summary.down} down`
    );
  } catch (error) {
    console.error('Error running health checks:', error);

    // Create system alert for health check failure
    await db.createAlert({
      type: 'system',
      severity: 'critical',
      title: 'Health check system error',
      message: error instanceof Error ? error.message : 'Unknown error',
      source: 'scheduled/health-check',
    });
  }
}
