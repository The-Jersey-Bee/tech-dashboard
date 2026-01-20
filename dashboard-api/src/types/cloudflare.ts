export interface CloudflareWorker {
  id: string;
  name: string;
  created_on: string;
  modified_on: string;
  etag: string;
}

export interface CloudflareWorkerRoute {
  id: string;
  pattern: string;
  script: string;
}

export interface CloudflarePage {
  id: string;
  name: string;
  subdomain: string;
  domains: string[];
  created_on: string;
  production_branch: string;
  source?: {
    type: 'github';
    config: {
      owner: string;
      repo_name: string;
      production_branch: string;
      pr_comments_enabled: boolean;
    };
  };
  latest_deployment?: CloudflareDeployment;
}

export interface CloudflareDeployment {
  id: string;
  short_id: string;
  project_id: string;
  project_name: string;
  environment: 'production' | 'preview';
  url: string;
  created_on: string;
  modified_on: string;
  deployment_trigger: {
    type: string;
    metadata: {
      branch: string;
      commit_hash: string;
      commit_message: string;
    };
  };
  latest_stage: {
    name: string;
    status: 'success' | 'failure' | 'active' | 'idle';
    started_on: string | null;
    ended_on: string | null;
  };
  stages: Array<{
    name: string;
    status: string;
    started_on: string | null;
    ended_on: string | null;
  }>;
}

export interface CloudflareD1Database {
  uuid: string;
  name: string;
  created_at: string;
  version: string;
  num_tables?: number;
  file_size?: number;
}

export interface CloudflareKVNamespace {
  id: string;
  title: string;
  supports_url_encoding: boolean;
}

export interface CloudflareApiResponse<T> {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: string[];
  result: T;
  result_info?: {
    page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
  };
}
