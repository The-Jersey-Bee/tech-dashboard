import React, { useState, useEffect } from 'react';
import { mockHealthChecks, mockHealthStatus } from '../../services/mockData';
import type { HealthCheck, HealthStatusSummary } from '../../services/api';

const StatusIndicator: React.FC<{
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  size?: 'sm' | 'md' | 'lg';
}> = ({ status, size = 'md' }) => {
  const colors = {
    healthy: 'bg-green-500',
    degraded: 'bg-yellow-500',
    down: 'bg-red-500',
    unknown: 'bg-gray-400',
  };

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <span className="relative flex items-center">
      <span className={`${sizes[size]} ${colors[status]} rounded-full`}></span>
      {status === 'healthy' && (
        <span className={`absolute ${sizes[size]} ${colors[status]} rounded-full animate-ping opacity-75`}></span>
      )}
    </span>
  );
};

const HealthCheckCard: React.FC<{
  check: HealthCheck;
  onTrigger: () => void;
}> = ({ check, onTrigger }) => {
  const result = check.latestResult;
  const status = result?.status || 'unknown';

  const formatResponseTime = (ms: number | null) => {
    if (ms === null) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <StatusIndicator status={status} size="lg" />
          <div>
            <h3 className="font-semibold text-gray-900">{check.name}</h3>
            <a
              href={check.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 truncate block max-w-[200px]"
            >
              {check.url}
            </a>
          </div>
        </div>
        <button
          onClick={onTrigger}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Trigger check"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {result && (
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Response Time</p>
            <p className={`font-medium ${
              (result.responseTime || 0) > 2000 ? 'text-yellow-600' : 'text-gray-900'
            }`}>
              {formatResponseTime(result.responseTime)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Status Code</p>
            <p className="font-medium text-gray-900">
              {result.statusCode || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Last Check</p>
            <p className="font-medium text-gray-900">
              {formatDate(result.checkedAt)}
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>{check.method} • Expected: {check.expectedStatus}</span>
        <span className={check.enabled ? 'text-green-600' : 'text-gray-400'}>
          {check.enabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>
    </div>
  );
};

const StatusSummaryCard: React.FC<{
  summary: HealthStatusSummary;
}> = ({ summary }) => {
  const total = summary.totalChecks;
  const healthyPercent = total > 0 ? (summary.healthy / total) * 100 : 0;
  const degradedPercent = total > 0 ? (summary.degraded / total) * 100 : 0;
  const downPercent = total > 0 ? (summary.down / total) * 100 : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>

      {/* Progress Bar */}
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex mb-4">
        <div
          className="bg-green-500 transition-all duration-500"
          style={{ width: `${healthyPercent}%` }}
        ></div>
        <div
          className="bg-yellow-500 transition-all duration-500"
          style={{ width: `${degradedPercent}%` }}
        ></div>
        <div
          className="bg-red-500 transition-all duration-500"
          style={{ width: `${downPercent}%` }}
        ></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{summary.totalChecks}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{summary.healthy}</p>
          <p className="text-xs text-gray-500">Healthy</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-600">{summary.degraded}</p>
          <p className="text-xs text-gray-500">Degraded</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">{summary.down}</p>
          <p className="text-xs text-gray-500">Down</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        Last updated: {new Date(summary.lastUpdated).toLocaleTimeString()}
      </p>
    </div>
  );
};

const HealthMonitoring: React.FC = () => {
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [summary, setSummary] = useState<HealthStatusSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCheck, setNewCheck] = useState({
    name: '',
    url: '',
    method: 'GET',
    expectedStatus: 200,
  });

  useEffect(() => {
    // Simulate API call - in production, use api.health.getChecks()
    setTimeout(() => {
      setChecks(mockHealthChecks);
      setSummary(mockHealthStatus);
      setLoading(false);
    }, 500);
  }, []);

  const handleTriggerCheck = (checkId: string) => {
    // In production, call api.health.triggerCheck(checkId)
    console.log('Triggering check:', checkId);
  };

  const handleAddCheck = () => {
    // In production, call api.health.createCheck(newCheck)
    console.log('Adding check:', newCheck);
    setShowAddModal(false);
    setNewCheck({ name: '', url: '', method: 'GET', expectedStatus: 200 });
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Monitoring</h1>
          <p className="text-gray-600 mt-1">
            Monitor service health and uptime
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Monitor
        </button>
      </div>

      {/* Summary */}
      {summary && <StatusSummaryCard summary={summary} />}

      {/* Health Checks */}
      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">
        Monitored Services
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {checks.map((check) => (
          <HealthCheckCard
            key={check.id}
            check={check}
            onTrigger={() => handleTriggerCheck(check.id)}
          />
        ))}
      </div>

      {/* Add Monitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add Health Monitor
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newCheck.name}
                  onChange={(e) => setNewCheck({ ...newCheck, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="My Service"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={newCheck.url}
                  onChange={(e) => setNewCheck({ ...newCheck, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="https://example.com/health"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Method
                  </label>
                  <select
                    value={newCheck.method}
                    onChange={(e) => setNewCheck({ ...newCheck, method: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="GET">GET</option>
                    <option value="HEAD">HEAD</option>
                    <option value="POST">POST</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Status
                  </label>
                  <input
                    type="number"
                    value={newCheck.expectedStatus}
                    onChange={(e) =>
                      setNewCheck({ ...newCheck, expectedStatus: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCheck}
                className="px-4 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
              >
                Add Monitor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthMonitoring;
