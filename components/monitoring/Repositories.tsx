import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { GitHubRepo, GitHubActivity } from '../../services/api';

// Calculate health status on frontend if not provided by backend
function calculateHealth(repo: Partial<GitHubRepo>): GitHubRepo['health'] {
  const pushedAt = repo.pushed_at ? new Date(repo.pushed_at) : new Date();
  const daysSinceCommit = Math.floor(
    (Date.now() - pushedAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  const openIssues = repo.open_issues_count || 0;

  let status: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (daysSinceCommit > 90) {
    status = 'critical';
  } else if (daysSinceCommit > 30 || openIssues > 10) {
    status = 'warning';
  }

  return {
    status,
    daysSinceCommit,
    ciStatus: 'unknown' as const,
    openIssues,
    openPRs: 0,
  };
}

const StatusBadge: React.FC<{ status: 'healthy' | 'warning' | 'critical' }> = ({
  status,
}) => {
  const colors = {
    healthy: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>
      {status}
    </span>
  );
};

const CIBadge: React.FC<{ status: 'passing' | 'failing' | 'unknown' }> = ({
  status,
}) => {
  const colors = {
    passing: 'text-green-600',
    failing: 'text-red-600',
    unknown: 'text-gray-400',
  };

  const icons = {
    passing: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    failing: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    unknown: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    ),
  };

  return <span className={colors[status]}>{icons[status]}</span>;
};

const RepoCard: React.FC<{ repo: GitHubRepo }> = ({ repo }) => {
  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return `${diffMins}m ago`;
      }
      return `${diffHours}h ago`;
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold text-gray-900 hover:text-yellow-600 truncate"
            >
              {repo.name}
            </a>
            <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded">
              {repo.visibility}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {repo.description || 'No description'}
          </p>
        </div>
        <StatusBadge status={repo.health.status} />
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
        {repo.language && (
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <CIBadge status={repo.health.ciStatus} />
          CI
        </span>
        <span>{repo.open_issues_count} issues</span>
        <span>{repo.health.openPRs} PRs</span>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
        <span>Last push: {formatDate(repo.pushed_at)}</span>
        <span>{repo.health.daysSinceCommit}d since commit</span>
      </div>
    </div>
  );
};

const ActivityItem: React.FC<{ activity: GitHubActivity }> = ({ activity }) => {
  const typeIcons = {
    push: '📤',
    pr: '🔀',
    issue: '📋',
    release: '🏷️',
    workflow: '⚙️',
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <span className="text-lg">{typeIcons[activity.type]}</span>
      <div className="flex-1 min-w-0">
        <a
          href={activity.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-gray-900 hover:text-yellow-600 line-clamp-1"
        >
          {activity.title}
        </a>
        <p className="text-xs text-gray-500 mt-0.5">
          {activity.repo.split('/')[1]} • {activity.actor}
        </p>
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">
        {formatTime(activity.timestamp)}
      </span>
    </div>
  );
};

const Repositories: React.FC = () => {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [activity, setActivity] = useState<GitHubActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'healthy' | 'warning' | 'critical'>('all');

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch repos from the real API
        const reposData = await api.github.getRepos();

        // Ensure each repo has health data (calculate if missing)
        const reposWithHealth = reposData.map((repo) => ({
          ...repo,
          health: repo.health || calculateHealth(repo),
        }));

        setRepos(reposWithHealth);

        // Try to fetch activity, but don't fail if it errors
        try {
          const activityData = await api.github.getActivity();
          setActivity(activityData);
        } catch (activityError) {
          console.warn('Failed to fetch activity:', activityError);
          setActivity([]);
        }
      } catch (err) {
        console.error('Failed to fetch repos:', err);
        setError(err instanceof Error ? err.message : 'Failed to load repositories');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredRepos = repos.filter((repo) => {
    if (filter === 'all') return true;
    return repo.health.status === filter;
  });

  const stats = {
    total: repos.length,
    healthy: repos.filter((r) => r.health.status === 'healthy').length,
    warning: repos.filter((r) => r.health.status === 'warning').length,
    critical: repos.filter((r) => r.health.status === 'critical').length,
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load repositories</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-yellow-500 text-gray-900 font-medium rounded-lg hover:bg-yellow-400 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Repositories</h1>
          <p className="text-gray-600 mt-1">
            Monitor GitHub repositories for The-Jersey-Bee
          </p>
        </div>
        <a
          href="https://github.com/The-Jersey-Bee"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          View on GitHub
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div
          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
            filter === 'all' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setFilter('all')}
        >
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Repos</p>
        </div>
        <div
          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
            filter === 'healthy' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setFilter('healthy')}
        >
          <p className="text-2xl font-bold text-green-600">{stats.healthy}</p>
          <p className="text-sm text-gray-600">Healthy</p>
        </div>
        <div
          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
            filter === 'warning' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setFilter('warning')}
        >
          <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
          <p className="text-sm text-gray-600">Warning</p>
        </div>
        <div
          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
            filter === 'critical' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setFilter('critical')}
        >
          <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
          <p className="text-sm text-gray-600">Critical</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Repos Grid */}
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {filter === 'all' ? 'All Repositories' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Repositories`}
          </h2>
          <div className="grid gap-4">
            {filteredRepos.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
            {filteredRepos.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No repositories found with {filter} status
              </p>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            {activity.map((item) => (
              <ActivityItem key={item.id} activity={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Repositories;
