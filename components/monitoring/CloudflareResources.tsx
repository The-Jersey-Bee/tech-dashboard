import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type {
  CloudflareWorker,
  CloudflarePage,
  CloudflareD1,
} from '../../services/api';

const WorkerCard: React.FC<{ worker: CloudflareWorker }> = ({ worker }) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{worker.name}</h3>
            <p className="text-xs text-gray-500">Worker</p>
          </div>
        </div>
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Active
        </span>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>Last modified: {formatDate(worker.modified_on)}</p>
        <p className="text-xs text-gray-400 mt-1">
          Created: {formatDate(worker.created_on)}
        </p>
      </div>
    </div>
  );
};

const PagesCard: React.FC<{ page: CloudflarePage }> = ({ page }) => {
  const deployment = page.latest_deployment;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    if (status === 'success') return 'bg-green-100 text-green-800';
    if (status === 'failure') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{page.name}</h3>
            <p className="text-xs text-gray-500">Pages</p>
          </div>
        </div>
        {deployment && (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(deployment.latest_stage.status)}`}>
            {deployment.latest_stage.status}
          </span>
        )}
      </div>

      {page.domains.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-1">Domains:</p>
          <div className="flex flex-wrap gap-1">
            {page.domains.map((domain) => (
              <a
                key={domain}
                href={`https://${domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded"
              >
                {domain}
              </a>
            ))}
          </div>
        </div>
      )}

      {deployment && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
          <p className="truncate" title={deployment.deployment_trigger.metadata.commit_message}>
            {deployment.deployment_trigger.metadata.commit_message}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {deployment.deployment_trigger.metadata.branch} • {formatDate(deployment.created_on)}
          </p>
        </div>
      )}
    </div>
  );
};

const D1Card: React.FC<{ db: CloudflareD1 }> = ({ db }) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{db.name}</h3>
            <p className="text-xs text-gray-500">D1 Database</p>
          </div>
        </div>
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Active
        </span>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p className="text-xs text-gray-400">
          Created: {formatDate(db.created_at)}
        </p>
        <p className="text-xs font-mono text-gray-400 mt-1 truncate" title={db.uuid}>
          {db.uuid}
        </p>
      </div>
    </div>
  );
};

const CloudflareResources: React.FC = () => {
  const [workers, setWorkers] = useState<CloudflareWorker[]>([]);
  const [pages, setPages] = useState<CloudflarePage[]>([]);
  const [d1Databases, setD1Databases] = useState<CloudflareD1[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'workers' | 'pages' | 'd1'>('all');

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const resources = await api.cloudflare.getResources();

        // Map API response to component expected format
        const mappedWorkers: CloudflareWorker[] = (resources.workers || []).map((w: Record<string, unknown>) => ({
          id: w.id as string,
          name: w.id as string, // API returns id as the name
          created_on: w.created_on as string,
          modified_on: w.modified_on as string,
        }));

        const mappedPages: CloudflarePage[] = (resources.pages || []).map((p: Record<string, unknown>) => ({
          id: p.name as string,
          name: p.name as string,
          subdomain: p.subdomain as string || '',
          domains: (p.domains as string[]) || [],
          production_branch: p.production_branch as string || 'main',
          latest_deployment: p.latest_deployment as CloudflarePage['latest_deployment'],
        }));

        const mappedD1: CloudflareD1[] = (resources.d1 || []).map((d: Record<string, unknown>) => ({
          uuid: d.uuid as string,
          name: d.name as string,
          created_at: d.created_at as string,
        }));

        setWorkers(mappedWorkers);
        setPages(mappedPages);
        setD1Databases(mappedD1);
      } catch (err) {
        console.error('Failed to fetch Cloudflare resources:', err);
        setError(err instanceof Error ? err.message : 'Failed to load Cloudflare resources');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-36 bg-gray-200 rounded-lg"></div>
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
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load Cloudflare resources</h2>
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

  const tabs = [
    { id: 'all', label: 'All', count: workers.length + pages.length + d1Databases.length },
    { id: 'workers', label: 'Workers', count: workers.length },
    { id: 'pages', label: 'Pages', count: pages.length },
    { id: 'd1', label: 'D1', count: d1Databases.length },
  ] as const;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cloudflare Resources</h1>
          <p className="text-gray-600 mt-1">
            Workers, Pages, and D1 databases
          </p>
        </div>
        <a
          href="https://dash.cloudflare.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.5088 16.8447C16.6288 16.4356 16.5765 16.0617 16.3547 15.7851C16.1558 15.5375 15.8401 15.3993 15.4618 15.3993H8.02913C7.94633 15.3993 7.88124 15.3634 7.85071 15.3003C7.82019 15.2463 7.82019 15.1741 7.85071 15.1021L8.22904 14.0957C8.31184 13.8672 8.51073 13.7109 8.73963 13.7109H15.9084C16.9165 13.7109 17.8226 13.2017 18.2919 12.3748C18.4137 12.1552 18.5126 11.9177 18.5863 11.6622L19.0236 10.2102C19.1073 9.93366 19.0327 9.63118 18.8384 9.42869C18.6441 9.2262 18.3629 9.14679 18.0925 9.21911L17.0203 9.49468C16.8794 9.53348 16.7476 9.45406 16.708 9.31275L15.8674 6.51293C15.7756 6.2364 15.5497 6.02551 15.2747 5.95678C15.0039 5.88805 14.7167 5.9683 14.5224 6.17021L10.9264 9.8912C10.7821 10.0424 10.5705 10.1127 10.3598 10.0748L6.99151 9.45867C6.72055 9.4028 6.43927 9.4948 6.24585 9.70471C6.05242 9.91462 5.97701 10.2099 6.04181 10.4889L6.99151 14.5227C7.03866 14.7189 6.97866 14.9247 6.8332 15.0706L4.02384 17.9058C3.83042 18.1037 3.76209 18.3927 3.84299 18.6581C3.92389 18.9235 4.14147 19.1236 4.40866 19.1845L12.3626 20.9583C12.5133 20.9925 12.6713 20.9583 12.7958 20.8633L15.1846 19.0886C15.3089 18.9936 15.3934 18.8539 15.4192 18.6969L16.5088 16.8447Z" />
          </svg>
          Cloudflare Dashboard
        </a>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{workers.length}</p>
              <p className="text-sm text-gray-600">Workers</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{pages.length}</p>
              <p className="text-sm text-gray-600">Pages</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{d1Databases.length}</p>
              <p className="text-sm text-gray-600">D1 Databases</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(activeTab === 'all' || activeTab === 'workers') &&
          workers.map((worker) => <WorkerCard key={worker.id} worker={worker} />)}
        {(activeTab === 'all' || activeTab === 'pages') &&
          pages.map((page) => <PagesCard key={page.id} page={page} />)}
        {(activeTab === 'all' || activeTab === 'd1') &&
          d1Databases.map((db) => <D1Card key={db.uuid} db={db} />)}
      </div>
    </div>
  );
};

export default CloudflareResources;
