import { getToken, updateToken } from '../config/keycloak';
import { env } from 'next-runtime-env';

const API_BASE_URL = env('API_URL') || '';

interface ApiClientOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    // Try to refresh token if it's about to expire
    try {
      await updateToken(() => {});
    } catch (error) {
      console.warn('Token refresh failed:', error);
    }

    return {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    };
  }

  async request<T>(endpoint: string, options: ApiClientOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const authHeaders = await this.getAuthHeaders();
      
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          ...authHeaders,
          ...options.headers,
        },
        body: options.body,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - please login again');
        }
        if (response.status === 403) {
          throw new Error('Forbidden - insufficient permissions');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text() as unknown as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  async post<T>(endpoint: string, data?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

export const apiClient = new ApiClient();
export default apiClient;