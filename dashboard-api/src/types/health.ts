export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  DOWN = 'down',
  UNKNOWN = 'unknown',
}

export interface HealthCheck {
  id: string;
  projectId: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'HEAD';
  expectedStatus: number;
  timeout: number;
  interval: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HealthCheckResult {
  id: string;
  checkId: string;
  status: HealthStatus;
  responseTime: number | null;
  statusCode: number | null;
  error: string | null;
  checkedAt: string;
}

export interface CreateHealthCheckInput {
  projectId: string;
  name: string;
  url: string;
  method?: 'GET' | 'POST' | 'HEAD';
  expectedStatus?: number;
  timeout?: number;
  interval?: number;
}

export interface HealthStatusSummary {
  totalChecks: number;
  healthy: number;
  degraded: number;
  down: number;
  unknown: number;
  lastUpdated: string;
}
