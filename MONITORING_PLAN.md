# Tech Dashboard Monitoring Plan

## Overview

Transform the Jersey Bee Tech Dashboard from a Phase 1 authentication shell into a comprehensive monitoring and control center for GitHub repositories, Cloudflare resources, and deployed services.

**Target Capabilities:**
- Monitor GitHub organization repos + specific repositories
- Track Cloudflare Workers, Pages, and D1 databases
- Health checks for deployed services
- Full controls: trigger deploys, purge caches, view logs
- Activity feed and alerting system

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Tech Dashboard (Pages)                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────────┐  │
│  │ Repos   │  │ Services│  │ Activity│  │ Controls  │  │
│  │ Monitor │  │ Health  │  │ Feed    │  │ Panel     │  │
│  └────┬────┘  └────┬────┘  └────┬────┘  └─────┬─────┘  │
└───────┼────────────┼───────────┼──────────────┼────────┘
        │            │           │              │
        └────────────┴─────┬─────┴──────────────┘
                           │
                    ┌──────▼──────┐
                    │  Dashboard  │
                    │   Worker    │
                    │  (Backend)  │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌─────▼─────┐      ┌─────▼─────┐
   │ GitHub  │       │ Cloudflare│      │  Health   │
   │   API   │       │    API    │      │  Checks   │
   └─────────┘       └───────────┘      └───────────┘
```

**Why a Worker Backend?**
- Securely store API tokens (GitHub, Cloudflare)
- Proxy API requests without exposing credentials to browser
- Handle privileged operations (deploys, cache purges)
- Run scheduled health checks via cron triggers
- Store historical data in D1/KV

---

## Implementation Phases

### Phase 1: Backend Worker (Foundation)

**Goal:** Create `dashboard-api` Cloudflare Worker as the secure backend.

#### Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/github/repos` | GET | List org repos + specified repos |
| `/api/github/repos/:owner/:repo` | GET | Single repo details |
| `/api/github/activity` | GET | Recent commits, PRs, issues across repos |
| `/api/cloudflare/resources` | GET | List Workers, Pages, D1 databases |
| `/api/cloudflare/workers/:name` | GET | Worker details |
| `/api/cloudflare/pages/:project` | GET | Pages project details |
| `/api/cloudflare/deploy/:project` | POST | Trigger Pages deployment |
| `/api/cloudflare/purge-cache` | POST | Purge edge cache |
| `/api/health` | GET | Current health status of all services |
| `/api/health/history` | GET | Historical health data |
| `/api/health/check` | POST | Manually trigger health check |
| `/api/alerts` | GET | Active alerts |
| `/api/alerts/config` | GET/PUT | Alert threshold configuration |

#### Worker Secrets

```
GITHUB_TOKEN          # Personal access token or GitHub App token
CLOUDFLARE_API_TOKEN  # Account-level API token with appropriate scopes
CLOUDFLARE_ACCOUNT_ID # Your Cloudflare account ID
DASHBOARD_AUTH_SECRET # Shared secret for dashboard-to-worker auth
```

#### Required GitHub Token Scopes
- `repo` - Full repo access (for private repos)
- `read:org` - Read org membership
- `read:user` - Read user profile

#### Required Cloudflare Token Permissions
- Account: Workers Scripts (Read + Edit)
- Account: Cloudflare Pages (Read + Edit)
- Account: D1 (Read)
- Zone: Cache Purge (Purge)

#### Worker Project Structure

```
dashboard-api/
├── src/
│   ├── index.ts           # Main router
│   ├── routes/
│   │   ├── github.ts      # GitHub API handlers
│   │   ├── cloudflare.ts  # Cloudflare API handlers
│   │   ├── health.ts      # Health check handlers
│   │   └── alerts.ts      # Alert handlers
│   ├── services/
│   │   ├── github.ts      # GitHub API client
│   │   ├── cloudflare.ts  # Cloudflare API client
│   │   └── health.ts      # Health check logic
│   ├── middleware/
│   │   ├── auth.ts        # Dashboard auth verification
│   │   └── cors.ts        # CORS handling
│   └── types.ts           # TypeScript types
├── wrangler.toml          # Worker configuration
└── package.json
```

