export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    perPage: number;
    total: number;
    hasNext: boolean;
  };
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  type: 'worker' | 'pages' | 'd1' | 'automation' | 'external' | 'github';
  url: string | null;
  healthUrl: string | null;
  status: 'online' | 'degraded' | 'offline' | 'unknown';
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  type: Project['type'];
  url?: string;
  healthUrl?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  type?: Project['type'];
  url?: string;
  healthUrl?: string;
  status?: Project['status'];
}
