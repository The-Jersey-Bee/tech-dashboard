export class CacheService {
  constructor(private kv: KVNamespace) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.kv.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.kv.put(key, JSON.stringify(value), {
      expirationTtl: ttlSeconds,
    });
  }

  async delete(key: string): Promise<void> {
    await this.kv.delete(key);
  }

  // Cache key generators
  static keys = {
    githubRepos: (org: string) => `github:repos:${org}`,
    githubRepo: (owner: string, repo: string) => `github:repo:${owner}:${repo}`,
    githubActivity: (org: string) => `github:activity:${org}`,
    githubWorkflows: (owner: string, repo: string) =>
      `github:workflows:${owner}:${repo}`,
    cloudflareWorkers: () => 'cloudflare:workers',
    cloudflarePages: () => 'cloudflare:pages',
    cloudflareD1: () => 'cloudflare:d1',
    healthStatus: () => 'health:status',
    healthCheck: (checkId: string) => `health:check:${checkId}`,
  };

  // TTL values in seconds
  static ttl = {
    githubRepos: 600, // 10 minutes
    githubActivity: 120, // 2 minutes
    cloudflareResources: 300, // 5 minutes
    healthStatus: 60, // 1 minute
  };
}
