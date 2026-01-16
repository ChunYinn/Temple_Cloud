/**
 * API Fetcher Utilities
 * Centralized fetch functions with error handling, retry logic, and toast notifications
 */

import { API_ENDPOINTS } from '@/lib/constants/routes';

// ============================================
// Types
// ============================================

export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  showError?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ============================================
// Core Fetcher Function
// ============================================

/**
 * Enhanced fetch with timeout, retry, and error handling
 */
export async function fetcher<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    timeout = 30000, // 30 seconds default
    retries = 1,
    retryDelay = 1000,
    showError = true,
    ...fetchOptions
  } = options;

  // Add default headers
  const headers = new Headers(fetchOptions.headers);
  if (!headers.has('Content-Type') && fetchOptions.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let lastError: Error | null = null;

  // Retry logic
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ApiError(
          errorData?.error || errorData?.message || `HTTP ${response.status}`,
          response.status,
          errorData
        );
      }

      // Parse JSON response
      const data = await response.json();

      // Handle API response format
      if (data && typeof data === 'object' && 'success' in data) {
        if (!data.success) {
          throw new ApiError(data.error || 'Request failed', response.status, data);
        }
        return data.data || data;
      }

      return data;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx)
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        break;
      }

      // Don't retry on abort
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }

      // Wait before retry
      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
      }
    }
  }

  clearTimeout(timeoutId);
  throw lastError || new Error('Unknown error occurred');
}

// ============================================
// Specialized Fetchers
// ============================================

/**
 * GET request helper
 */
export async function apiGet<T = any>(
  url: string,
  options?: Omit<FetchOptions, 'method' | 'body'>
): Promise<T> {
  return fetcher<T>(url, { ...options, method: 'GET' });
}

/**
 * POST request helper
 */
export async function apiPost<T = any>(
  url: string,
  data?: any,
  options?: Omit<FetchOptions, 'method' | 'body'>
): Promise<T> {
  return fetcher<T>(url, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request helper
 */
export async function apiPut<T = any>(
  url: string,
  data?: any,
  options?: Omit<FetchOptions, 'method' | 'body'>
): Promise<T> {
  return fetcher<T>(url, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PATCH request helper
 */
export async function apiPatch<T = any>(
  url: string,
  data?: any,
  options?: Omit<FetchOptions, 'method' | 'body'>
): Promise<T> {
  return fetcher<T>(url, {
    ...options,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T = any>(
  url: string,
  options?: Omit<FetchOptions, 'method'>
): Promise<T> {
  return fetcher<T>(url, { ...options, method: 'DELETE' });
}

// ============================================
// File Upload Helper
// ============================================

/**
 * Upload file with progress tracking
 */
export async function uploadFile(
  url: string,
  file: File,
  onProgress?: (progress: number) => void,
  additionalData?: Record<string, any>
): Promise<any> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);

    // Add additional data if provided
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch {
          resolve(xhr.responseText);
        }
      } else {
        reject(new ApiError(`Upload failed: ${xhr.statusText}`, xhr.status));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new ApiError('Upload failed', 0));
    });

    xhr.addEventListener('abort', () => {
      reject(new ApiError('Upload cancelled', 0));
    });

    xhr.open('POST', url);
    xhr.send(formData);
  });
}

// ============================================
// Query String Helpers
// ============================================

/**
 * Build query string from object
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

/**
 * Build URL with query parameters
 */
export function buildUrl(baseUrl: string, params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }
  return `${baseUrl}${buildQueryString(params)}`;
}

// ============================================
// Temple API Helpers
// ============================================

/**
 * Fetch temple prayer services
 */
export async function fetchPrayerServices(templeId: string) {
  return apiGet(API_ENDPOINTS.TEMPLES.PRAYER_SERVICES(templeId));
}

/**
 * Update temple prayer services
 */
export async function updatePrayerServices(templeId: string, data: any) {
  return apiPut(API_ENDPOINTS.TEMPLES.PRAYER_SERVICES(templeId), data);
}

/**
 * Fetch temple events
 */
export async function fetchTempleEvents(templeId: string) {
  const response = await apiGet(API_ENDPOINTS.TEMPLES.EVENTS(templeId));
  return response.events || [];
}

/**
 * Fetch temple orders with pagination
 */
export async function fetchTempleOrders(
  templeId: string,
  params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }
) {
  const url = buildUrl(API_ENDPOINTS.TEMPLES.ORDERS_OPTIMIZED(templeId), params);
  return apiGet<PaginatedResponse>(url);
}

/**
 * Fetch temple statistics
 */
export async function fetchTempleStats(templeId: string) {
  return apiGet(API_ENDPOINTS.TEMPLES.STATS(templeId));
}

/**
 * Update temple settings
 */
export async function updateTempleSettings(templeId: string, data: any) {
  return apiPatch(API_ENDPOINTS.TEMPLES.BY_ID(templeId), data);
}