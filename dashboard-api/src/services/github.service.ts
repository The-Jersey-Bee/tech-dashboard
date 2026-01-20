import type {
  GitHubRepo,
  GitHubWorkflow,
  GitHubWorkflowRun,
  GitHubCommit,
  GitHubIssue,
  GitHubPullRequest,
  GitHubActivity,
  RepoHealth,
  GitHubRepoWithHealth,
} from '../types/github';

const GITHUB_API = 'https://api.github.com';

export class GitHubService {
  constructor(
    private token: string,
    private org: string
  ) {}

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${GITHUB_API}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Jersey-Bee-Dashboard',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  async listRepos(): Promise<GitHubRepo[]> {
    const repos = await this.fetch<GitHubRepo[]>(
      `/orgs/${this.org}/repos?sort=updated&per_page=100`
    );
    return repos.filter((r) => !r.archived);
  }

  async getRepo(owner: string, repo: string): Promise<GitHubRepo> {
    return this.fetch<GitHubRepo>(`/repos/${owner}/${repo}`);
  }

  async listReposWithHealth(): Promise<GitHubRepoWithHealth[]> {
    const repos = await this.listRepos();
    const reposWithHealth: GitHubRepoWithHealth[] = [];

    for (const repo of repos) {
      const health = await this.calculateRepoHealth(repo);
      reposWithHealth.push({ ...repo, health });
    }

    return reposWithHealth;
  }

  private async calculateRepoHealth(repo: GitHubRepo): Promise<RepoHealth> {
    const daysSinceCommit = Math.floor(
      (Date.now() - new Date(repo.pushed_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    let ciStatus: RepoHealth['ciStatus'] = 'unknown';
    try {
      const runs = await this.getWorkflowRuns(this.org, repo.name, 1);
      if (runs.length > 0) {
        ciStatus = runs[0].conclusion === 'success' ? 'passing' : 'failing';
      }
    } catch {
      // CI status unknown
    }

    let openPRs = 0;
    try {
      const prs = await this.getPullRequests(this.org, repo.name);
      openPRs = prs.filter((pr) => pr.state === 'open').length;
    } catch {
      // PRs unknown
    }

    let status: RepoHealth['status'] = 'healthy';
    if (daysSinceCommit > 90 || ciStatus === 'failing') {
      status = 'critical';
    } else if (daysSinceCommit > 30 || repo.open_issues_count > 10) {
      status = 'warning';
    }

    return {
      status,
      daysSinceCommit,
      ciStatus,
      openIssues: repo.open_issues_count,
      openPRs,
    };
  }

  async getWorkflows(owner: string, repo: string): Promise<GitHubWorkflow[]> {
    const response = await this.fetch<{ workflows: GitHubWorkflow[] }>(
      `/repos/${owner}/${repo}/actions/workflows`
    );
    return response.workflows;
  }

  async getWorkflowRuns(
    owner: string,
    repo: string,
    perPage = 10
  ): Promise<GitHubWorkflowRun[]> {
    const response = await this.fetch<{ workflow_runs: GitHubWorkflowRun[] }>(
      `/repos/${owner}/${repo}/actions/runs?per_page=${perPage}`
    );
    return response.workflow_runs;
  }

  async getCommits(
    owner: string,
    repo: string,
    perPage = 10
  ): Promise<GitHubCommit[]> {
    return this.fetch<GitHubCommit[]>(
      `/repos/${owner}/${repo}/commits?per_page=${perPage}`
    );
  }

  async getIssues(owner: string, repo: string): Promise<GitHubIssue[]> {
    return this.fetch<GitHubIssue[]>(
      `/repos/${owner}/${repo}/issues?state=all&per_page=30`
    );
  }

  async getPullRequests(
    owner: string,
    repo: string
  ): Promise<GitHubPullRequest[]> {
    return this.fetch<GitHubPullRequest[]>(
      `/repos/${owner}/${repo}/pulls?state=all&per_page=30`
    );
  }

  async getOrgActivity(perPage = 50): Promise<GitHubActivity[]> {
    const repos = await this.listRepos();
    const activities: GitHubActivity[] = [];

    // Get recent activity from top 5 most recently updated repos
    const recentRepos = repos.slice(0, 5);

    for (const repo of recentRepos) {
      try {
        // Get recent commits
        const commits = await this.getCommits(this.org, repo.name, 5);
        for (const commit of commits) {
          activities.push({
            id: `commit-${commit.sha}`,
            type: 'push',
            repo: repo.full_name,
            actor: commit.author?.login || commit.commit.author.name,
            actorAvatar:
              commit.author?.avatar_url ||
              'https://github.com/identicons/default.png',
            title: commit.commit.message.split('\n')[0],
            url: commit.html_url,
            timestamp: commit.commit.author.date,
          });
        }

        // Get recent workflow runs
        const runs = await this.getWorkflowRuns(this.org, repo.name, 3);
        for (const run of runs) {
          activities.push({
            id: `workflow-${run.id}`,
            type: 'workflow',
            repo: repo.full_name,
            actor: 'GitHub Actions',
            actorAvatar: 'https://github.com/github.png',
            title: `${run.name}: ${run.conclusion || run.status}`,
            url: run.html_url,
            timestamp: run.created_at,
            metadata: { conclusion: run.conclusion, status: run.status },
          });
        }
      } catch {
        // Skip repos with errors
      }
    }

    // Sort by timestamp and limit
    return activities
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, perPage);
  }

  async getRepoActivity(
    owner: string,
    repo: string
  ): Promise<{
    commits: GitHubCommit[];
    issues: GitHubIssue[];
    pullRequests: GitHubPullRequest[];
    workflowRuns: GitHubWorkflowRun[];
  }> {
    const [commits, issues, pullRequests, workflowRuns] = await Promise.all([
      this.getCommits(owner, repo, 10),
      this.getIssues(owner, repo),
      this.getPullRequests(owner, repo),
      this.getWorkflowRuns(owner, repo, 10),
    ]);

    return { commits, issues, pullRequests, workflowRuns };
  }
}
