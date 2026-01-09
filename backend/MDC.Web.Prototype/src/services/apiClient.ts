import { getToken, updateToken } from '@/config/keycloak';

/**
 * Base API URL from environment variables
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://localhost:8081';

/**
 * Get authentication headers with Bearer token
 * @returns Headers object with Authorization header if authenticated
 */
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    // Try to refresh token if it's about to expire (within 5 seconds)
    await updateToken(5);

    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Failed to refresh token:', error);
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
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}${endpoint}`;

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
 * API Client with authentication support
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
