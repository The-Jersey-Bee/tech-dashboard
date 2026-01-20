-- Health checks configuration
CREATE TABLE IF NOT EXISTS health_checks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  method TEXT DEFAULT 'GET' CHECK(method IN ('GET', 'POST', 'HEAD')),
  expected_status INTEGER DEFAULT 200,
  timeout INTEGER DEFAULT 10000,
  interval INTEGER DEFAULT 300,
  enabled INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_health_checks_project ON health_checks(project_id);
CREATE INDEX IF NOT EXISTS idx_health_checks_enabled ON health_checks(enabled);

-- Health check results history
CREATE TABLE IF NOT EXISTS health_results (
  id TEXT PRIMARY KEY,
  check_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('healthy', 'degraded', 'down', 'unknown')),
  response_time INTEGER,
  status_code INTEGER,
  error TEXT,
  checked_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (check_id) REFERENCES health_checks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_health_results_check ON health_results(check_id, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_results_status ON health_results(status);
