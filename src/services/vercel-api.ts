/**
 * Vercel REST API Service
 * Provides integration with Vercel's REST API for deployment management
 */

interface VercelConfig {
  token: string;
  projectId: string;
  teamId?: string;
}

interface DeploymentOptions {
  name: string;
  files: Record<string, string>;
  projectSettings?: {
    buildCommand?: string;
    outputDirectory?: string;
    installCommand?: string;
    devCommand?: string;
  };
  env?: Record<string, string>;
  target?: 'production' | 'staging';
}

interface Deployment {
  uid: string;
  name: string;
  url: string;
  state: 'BUILDING' | 'READY' | 'ERROR' | 'QUEUED' | 'CANCELED';
  createdAt: number;
  target?: string;
  meta?: Record<string, any>;
}

interface Project {
  id: string;
  name: string;
  accountId: string;
  framework?: string;
  devCommand?: string;
  installCommand?: string;
  buildCommand?: string;
  outputDirectory?: string;
  publicSource?: boolean;
  rootDirectory?: string;
  directoryListing?: boolean;
}

export class VercelAPIService {
  private config: VercelConfig;
  private baseUrl = 'https://api.vercel.com';

  constructor(config?: Partial<VercelConfig>) {
    this.config = {
      token: config?.token || process.env.VERCEL_OIDC_TOKEN || '',
      projectId: config?.projectId || process.env.VERCEL_PROJECT_ID || 'balibuddy',
      teamId: config?.teamId || process.env.VERCEL_TEAM_ID
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.config.token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.config.teamId) {
      (headers as Record<string, string>)['X-Vercel-Team-Id'] = this.config.teamId;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Vercel API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Deployments
  async createDeployment(options: DeploymentOptions): Promise<Deployment> {
    return this.request<Deployment>('/v13/deployments', {
      method: 'POST',
      body: JSON.stringify({
        name: options.name,
        files: Object.entries(options.files).map(([file, data]) => ({
          file,
          data: btoa(data),
          encoding: 'base64'
        })),
        projectSettings: options.projectSettings,
        project: this.config.projectId,
        target: options.target || 'production',
        meta: {
          source: 'vercel-api-service'
        }
      })
    });
  }

  async getDeployment(deploymentId: string): Promise<Deployment> {
    return this.request<Deployment>(`/v13/deployments/${deploymentId}`);
  }

  async listDeployments(limit = 20): Promise<{ deployments: Deployment[] }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      projectId: this.config.projectId
    });
    return this.request<{ deployments: Deployment[] }>(`/v13/deployments?${params}`);
  }

  async cancelDeployment(deploymentId: string): Promise<void> {
    await this.request(`/v13/deployments/${deploymentId}/cancel`, {
      method: 'PATCH'
    });
  }

  // Projects
  async getProject(): Promise<Project> {
    return this.request<Project>(`/v9/projects/${this.config.projectId}`);
  }

  async updateProject(updates: Partial<Project>): Promise<Project> {
    return this.request<Project>(`/v9/projects/${this.config.projectId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  async listProjects(): Promise<{ projects: Project[] }> {
    return this.request<{ projects: Project[] }>('/v9/projects');
  }

  // Environment Variables
  async getEnvVars(): Promise<Array<{
    key: string;
    value: string;
    target: string[];
    type: string;
  }>> {
    return this.request(`/v9/projects/${this.config.projectId}/env`);
  }

  async createEnvVar(key: string, value: string, target: string[] = ['production', 'preview']): Promise<void> {
    await this.request(`/v9/projects/${this.config.projectId}/env`, {
      method: 'POST',
      body: JSON.stringify({
        key,
        value,
        target,
        type: 'encrypted'
      })
    });
  }

  async updateEnvVar(envId: string, value: string): Promise<void> {
    await this.request(`/v9/projects/${this.config.projectId}/env/${envId}`, {
      method: 'PATCH',
      body: JSON.stringify({ value })
    });
  }

  async deleteEnvVar(envId: string): Promise<void> {
    await this.request(`/v9/projects/${this.config.projectId}/env/${envId}`, {
      method: 'DELETE'
    });
  }

  // Domains
  async listDomains(): Promise<Array<{
    name: string;
    apexName: string;
    projectId: string;
    verified: boolean;
    gitBranch?: string;
    createdAt: number;
  }>> {
    return this.request(`/v10/projects/${this.config.projectId}/domains`);
  }

  async addDomain(domain: string): Promise<void> {
    await this.request(`/v10/projects/${this.config.projectId}/domains`, {
      method: 'POST',
      body: JSON.stringify({ name: domain })
    });
  }

  async removeDomain(domain: string): Promise<void> {
    await this.request(`/v10/projects/${this.config.projectId}/domains/${domain}`, {
      method: 'DELETE'
    });
  }

  // Utility methods
  async getDeploymentStatus(deploymentId: string): Promise<string> {
    const deployment = await this.getDeployment(deploymentId);
    return deployment.state;
  }

  async waitForDeployment(deploymentId: string, timeout = 300000): Promise<Deployment> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const deployment = await this.getDeployment(deploymentId);
      
      if (deployment.state === 'READY') {
        return deployment;
      }
      
      if (deployment.state === 'ERROR' || deployment.state === 'CANCELED') {
        throw new Error(`Deployment ${deploymentId} failed with state: ${deployment.state}`);
      }
      
      // Wait 5 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    throw new Error(`Deployment ${deploymentId} timed out`);
  }

  async getLatestDeployment(): Promise<Deployment | null> {
    const { deployments } = await this.listDeployments(1);
    return deployments[0] || null;
  }

  async redeploy(deploymentId: string, target?: 'production' | 'staging'): Promise<Deployment> {
    const original = await this.getDeployment(deploymentId);
    
    return this.createDeployment({
      name: original.name,
      files: {}, // Would need to fetch original files
      target: target || (original.target as 'production' | 'staging')
    });
  }
}

// Export singleton instance
export const vercelAPI = new VercelAPIService();

// Export types
export type { VercelConfig, DeploymentOptions, Deployment, Project };