#### Cron Triggers

```toml
# wrangler.toml
[triggers]
crons = [
  "*/5 * * * *"  # Health checks every 5 minutes
]
```

---

### Phase 2: GitHub Monitoring

**Goal:** Display repository status, activity, and health indicators.

#### Features

- **Organization repos listing** - All repos under specified GitHub org(s)
- **Specific repos tracking** - Individual repos from any org
- **Activity feed** - Recent commits, PRs, issues, releases
- **Health indicators:**
  - Days since last commit (stale detection)
  - Open issues count with severity labels
  - CI/CD status (passing/failing)
  - Open PR count with review status
  - Vulnerability alerts (if enabled)

#### Dashboard Components

```
src/components/
├── github/
│   ├── RepoList.tsx       # Table/grid of monitored repos
│   ├── RepoCard.tsx       # Individual repo status card
│   ├── RepoDetails.tsx    # Expanded repo view
│   ├── ActivityFeed.tsx   # Timeline of GitHub events
│   ├── PullRequests.tsx   # PR list with status
│   ├── Issues.tsx         # Issues list
│   ├── CommitHistory.tsx  # Recent commits
│   └── GitHubFilters.tsx  # Filter by org, type, status
```

#### Data Types

```typescript
interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  default_branch: string;
  language: string | null;
  open_issues_count: number;
  pushed_at: string;
  updated_at: string;
  // Computed health indicators
  health: {
    status: 'healthy' | 'warning' | 'critical';
    daysSinceCommit: number;
    ciStatus: 'passing' | 'failing' | 'unknown';
    openPRs: number;
    stalePRs: number;
  };
}

interface GitHubActivity {
  id: string;
  type: 'push' | 'pr' | 'issue' | 'release' | 'review';
  repo: string;
  actor: string;
  timestamp: string;
  title: string;
  url: string;
  metadata: Record<string, any>;
}
```

---

### Phase 3: Cloudflare Resources

**Goal:** Monitor and manage Cloudflare infrastructure.

#### Features

- **Workers listing** - All Workers with deployment status
- **Pages projects** - Sites with last deployment info
- **D1 databases** - Database list with size metrics
- **Real-time status** - Live data from Cloudflare API
- **Quick actions** - Links to Cloudflare dashboard

#### Dashboard Components

```
src/components/
├── cloudflare/
│   ├── ResourceOverview.tsx  # Summary of all resources
│   ├── WorkersList.tsx       # Workers table
│   ├── WorkerCard.tsx        # Worker details + controls
│   ├── PagesList.tsx         # Pages projects table
│   ├── PagesCard.tsx         # Pages project details
│   ├── D1List.tsx            # D1 databases table
│   ├── D1Card.tsx            # Database details
│   └── DeploymentHistory.tsx # Recent deployments
```

#### Data Types

```typescript
interface CloudflareWorker {
  id: string;
  name: string;
  created_on: string;
  modified_on: string;
  routes: string[];
  usage_model: 'bundled' | 'unbound';
  // Computed
  lastDeployed: string;
  status: 'active' | 'inactive';
}

interface CloudflarePages {
  id: string;
  name: string;
  subdomain: string;
  domains: string[];
  source: {
    type: 'github';
    config: {
      owner: string;
      repo_name: string;
      production_branch: string;
    };
  };
  latest_deployment: {
    id: string;
    url: string;
    environment: string;
    created_on: string;
    deployment_trigger: {
      type: string;
      metadata: {
        branch: string;
        commit_hash: string;
        commit_message: string;
      };
    };
  };
}

interface CloudflareD1 {
  uuid: string;
  name: string;
  created_at: string;
  // From separate API call
  file_size: number;
  num_tables: number;
}
```

