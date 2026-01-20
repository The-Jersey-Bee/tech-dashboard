import React, { useState, useEffect } from 'react';
import { mockActivityFeed, mockAlerts } from '../../services/mockData';
import type { ActivityItem, Alert } from '../../services/api';

const AlertBadge: React.FC<{ severity: 'info' | 'warning' | 'critical' }> = ({
  severity,
}) => {
  const colors = {
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${colors[severity]}`}>
      {severity}
    </span>
  );
};

const ActivityItemCard: React.FC<{ item: ActivityItem }> = ({ item }) => {
  const typeIcons: Record<string, React.ReactNode> = {
    github: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
    cloudflare: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16.5088 16.8447C16.6288 16.4356 16.5765 16.0617 16.3547 15.7851C16.1558 15.5375 15.8401 15.3993 15.4618 15.3993H8.02913C7.94633 15.3993 7.88124 15.3634 7.85071 15.3003C7.82019 15.2463 7.82019 15.1741 7.85071 15.1021L8.22904 14.0957C8.31184 13.8672 8.51073 13.7109 8.73963 13.7109H15.9084C16.9165 13.7109 17.8226 13.2017 18.2919 12.3748C18.4137 12.1552 18.5126 11.9177 18.5863 11.6622L19.0236 10.2102C19.1073 9.93366 19.0327 9.63118 18.8384 9.42869C18.6441 9.2262 18.3629 9.14679 18.0925 9.21911L17.0203 9.49468C16.8794 9.53348 16.7476 9.45406 16.708 9.31275L15.8674 6.51293C15.7756 6.2364 15.5497 6.02551 15.2747 5.95678C15.0039 5.88805 14.7167 5.9683 14.5224 6.17021L10.9264 9.8912C10.7821 10.0424 10.5705 10.1127 10.3598 10.0748L6.99151 9.45867C6.72055 9.4028 6.43927 9.4948 6.24585 9.70471C6.05242 9.91462 5.97701 10.2099 6.04181 10.4889L6.99151 14.5227C7.03866 14.7189 6.97866 14.9247 6.8332 15.0706L4.02384 17.9058C3.83042 18.1037 3.76209 18.3927 3.84299 18.6581C3.92389 18.9235 4.14147 19.1236 4.40866 19.1845L12.3626 20.9583C12.5133 20.9925 12.6713 20.9583 12.7958 20.8633L15.1846 19.0886C15.3089 18.9936 15.3934 18.8539 15.4192 18.6969L16.5088 16.8447Z" />
      </svg>
    ),
    health: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    alert: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    deploy: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
  };

  const typeColors: Record<string, string> = {
    github: 'bg-gray-100 text-gray-600',
    cloudflare: 'bg-orange-100 text-orange-600',
    health: 'bg-green-100 text-green-600',
    alert: 'bg-red-100 text-red-600',
    deploy: 'bg-blue-100 text-blue-600',
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
    <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[item.type]}`}>
        {typeIcons[item.type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            {item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gray-900 hover:text-yellow-600"
              >
                {item.title}
              </a>
            ) : (
              <p className="font-medium text-gray-900">{item.title}</p>
            )}
            <p className="text-sm text-gray-600 mt-0.5">{item.description}</p>
            <p className="text-xs text-gray-400 mt-1">{item.source}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {formatTime(item.timestamp)}
            </span>
            {item.severity && <AlertBadge severity={item.severity} />}
          </div>
        </div>
      </div>
    </div>
  );
};

const AlertCard: React.FC<{ alert: Alert; onAcknowledge: () => void }> = ({
  alert,
  onAcknowledge,
}) => {
  const severityColors = {
    info: 'border-blue-200 bg-blue-50',
    warning: 'border-yellow-200 bg-yellow-50',
    critical: 'border-red-200 bg-red-50',
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`rounded-lg border p-4 ${severityColors[alert.severity]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <AlertBadge severity={alert.severity} />
            <span className="text-xs text-gray-500">{formatTime(alert.createdAt)}</span>
          </div>
          <h3 className="font-medium text-gray-900 mt-2">{alert.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
        </div>
        {!alert.acknowledged && (
          <button
            onClick={onAcknowledge}
            className="text-sm text-gray-500 hover:text-gray-700 p-1"
            title="Acknowledge"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

const ActivityFeed: React.FC = () => {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'alerts'>('feed');

  useEffect(() => {
    // Simulate API call - in production, use api.alerts.getFeed() and api.alerts.list()
    setTimeout(() => {
      setActivity(mockActivityFeed);
      setAlerts(mockAlerts);
      setLoading(false);
    }, 500);
  }, []);

  const handleAcknowledge = (alertId: string) => {
    // In production, call api.alerts.acknowledge(alertId)
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  const handleAcknowledgeAll = () => {
    // In production, call api.alerts.acknowledgeAll()
    setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
  };

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity & Alerts</h1>
          <p className="text-gray-600 mt-1">
            Recent events and system notifications
          </p>
        </div>
        {unacknowledgedAlerts.length > 0 && (
          <button
            onClick={handleAcknowledgeAll}
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Acknowledge All ({unacknowledgedAlerts.length})
          </button>
        )}
      </div>

      {/* Alert Summary */}
      {unacknowledgedAlerts.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-red-800">
                {unacknowledgedAlerts.length} unacknowledged alert{unacknowledgedAlerts.length > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-red-600">
                {unacknowledgedAlerts.filter((a) => a.severity === 'critical').length} critical,{' '}
                {unacknowledgedAlerts.filter((a) => a.severity === 'warning').length} warning
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('feed')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'feed'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Activity Feed
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'alerts'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Alerts
            {unacknowledgedAlerts.length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                {unacknowledgedAlerts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'feed' ? (
        <div className="bg-white rounded-lg border border-gray-200">
          {activity.map((item) => (
            <ActivityItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No alerts</p>
          ) : (
            alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAcknowledge={() => handleAcknowledge(alert.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
