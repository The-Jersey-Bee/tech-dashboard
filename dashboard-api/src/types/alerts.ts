export type AlertType =
  | 'health_check_failed'
  | 'health_check_recovered'
  | 'deploy_triggered'
  | 'deploy_success'
  | 'deploy_failure'
  | 'github_ci_failed'
  | 'github_issue_created'
  | 'system';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  source: string;
  metadata: Record<string, unknown> | null;
  acknowledged: boolean;
  acknowledgedAt: string | null;
  createdAt: string;
}

export interface CreateAlertInput {
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  source: string;
  metadata?: Record<string, unknown>;
}

export interface ActivityItem {
  id: string;
  type: 'github' | 'cloudflare' | 'health' | 'alert' | 'deploy';
  title: string;
  description: string;
  source: string;
  url?: string;
  timestamp: string;
  severity?: AlertSeverity;
  metadata?: Record<string, unknown>;
}