---

### Phase 4: Health Monitoring

**Goal:** Track uptime and performance of deployed services.

#### Features

- **Configurable URL list** - Add/remove monitored endpoints
- **Periodic health checks** - Worker cron every 5 minutes
- **Response time tracking** - Latency measurements
- **Status history** - Store results in D1
- **Degraded detection** - Slow responses flagged
- **Offline detection** - Failed requests tracked

#### Dashboard Components

```
src/components/
├── health/
│   ├── ServiceHealth.tsx     # Health status grid
│   ├── ServiceCard.tsx       # Individual service status
│   ├── UptimeGraph.tsx       # Sparkline/chart of uptime
│   ├── ResponseTimeChart.tsx # Latency over time
│   ├── IncidentHistory.tsx   # Past outages
│   └── HealthConfig.tsx      # Manage monitored URLs
```

#### Data Types

```typescript
interface MonitoredService {
  id: string;
  name: string;
  url: string;
  expectedStatusCode: number;
  timeout: number; // ms
  checkInterval: number; // minutes
  enabled: boolean;
}

interface HealthCheck {
  id: string;
  serviceId: string;
  timestamp: string;
  status: 'healthy' | 'degraded' | 'offline';
  responseTime: number | null; // ms
  statusCode: number | null;
  error: string | null;
}

interface ServiceStatus {
  service: MonitoredService;
  currentStatus: 'healthy' | 'degraded' | 'offline';
  lastCheck: HealthCheck;
  uptime24h: number; // percentage
  uptime7d: number;
  avgResponseTime: number;
  history: HealthCheck[]; // recent checks
}
```

#### Health Check Logic

```typescript
async function checkHealth(service: MonitoredService): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const response = await fetch(service.url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(service.timeout),
    });
    const responseTime = Date.now() - start;

    return {
      id: crypto.randomUUID(),
      serviceId: service.id,
      timestamp: new Date().toISOString(),
      status: responseTime > 2000 ? 'degraded' : 'healthy',
      responseTime,
      statusCode: response.status,
      error: null,
    };
  } catch (error) {
    return {
      id: crypto.randomUUID(),
      serviceId: service.id,
      timestamp: new Date().toISOString(),
      status: 'offline',
      responseTime: null,
      statusCode: null,
      error: error.message,
    };
  }
}
```

---

### Phase 5: Controls Panel

**Goal:** Execute actions on monitored resources.

#### Features

- **Trigger Pages rebuild** - POST to Cloudflare deploy hook
- **Purge cache** - Clear edge cache by URL or zone
- **View recent logs** - Tail Worker logs (limited)
- **Rollback deployment** - Revert to previous version
- **Confirmation dialogs** - Prevent accidental actions

#### Dashboard Components

```
src/components/
├── controls/
│   ├── ControlsPanel.tsx     # Main controls interface
│   ├── DeployButton.tsx      # Trigger deployment
│   ├── CachePurge.tsx        # Cache purge form
│   ├── LogViewer.tsx         # Real-time log tail
│   ├── DeployHistory.tsx     # Recent deployments
│   ├── RollbackDialog.tsx    # Rollback confirmation
│   └── ConfirmDialog.tsx     # Generic confirmation modal
```

#### API Actions

```typescript
// Trigger Pages deployment
POST /api/cloudflare/deploy/:project
Body: { branch?: string }

// Purge cache
POST /api/cloudflare/purge-cache
Body: {
  type: 'url' | 'prefix' | 'everything',
  urls?: string[],
  prefixes?: string[]
}

// Rollback (deploy previous version)
POST /api/cloudflare/rollback/:project
Body: { deploymentId: string }
```

---

### Phase 6: Activity & Alerts

**Goal:** Unified activity feed and proactive alerting.

#### Features

