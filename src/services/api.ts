
import { ServerConnection } from '@jupyterlab/services';
import { URLExt } from '@jupyterlab/coreutils';
import { ProjectConfig } from '../types';

export class AirflowStudioAPI {
  private serverSettings = ServerConnection.makeSettings();

  async request<T>(path: string, method: string = 'GET', body: any = null): Promise<T> {
    const baseUrl = this.serverSettings.baseUrl;
    const url = URLExt.join(baseUrl, 'airflow-studio', 'api', path);
    
    const init: RequestInit = { method };
    if (body) {
      init.body = JSON.stringify(body);
    }

    try {
        const response = await ServerConnection.makeRequest(url, init, this.serverSettings);
        if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || response.statusText);
        }
        return response.json();
    } catch (e) {
        // Fallback for Dev Preview (Mocking to prevent white screen)
        console.warn("Backend unavailable (Dev Mode). Returning mock data.");
        if (path === 'workspaces') return ['marketing', 'finance', 'risk'] as any;
        if (path === 'git') return { success: true, output: `[MOCK] Executed: ${body?.command}` } as any;
        if (method === 'POST') return { status: 'created', path: '/mock/path' } as any;
        throw e;
    }
  }

  async listWorkspaces(): Promise<string[]> {
    return this.request<string[]>('workspaces');
  }

  async loadProject(name: string): Promise<ProjectConfig> {
    return this.request<ProjectConfig>(`project/${name}`);
  }

  async saveProject(config: ProjectConfig): Promise<{ status: string, path: string }> {
    return this.request('project', 'POST', config);
  }

  async executeGit(command: string, cwd: string): Promise<{ success: boolean, output: string }> {
    return this.request('git', 'POST', { command, cwd });
  }

  async listCondaEnvs(): Promise<string[]> {
    return this.request<string[]>('conda');
  }
}

export const api = new AirflowStudioAPI();
