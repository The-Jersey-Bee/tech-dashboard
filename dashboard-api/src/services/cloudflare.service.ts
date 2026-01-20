import type {
  CloudflareWorker,
  CloudflarePage,
  CloudflareDeployment,
  CloudflareD1Database,
  CloudflareApiResponse,
} from '../types/cloudflare';

const CF_API = 'https://api.cloudflare.com/client/v4';

export class CloudflareService {
  constructor(
    private token: string,
    private accountId: string
  ) {}

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Debug: Check if token exists
    if (!this.token) {
      throw new Error('Cloudflare API token is not configured');
    }

    const url = `${CF_API}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = (await response.json()) as CloudflareApiResponse<T>;

    if (!data.success) {
      const errorMsg = data.errors.map((e) => e.message).join(', ');
      throw new Error(`Cloudflare API error: ${errorMsg}`);
    }

    return data.result;
  }

  async listWorkers(): Promise<CloudflareWorker[]> {
    // Cloudflare API returns workers array directly in result
    const workers = await this.fetch<CloudflareWorker[]>(
      `/accounts/${this.accountId}/workers/scripts`
    );
    return workers || [];
  }

  async getWorker(name: string): Promise<CloudflareWorker> {
    return this.fetch<CloudflareWorker>(
      `/accounts/${this.accountId}/workers/scripts/${name}`
    );
  }

  async listPages(): Promise<CloudflarePage[]> {
    return this.fetch<CloudflarePage[]>(
      `/accounts/${this.accountId}/pages/projects`
    );
  }

  async getPage(projectName: string): Promise<CloudflarePage> {
    return this.fetch<CloudflarePage>(
      `/accounts/${this.accountId}/pages/projects/${projectName}`
    );
  }

  async getPageDeployments(
    projectName: string,
    perPage = 10
  ): Promise<CloudflareDeployment[]> {
    return this.fetch<CloudflareDeployment[]>(
      `/accounts/${this.accountId}/pages/projects/${projectName}/deployments?per_page=${perPage}`
    );
  }

  async triggerPageDeploy(projectName: string): Promise<CloudflareDeployment> {
    // Trigger a new deployment by creating an empty deployment
    // This works if the project has a deploy hook configured
    return this.fetch<CloudflareDeployment>(
      `/accounts/${this.accountId}/pages/projects/${projectName}/deployments`,
      {
        method: 'POST',
        body: JSON.stringify({}),
      }
    );
  }

  async listD1Databases(): Promise<CloudflareD1Database[]> {
    return this.fetch<CloudflareD1Database[]>(
      `/accounts/${this.accountId}/d1/database`
    );
  }

  async getD1Database(dbId: string): Promise<CloudflareD1Database> {
    return this.fetch<CloudflareD1Database>(
      `/accounts/${this.accountId}/d1/database/${dbId}`
    );
  }

  async purgeCache(zoneId: string, urls?: string[]): Promise<void> {
    const body = urls ? { files: urls } : { purge_everything: true };

    await this.fetch<{ id: string }>(`/zones/${zoneId}/purge_cache`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getAccountDetails(): Promise<{
    id: string;
    name: string;
    type: string;
    created_on: string;
  }> {
    return this.fetch<{
      id: string;
      name: string;
      type: string;
      created_on: string;
    }>(`/accounts/${this.accountId}`);
  }

  // Aggregate all resources
  async getAllResources(): Promise<{
    workers: CloudflareWorker[];
    pages: CloudflarePage[];
    d1: CloudflareD1Database[];
  }> {
    const [workers, pages, d1] = await Promise.all([
      this.listWorkers(),
      this.listPages(),
      this.listD1Databases(),
    ]);

    return { workers, pages, d1 };
  }
}