- **Unified activity feed** - All sources in one timeline
- **Error aggregation** - Group similar errors
- **Alert thresholds** - Configurable triggers
- **Visual notifications** - In-dashboard alerts
- **Webhook integration** - Optional Slack/email

#### Dashboard Components

```
src/components/
├── activity/
│   ├── UnifiedFeed.tsx       # Combined activity timeline
│   ├── ActivityItem.tsx      # Single activity entry
│   ├── ActivityFilters.tsx   # Filter by source/type
│   └── ActivitySearch.tsx    # Search activities
├── alerts/
│   ├── AlertBanner.tsx       # Top-of-page critical alerts
│   ├── NotificationCenter.tsx # Bell icon dropdown
│   ├── AlertSettings.tsx     # Configure thresholds
│   ├── AlertHistory.tsx      # Past alerts
│   └── WebhookConfig.tsx     # Slack/email setup
```

#### Alert Types

```typescript
interface Alert {
  id: string;
  type: 'health' | 'github' | 'cloudflare' | 'system';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  source: string;
  timestamp: string;
  acknowledged: boolean;
  resolvedAt: string | null;
}

interface AlertThreshold {
  id: string;
  name: string;
  condition: {
    metric: string;
    operator: 'gt' | 'lt' | 'eq';
    value: number;
    duration?: number; // minutes
  };
  severity: 'warning' | 'critical';
  enabled: boolean;
  webhooks: string[];
}
```

#### Default Alert Rules

| Alert | Condition | Severity |
|-------|-----------|----------|
| Service Offline | 3+ failed health checks | Critical |
| Service Degraded | Response time > 2s for 5 min | Warning |
| Repo Stale | No commits in 30 days | Info |
| CI Failing | Latest CI run failed | Warning |
| High Issue Count | > 10 open issues | Info |
| Deploy Failed | Cloudflare deploy error | Critical |

---

## Data Storage

### Cloudflare D1 Schema

```sql
-- Health check results
CREATE TABLE health_checks (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  status TEXT NOT NULL,
  response_time INTEGER,
  status_code INTEGER,
  error TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_health_service ON health_checks(service_id);
CREATE INDEX idx_health_timestamp ON health_checks(timestamp);

-- Monitored services
CREATE TABLE monitored_services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  expected_status_code INTEGER DEFAULT 200,
  timeout INTEGER DEFAULT 5000,
  check_interval INTEGER DEFAULT 5,
  enabled INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Alerts
CREATE TABLE alerts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  source TEXT,
  timestamp TEXT NOT NULL,
  acknowledged INTEGER DEFAULT 0,
  resolved_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_acknowledged ON alerts(acknowledged);

-- Alert thresholds
CREATE TABLE alert_thresholds (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  condition_json TEXT NOT NULL,
  severity TEXT NOT NULL,
  enabled INTEGER DEFAULT 1,
  webhooks_json TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Activity log (for caching)
CREATE TABLE activity_cache (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  type TEXT NOT NULL,
  data_json TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_source ON activity_cache(source);
CREATE INDEX idx_activity_timestamp ON activity_cache(timestamp);
```

### Cloudflare KV Usage

```
Key Pattern                    | Value | TTL
-------------------------------|-------|--------
github:repos:{org}             | JSON  | 5 min
github:activity:{repo}         | JSON  | 2 min
cloudflare:workers             | JSON  | 5 min
cloudflare:pages               | JSON  | 5 min
cloudflare:d1                  | JSON  | 10 min
health:current                 | JSON  | 1 min
```

---

## Dashboard Navigation Update

### New Routes

