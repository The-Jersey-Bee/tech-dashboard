// API service for communicating with the dashboard-api Worker
// In development, we'll use mock data. In production, this would call the Worker.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('google_auth_token');

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data: ApiResponse<T> = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'API request failed');
  }

  return data.data as T;
}

// Types matching the backend
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  open_issues_count: number;
  pushed_at: string;
  visibility: 'public' | 'private';
  health: {
    status: 'healthy' | 'warning' | 'critical';
    daysSinceCommit: number;
    ciStatus: 'passing' | 'failing' | 'unknown';
    openIssues: number;
    openPRs: number;
  };
}

export interface GitHubActivity {
  id: string;
  type: 'push' | 'pr' | 'issue' | 'release' | 'workflow';
  repo: string;
  actor: string;
  actorAvatar: string;
  title: string;
  url: string;
  timestamp: string;
}

export interface CloudflareWorker {
  id: string;
  name: string;
  created_on: string;
  modified_on: string;
}

export interface CloudflarePage {
  id: string;
  name: string;
  subdomain: string;
  domains: string[];
  production_branch: string;
  latest_deployment?: {
    id: string;
    environment: string;
    url: string;
    created_on: string;
    deployment_trigger: {
      metadata: {
        branch: string;
        commit_hash: string;
        commit_message: string;
      };
    };
    latest_stage: {
      status: string;
    };
  };
}

export interface CloudflareD1 {
  uuid: string;
  name: string;
  created_at: string;
}

export interface HealthCheck {
  id: string;
  projectId: string;
  name: string;
  url: string;
  method: string;
  expectedStatus: number;
  enabled: boolean;
  latestResult?: {
    status: 'healthy' | 'degraded' | 'down' | 'unknown';
    responseTime: number | null;
    statusCode: number | null;
    checkedAt: string;
  };
}

export interface HealthStatusSummary {
  totalChecks: number;
  healthy: number;
  degraded: number;
  down: number;
  unknown: number;
  lastUpdated: string;
}

export interface Alert {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  source: string;
  acknowledged: boolean;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: 'github' | 'cloudflare' | 'health' | 'alert' | 'deploy';
  title: string;
  description: string;
  source: string;
  url?: string;
  timestamp: string;
  severity?: 'info' | 'warning' | 'critical';
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  type: 'worker' | 'pages' | 'd1' | 'automation' | 'external' | 'github';
  url: string | null;
  healthUrl: string | null;
  status: 'online' | 'degraded' | 'offline' | 'unknown';
  healthChecks?: number;
}

// API methods
export const api = {
  // GitHub
  github: {
    getRepos: () => fetchApi<GitHubRepo[]>('/api/github/repos'),
    getActivity: () => fetchApi<GitHubActivity[]>('/api/github/activity'),
    getRepoActivity: (owner: string, repo: string) =>
      fetchApi<{
        commits: unknown[];
        issues: unknown[];
        pullRequests: unknown[];
        workflowRuns: unknown[];
      }>(`/api/github/repos/${owner}/${repo}/activity`),
  },

  // Cloudflare
  cloudflare: {
    getResources: () =>
      fetchApi<{
        workers: CloudflareWorker[];
        pages: CloudflarePage[];
        d1: CloudflareD1[];
      }>('/api/cloudflare/resources'),
    getWorkers: () => fetchApi<CloudflareWorker[]>('/api/cloudflare/workers'),
    getPages: () => fetchApi<CloudflarePage[]>('/api/cloudflare/pages'),
    getD1: () => fetchApi<CloudflareD1[]>('/api/cloudflare/d1'),
    getDeployments: (project: string) =>
      fetchApi<unknown[]>(`/api/cloudflare/pages/${project}/deployments`),
  },

  // Health
  health: {
    getStatus: () => fetchApi<HealthStatusSummary>('/api/health/status'),
    getChecks: () => fetchApi<HealthCheck[]>('/api/health/checks'),
    getCheckHistory: (id: string) =>
      fetchApi<unknown[]>(`/api/health/checks/${id}/history`),
    triggerCheck: (id: string) =>
      fetchApi<unknown>(`/api/health/checks/${id}/trigger`, { method: 'POST' }),
    createCheck: (data: {
      projectId: string;
      name: string;
      url: string;
      method?: string;
      expectedStatus?: number;
    }) =>
      fetchApi<HealthCheck>('/api/health/checks', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deleteCheck: (id: string) =>
      fetchApi<void>(`/api/health/checks/${id}`, { method: 'DELETE' }),
  },

  // Projects
  projects: {
    list: () => fetchApi<Project[]>('/api/projects'),
    get: (id: string) => fetchApi<Project>(`/api/projects/${id}`),
    create: (data: {
      name: string;
      type: string;
      description?: string;
      url?: string;
      healthUrl?: string;
    }) =>
      fetchApi<Project>('/api/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchApi<void>(`/api/projects/${id}`, { method: 'DELETE' }),
  },

  // Controls
  controls: {
    triggerDeploy: (project: string) =>
      fetchApi<unknown>(`/api/controls/deploy/${project}`, { method: 'POST' }),
    purgeCache: (type: 'kv' | 'zone' | 'all', zoneId?: string, urls?: string[]) =>
      fetchApi<{ results: string[] }>('/api/controls/cache/purge', {
        method: 'POST',
        body: JSON.stringify({ type, zoneId, urls }),
      }),
    refresh: () =>
      fetchApi<{ message: string }>('/api/controls/refresh', { method: 'POST' }),
  },

  // Alerts
  alerts: {
    list: (limit?: number, unacknowledgedOnly?: boolean) => {
      const params = new URLSearchParams();
      if (limit) params.set('limit', String(limit));
      if (unacknowledgedOnly) params.set('unacknowledged', 'true');
      return fetchApi<Alert[]>(`/api/alerts?${params}`);
    },
    getCount: () =>
      fetchApi<{ count: number; critical: number; warning: number; info: number }>(
        '/api/alerts/unacknowledged/count'
      ),
    acknowledge: (id: string) =>
      fetchApi<void>(`/api/alerts/${id}/acknowledge`, { method: 'POST' }),
    acknowledgeAll: () =>
      fetchApi<{ acknowledged: number }>('/api/alerts/acknowledge-all', {
        method: 'POST',
      }),
    getFeed: (limit?: number) =>
      fetchApi<ActivityItem[]>(`/api/alerts/feed?limit=${limit || 30}`),
  },
};

export default api;
