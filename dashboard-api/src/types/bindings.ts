export interface Env {
  // Secrets
  GITHUB_TOKEN: string;
  CLOUDFLARE_API_TOKEN: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  JWT_SECRET: string;

  // Bindings
  DB: D1Database;
  CACHE: KVNamespace;

  // Config
  FRONTEND_URL: string;
  GITHUB_ORG: string;
}
