import type {
  HealthCheck,
  HealthCheckResult,
  HealthStatus,
  HealthStatusSummary,
} from '../types/health';
import { HealthStatus as HS } from '../types/health';

export class HealthService {
  async executeCheck(check: HealthCheck): Promise<HealthCheckResult> {
    const id = crypto.randomUUID();
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), check.timeout);

      const response = await fetch(check.url, {
        method: check.method,
        signal: controller.signal,
        headers: {
          'User-Agent': 'Jersey-Bee-Dashboard-Health-Check',
        },
      });

      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;
      const statusCode = response.status;

      // Determine status
      let status: HealthStatus;
      if (statusCode === check.expectedStatus) {
        // Response time thresholds
        if (responseTime < 1000) {
          status = HS.HEALTHY;
        } else if (responseTime < 3000) {
          status = HS.DEGRADED;
        } else {
          status = HS.DEGRADED;
        }
      } else {
        status = HS.DOWN;
      }

      return {
        id,
        checkId: check.id,
        status,
        responseTime,
        statusCode,
        error: null,
        checkedAt: new Date().toISOString(),
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      return {
        id,
        checkId: check.id,
        status: HS.DOWN,
        responseTime,
        statusCode: null,
        error: errorMessage,
        checkedAt: new Date().toISOString(),
      };
    }
  }

  async executeAllChecks(checks: HealthCheck[]): Promise<HealthCheckResult[]> {
    const enabledChecks = checks.filter((c) => c.enabled);

    // Execute all checks in parallel
    const results = await Promise.all(
      enabledChecks.map((check) => this.executeCheck(check))
    );

    return results;
  }

  calculateSummary(results: HealthCheckResult[]): HealthStatusSummary {
    const summary: HealthStatusSummary = {
      totalChecks: results.length,
      healthy: 0,
      degraded: 0,
      down: 0,
      unknown: 0,
      lastUpdated: new Date().toISOString(),
    };

    for (const result of results) {
      switch (result.status) {
        case HS.HEALTHY:
          summary.healthy++;
          break;
        case HS.DEGRADED:
          summary.degraded++;
          break;
        case HS.DOWN:
          summary.down++;
          break;
        default:
          summary.unknown++;
      }
    }

    return summary;
  }

  // Calculate uptime percentage from history
  calculateUptime(history: HealthCheckResult[]): number {
    if (history.length === 0) return 100;

    const healthyCount = history.filter(
      (r) => r.status === HS.HEALTHY || r.status === HS.DEGRADED
    ).length;

    return Math.round((healthyCount / history.length) * 100 * 10) / 10;
  }

  // Calculate average response time
  calculateAvgResponseTime(history: HealthCheckResult[]): number {
    const validResults = history.filter((r) => r.responseTime !== null);
    if (validResults.length === 0) return 0;

    const sum = validResults.reduce((acc, r) => acc + (r.responseTime || 0), 0);
    return Math.round(sum / validResults.length);
  }
}
