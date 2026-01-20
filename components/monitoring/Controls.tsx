import React, { useState } from 'react';
import { mockCloudflarePages } from '../../services/mockData';

const Controls: React.FC = () => {
  const [deploying, setDeploying] = useState<string | null>(null);
  const [purging, setPurging] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deployLogs, setDeployLogs] = useState<
    Array<{ project: string; status: string; timestamp: Date }>
  >([]);

  const handleDeploy = async (project: string) => {
    setDeploying(project);
    // In production, call api.controls.triggerDeploy(project)
    setTimeout(() => {
      setDeployLogs((prev) => [
        { project, status: 'success', timestamp: new Date() },
        ...prev,
      ]);
      setDeploying(null);
    }, 2000);
  };

  const handlePurgeCache = async (type: 'kv' | 'all') => {
    setPurging(true);
    // In production, call api.controls.purgeCache(type)
    setTimeout(() => {
      setDeployLogs((prev) => [
        { project: `Cache purge (${type})`, status: 'success', timestamp: new Date() },
        ...prev,
      ]);
      setPurging(false);
    }, 1500);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // In production, call api.controls.refresh()
    setTimeout(() => {
      setDeployLogs((prev) => [
        { project: 'Cache refresh', status: 'success', timestamp: new Date() },
        ...prev,
      ]);
      setRefreshing(false);
    }, 1000);
  };

  const pages = mockCloudflarePages;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Controls</h1>
        <p className="text-gray-600 mt-1">
          Manage deployments, cache, and system operations
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Deployments */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Trigger Deployment
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Manually trigger a new deployment for Pages projects
          </p>

          <div className="space-y-3">
            {pages.map((page) => (
              <div
                key={page.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{page.name}</p>
                  <p className="text-xs text-gray-500">{page.production_branch}</p>
                </div>
                <button
                  onClick={() => handleDeploy(page.name)}
                  disabled={deploying === page.name}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    deploying === page.name
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {deploying === page.name ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Deploying...
                    </span>
                  ) : (
                    'Deploy'
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cache Management */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Cache Management
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Clear cached data to force fresh fetches
          </p>

          <div className="space-y-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                refreshing
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? 'Refreshing...' : 'Refresh API Cache'}
            </button>

            <button
              onClick={() => handlePurgeCache('kv')}
              disabled={purging}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                purging
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              {purging ? 'Purging...' : 'Purge KV Cache'}
            </button>

            <button
              onClick={() => handlePurgeCache('all')}
              disabled={purging}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                purging
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {purging ? 'Purging...' : 'Purge All Caches'}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Actions */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Actions</h2>
        {deployLogs.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No recent actions. Actions you perform will appear here.
          </p>
        ) : (
          <div className="space-y-2">
            {deployLogs.map((log, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      log.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  ></span>
                  <span className="text-sm text-gray-900">{log.project}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {log.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Warning */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Use with caution</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Deployments and cache purges can affect production services. Make sure you understand
              the implications before proceeding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;
