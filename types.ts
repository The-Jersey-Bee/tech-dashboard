
export enum ProjectStatus {
  ONLINE = 'online',
  DEGRADED = 'degraded',
  OFFLINE = 'offline',
  UNKNOWN = 'unknown'
}

export interface Project {
  id: string;
  name: string;
  description: string;
  type: 'worker' | 'pages' | 'd1' | 'automation' | 'external';
  url?: string;
  healthUrl?: string;
  status: ProjectStatus;
  lastChecked?: string;
}

