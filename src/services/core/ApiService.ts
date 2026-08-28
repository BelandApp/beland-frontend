/**
 * Core API Service - Base class for all API services
 * Provides unified error handling, authentication, and request management
 */

import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { notify } from "src/hooks/notification/notify.external";
// API Configuration
export const API_CONFIG = {
  BASE_URL:
    process.env.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.apiUrl ||
    "http://[::1]:3001/api",
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 0,
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
  skipJsonContentType?: boolean;
}

// Helper Sequelize Pagination Adapter

export function adaptSequelizePagination<T>(
  resp: any,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  const payload = resp?.data ?? resp;

  // Caso Sequelize raw: [rows, count]
  if (Array.isArray(payload) && Array.isArray(payload[0])) {
    const rows = payload[0];
    const total = Number(payload[1]) || rows.length;
    return {
      data: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Caso API bien formada
  if (payload?.data && Array.isArray(payload.data)) {
    return payload;
  }

  // Fallback seguro
  return {
    data: payload,
    total: 0,
    page,
    limit,
    totalPages: 0,
  };
}

export class CoreApiService {
  protected baseUrl: string;
  private static _inFlightRequests: Map<string, Promise<any>> = new Map();

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
        return SecureStore.getItem("access_token");
      } catch {
        return null;
      }
    }
  }

  /**
   * Build request headers with authentication
   */
  protected async buildHeaders(
    options: RequestOptions = {},
  ): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
    };

    if (!options.skipJsonContentType) {
      headers["Content-Type"] = "application/json";
    }

    if (!options.skipAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
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
   * Notify API error from response
   */
  protected notifyApiError(error: ApiError) {
    notify.error({ message: error.message ?? "Error intenta mas tarde" });
  }

  /**
   * Create API error from response
   */
  protected createApiError(response: Response, data: any): ApiError {
    const error = new Error(
      data?.message || data?.error || `HTTP error! status: ${response.status}`,
    ) as ApiError;

    error.status = response.status;
    error.code = data?.code;
    error.details = data;
    this.notifyApiError(error);
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
    options: RequestOptions = {},
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

    // Coalesce in-flight GET requests to avoid duplicate concurrent calls
    const method = (fetchOptions.method || "GET").toString().toUpperCase();
    const shouldCoalesce = method === "GET";
    const key = `${method}:${url}`;

    const executeRequest = async (): Promise<any> => {
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
            `📡 Response Status: ${response.status} ${response.statusText}`,
          );

          let data: any = null;

          const contentType = response.headers.get("content-type");

          if (contentType?.includes("application/json")) {
            data = await response.json();
          } else {
            data = await response.text();
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
                `🔄 Retrying request (attempt ${attempt + 1}/${retries})`,
              );
              await this.delay(API_CONFIG.RETRY_DELAY * (attempt + 1));
              continue;
            }
            const error = this.createApiError(response, data);
            this.notifyApiError(error);
            throw error;
          }

          return data;
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            console.error(`⏰ Request timeout for ${url}`);

            if (attempt < retries) {
              console.log(
                `🔄 Retrying after timeout (attempt ${attempt + 1}/${retries})`,
              );
              await this.delay(API_CONFIG.RETRY_DELAY * (attempt + 1));
              continue;
            }

            const timeoutError = new Error(
              `Request timeout after ${timeout}ms`,
            ) as ApiError;
            timeoutError.status = 408;
            throw timeoutError;
          }

          // Network errors - retry if we have attempts left
          if (attempt < retries) {
            console.log(
              `🔄 Retrying after network error (attempt ${
                attempt + 1
              }/${retries})`,
            );
            await this.delay(API_CONFIG.RETRY_DELAY * (attempt + 1));
            continue;
          }

          console.error(`🚨 API Request failed:`, error);
          throw error;
        }
      }

      throw new Error("Unexpected end of request method");
    };

    if (shouldCoalesce) {
      const existing = (
        this.constructor as typeof CoreApiService
      )._inFlightRequests.get(key);
      if (existing) return existing;

      const promise = executeRequest();
      (this.constructor as typeof CoreApiService)._inFlightRequests.set(
        key,
        promise,
      );
      try {
        const res = await promise;
        return res;
      } finally {
        (this.constructor as typeof CoreApiService)._inFlightRequests.delete(
          key,
        );
      }
    }

    // Non-coalesced path
    return executeRequest();
  }

  /**
   * GET request
   */
  public get<T = any>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  /**
   * POST request
   */
  public post<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {},
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
  public put<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {},
  ): Promise<T> {
    const isFormData =
      typeof FormData !== "undefined" && data instanceof FormData;

    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
      headers: {
        ...(options.headers || {}),
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
    });
  }

  /**
   * PATCH request
   */
  public patch<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {},
  ): Promise<T> {
    const isFormData =
      typeof FormData !== "undefined" && data instanceof FormData;

    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
      headers: {
        ...(options.headers || {}),
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
    });
  }

  /**
   * DELETE request
   */
  public delete<T = any>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  /**
   * POST request with FormData (for file uploads)
   */
  public async postFormData<T = any>(
    endpoint: string,
    formData: FormData,
    options: RequestOptions = {},
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: formData,
      skipJsonContentType: true,
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