```typescript
// App.tsx routes
<Route path="/" element={<Dashboard />} />
<Route path="/repos" element={<Repositories />} />
<Route path="/repos/:owner/:repo" element={<RepoDetails />} />
<Route path="/cloudflare" element={<CloudflareResources />} />
<Route path="/cloudflare/workers/:name" element={<WorkerDetails />} />
<Route path="/cloudflare/pages/:project" element={<PagesDetails />} />
<Route path="/health" element={<ServiceHealth />} />
<Route path="/activity" element={<ActivityFeed />} />
<Route path="/controls" element={<ControlsPanel />} />
<Route path="/alerts" element={<AlertCenter />} />
<Route path="/settings" element={<Settings />} />
```

### Updated Sidebar

```
Dashboard (Overview)
├── Repositories
│   ├── All Repos
│   ├── By Organization
│   └── Issues & PRs
├── Infrastructure
│   ├── Workers
│   ├── Pages
│   └── D1 Databases
├── Monitoring
│   ├── Service Health
│   └── Uptime History
├── Activity Feed
├── Controls
│   ├── Deployments
│   └── Cache Management
├── Alerts
│   ├── Active
│   └── History
└── Settings
    ├── Monitored Services
    └── Alert Thresholds
```

---

## Implementation Checklist

### Phase 1: Backend Worker
- [ ] Create Worker project with wrangler
- [ ] Set up routing with itty-router or Hono
- [ ] Implement auth middleware
- [ ] Add CORS configuration
- [ ] Create GitHub API client
- [ ] Create Cloudflare API client
- [ ] Set up D1 database with schema
- [ ] Configure KV namespace
- [ ] Deploy Worker

### Phase 2: GitHub Monitoring
- [ ] `/api/github/repos` endpoint
- [ ] `/api/github/activity` endpoint
- [ ] RepoList component
- [ ] RepoCard component
- [ ] ActivityFeed component
- [ ] Health indicators logic
- [ ] Add to dashboard navigation

### Phase 3: Cloudflare Resources
- [ ] `/api/cloudflare/resources` endpoint
- [ ] ResourceOverview component
- [ ] WorkersList component
- [ ] PagesList component
- [ ] D1List component
- [ ] Add to dashboard navigation

### Phase 4: Health Monitoring
- [ ] `/api/health` endpoints
- [ ] Cron trigger for checks
- [ ] Health check logic
- [ ] D1 storage for history
- [ ] ServiceHealth component
- [ ] UptimeGraph component
- [ ] HealthConfig component

### Phase 5: Controls Panel
- [ ] Deploy endpoint
- [ ] Cache purge endpoint
- [ ] ControlsPanel component
- [ ] DeployButton component
- [ ] CachePurge component
- [ ] Confirmation dialogs

### Phase 6: Activity & Alerts
- [ ] Alert detection logic
- [ ] Alert endpoints
- [ ] UnifiedFeed component
- [ ] AlertBanner component
- [ ] NotificationCenter component
- [ ] AlertSettings component
- [ ] Webhook integration

---

## Environment Variables

### Dashboard (Vite)
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_API_URL=https://dashboard-api.your-domain.workers.dev
VITE_API_AUTH_SECRET=shared-secret-with-worker
```

### Worker (wrangler.toml secrets)
```
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
CLOUDFLARE_API_TOKEN=xxxxxxxx
CLOUDFLARE_ACCOUNT_ID=xxxxxxxx
DASHBOARD_AUTH_SECRET=shared-secret-with-dashboard
```

---

## Estimated Component Count

| Category | New Components | New Endpoints |
|----------|---------------|---------------|
| GitHub | 8 | 3 |
| Cloudflare | 7 | 5 |
| Health | 6 | 4 |
| Controls | 6 | 3 |
| Activity/Alerts | 8 | 4 |
| **Total** | **35** | **19** |

---

## Next Steps

When ready to implement:

1. **Start with Worker** - Foundation for all API calls
2. **Add GitHub integration** - Most visible value quickly
3. **Build incrementally** - One phase at a time
4. **Test each phase** - Before moving to next

This plan can be executed in stages. Each phase delivers standalone value while building toward the complete monitoring dashboard.
