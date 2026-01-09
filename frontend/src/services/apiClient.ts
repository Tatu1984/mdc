import { env } from '@/config/env';

/**
 * Get API base URL (evaluated at runtime for container deployments)
 */
const getApiBaseUrl = (): string => env.API_URL;

/**
 * Storage key for access token
 */
let cachedAccessToken: string | null = null;

/**
 * Set the access token for API requests
 * @param token - The access token to use for authenticated requests
 */
export const setAccessToken = (token: string | null): void => {
  cachedAccessToken = token;
};

/**
 * Get the current access token
 * @returns The current access token or null
 */
export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Get default headers for API requests
 * @returns Headers object with default Content-Type and Authorization if token exists
 */
const getDefaultHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (cachedAccessToken) {
    headers['Authorization'] = `Bearer ${cachedAccessToken}`;
  }

  return headers;
};

/**
 * API response interface
 */
interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  ok: boolean;
}

/**
 * Make an authenticated API request
 * @param endpoint - API endpoint (relative to base URL)
 * @param options - Fetch options
 * @returns API response
 */
const makeRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const headers = getDefaultHeaders();
    const url = `${getApiBaseUrl()}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    let data: T | undefined;
    const contentType = response.headers.get('content-type');

    // Parse response based on content type
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = (await response.text()) as any;
    }

    if (!response.ok) {
      return {
        error:
          (data as any)?.message ||
          (data as any)?.error ||
          `HTTP error! status: ${response.status}`,
        status: response.status,
        ok: false,
      };
    }

    return {
      data,
      status: response.status,
      ok: true,
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      status: 0,
      ok: false,
    };
  }
};

/**
 * API Client for making HTTP requests
 */
export const apiClient = {
  /**
   * Make a GET request
   * @param endpoint - API endpoint
   * @param options - Additional fetch options
   */
  get: async <T = any>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> => {
    return makeRequest<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  },

  /**
   * Make a POST request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param options - Additional fetch options
   */
  post: async <T = any>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<ApiResponse<T>> => {
    return makeRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * Make a PUT request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param options - Additional fetch options
   */
  put: async <T = any>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<ApiResponse<T>> => {
    return makeRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * Make a PATCH request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param options - Additional fetch options
   */
  patch: async <T = any>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<ApiResponse<T>> => {
    return makeRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * Make a DELETE request
   * @param endpoint - API endpoint
   * @param options - Additional fetch options
   */
  delete: async <T = any>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> => {
    return makeRequest<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  },
};

/**
 * OData-specific API client for querying collections
 */
export const odataClient = {
  /**
   * Get OData collection with query options
   * @param collection - Collection name (e.g., 'Datacenter', 'Workspace')
   * @param query - OData query parameters
   */
  getCollection: async <T = any>(
    collection: string,
    query?: {
      $filter?: string;
      $select?: string;
      $expand?: string;
      $orderby?: string;
      $top?: number;
      $skip?: number;
      $count?: boolean;
    }
  ): Promise<ApiResponse<{ value: T[]; '@odata.count'?: number }>> => {
    const queryParams = new URLSearchParams();

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/odata/${collection}${queryString ? `?${queryString}` : ''}`;

    return apiClient.get(endpoint);
  },

  /**
   * Get single OData entity by ID
   * @param collection - Collection name
   * @param id - Entity ID
   * @param expand - Related entities to expand
   */
  getEntity: async <T = any>(
    collection: string,
    id: string | number,
    expand?: string
  ): Promise<ApiResponse<T>> => {
    const queryString = expand ? `?$expand=${expand}` : '';
    return apiClient.get(`/odata/${collection}(${id})${queryString}`);
  },

  /**
   * Create a new OData entity
   * @param collection - Collection name
   * @param entity - Entity data
   */
  createEntity: async <T = any>(
    collection: string,
    entity: any
  ): Promise<ApiResponse<T>> => {
    return apiClient.post(`/odata/${collection}`, entity);
  },

  /**
   * Update an OData entity
   * @param collection - Collection name
   * @param id - Entity ID
   * @param entity - Updated entity data
   */
  updateEntity: async <T = any>(
    collection: string,
    id: string | number,
    entity: any
  ): Promise<ApiResponse<T>> => {
    return apiClient.put(`/odata/${collection}(${id})`, entity);
  },

  /**
   * Partially update an OData entity
   * @param collection - Collection name
   * @param id - Entity ID
   * @param changes - Partial entity data to update
   */
  patchEntity: async <T = any>(
    collection: string,
    id: string | number,
    changes: any
  ): Promise<ApiResponse<T>> => {
    return apiClient.patch(`/odata/${collection}(${id})`, changes);
  },

  /**
   * Delete an OData entity
   * @param collection - Collection name
   * @param id - Entity ID
   */
  deleteEntity: async (
    collection: string,
    id: string | number
  ): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/odata/${collection}(${id})`);
  },
};

export default apiClient;
