export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string;
  updated_at: string;
  created_at: string;
  default_branch: string;
  visibility: 'public' | 'private';
  topics: string[];
  archived: boolean;
}

export interface GitHubWorkflow {
  id: number;
  name: string;
  state: 'active' | 'disabled_manually' | 'disabled_inactivity';
  path: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubWorkflowRun {
  id: number;
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | null;
  workflow_id: number;
  html_url: string;
  created_at: string;
  updated_at: string;
  head_branch: string;
  head_sha: string;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  html_url: string;
  author: {
    login: string;
    avatar_url: string;
  } | null;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  html_url: string;
  created_at: string;
  updated_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
  labels: Array<{
    name: string;
    color: string;
  }>;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  html_url: string;
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  user: {
    login: string;
    avatar_url: string;
  };
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
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
  metadata?: Record<string, unknown>;
}

export interface RepoHealth {
  status: 'healthy' | 'warning' | 'critical';
  daysSinceCommit: number;
  ciStatus: 'passing' | 'failing' | 'unknown';
  openIssues: number;
  openPRs: number;
}

export interface GitHubRepoWithHealth extends GitHubRepo {
  health: RepoHealth;
}
