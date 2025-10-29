/**
 * Core API Service - Base class for all API services
 * Provides unified error handling, authentication, and request management
 */

import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

// API Configuration
export const API_CONFIG = {
  BASE_URL:
    process.env.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.apiUrl ||
    "http://[::1]:3001/api",
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Standard API Response Interface
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

// Paginated Response Interface
export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Error Interface
export interface ApiError extends Error {
  status: number;
  code?: string;
  details?: any;
}

// Request Options Interface
export interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  skipAuth?: boolean;
}

export class CoreApiService {
  protected baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || API_CONFIG.BASE_URL;
  }

  /**
   * Get authentication token from storage
   */
  protected async getAuthToken(): Promise<string | null> {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem("access_token");
    } else {
      try {
        return await AsyncStorage.getItem("access_token");
      } catch {
        return null;
      }
    }
  }

  /**
   * Build request headers with authentication
   */
  protected async buildHeaders(
    options: RequestOptions = {}
  ): Promise<HeadersInit> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (!options.skipAuth) {
      const token = await this.getAuthToken();
      if (token) {
        (headers as Record<string, string>).Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Build full URL from endpoint
   */
  protected buildUrl(endpoint: string): string {
    // If endpoint is already a full URL, use it as-is
    if (/^https?:\/\//i.test(endpoint)) {
      return endpoint;
    }

    // Normalize base URL and endpoint
    const base = this.baseUrl.replace(/\/+$/g, "");
    const path = endpoint.replace(/^\/+/, "");
    return `${base}/${path}`;
  }

  /**
   * Create API error from response
   */
  protected createApiError(response: Response, data: any): ApiError {
    const error = new Error(
      data?.message || data?.error || `HTTP error! status: ${response.status}`
    ) as ApiError;

    error.status = response.status;
    error.code = data?.code;
    error.details = data;

    return error;
  }

  /**
   * Delay execution for retry logic
   */
  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Core request method with retry logic and error handling
   */
  protected async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      timeout = API_CONFIG.TIMEOUT,
      retries = API_CONFIG.RETRY_ATTEMPTS,
      ...fetchOptions
    } = options;

    const url = this.buildUrl(endpoint);
    const headers = await this.buildHeaders(options);

    const requestConfig: RequestInit = {
      ...fetchOptions,
      headers,
    };

    console.log(`🌐 API Request: ${options.method || "GET"} ${url}`);

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...requestConfig,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log(
          `📡 Response Status: ${response.status} ${response.statusText}`
        );

        let data;
        try {
          data = await response.json();
          console.log(`📦 Response Data:`, data);
        } catch (jsonError) {
          console.log(`⚠️ No JSON response or empty body`);
          data = null;
        }

        if (!response.ok) {
          console.error(`❌ API Error: ${response.status}`, data);

          // Don't retry client errors (4xx)
          if (response.status >= 400 && response.status < 500) {
            throw this.createApiError(response, data);
          }

          // Retry server errors (5xx) if we have attempts left
          if (attempt < retries) {
            console.log(
              `🔄 Retrying request (attempt ${attempt + 1}/${retries})`
            );
            await this.delay(API_CONFIG.RETRY_DELAY * (attempt + 1));
            continue;
          }

          throw this.createApiError(response, data);
        }

        return data;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.error(`⏰ Request timeout for ${url}`);

          if (attempt < retries) {
            console.log(
              `🔄 Retrying after timeout (attempt ${attempt + 1}/${retries})`
            );
            await this.delay(API_CONFIG.RETRY_DELAY * (attempt + 1));
            continue;
          }

          const timeoutError = new Error(
            `Request timeout after ${timeout}ms`
          ) as ApiError;
          timeoutError.status = 408;
          throw timeoutError;
        }

        // Network errors - retry if we have attempts left
        if (attempt < retries) {
          console.log(
            `🔄 Retrying after network error (attempt ${
              attempt + 1
            }/${retries})`
          );
          await this.delay(API_CONFIG.RETRY_DELAY * (attempt + 1));
          continue;
        }

        console.error(`🚨 API Request failed:`, error);
        throw error;
      }
    }

    // This should never be reached, but TypeScript requires it
    throw new Error("Unexpected end of request method");
  }

  /**
   * GET request
   */
  protected get<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  /**
   * POST request
   */
  protected post<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  protected put<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  protected patch<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  protected delete<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  /**
   * POST request with FormData (for file uploads)
   */
  protected async postFormData<T = any>(
    endpoint: string,
    formData: FormData,
    options: RequestOptions = {}
  ): Promise<T> {
    // For FormData, we need to remove the Content-Type header
    // to let the browser set it with the boundary
    const headers = await this.buildHeaders(options);
    delete (headers as any)["Content-Type"];

    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: formData,
      headers,
    });
  }

  /**
   * Build query string from parameters
   */
  protected buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    return searchParams.toString();
  }
}
