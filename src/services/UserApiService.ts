/**
 * User Service - Consolidated user management operations
 * Handles authentication, profile management, and user resources
 */

import { CoreApiService, PaginatedResponse } from "./core/ApiService";

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  role: string;
  balance?: number;
  organization_id?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  balance: number;
  organization?: {
    id: string;
    name: string;
  };
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
  avatar_url?: string;
}

export interface UserResource {
  id: string;
  user_id: string;
  resource_type_id: string;
  amount: number;
  resource_type: {
    id: string;
    name: string;
    unit: string;
    price_per_unit: number;
  };
}

export interface UserBalance {
  balance: number;
  pending_balance: number;
  total_earned: number;
  total_spent: number;
}

export interface UserActivity {
  id: string;
  type: "recycling" | "purchase" | "withdrawal" | "prize_redemption";
  amount: number;
  description: string;
  created_at: string;
  status: "completed" | "pending" | "failed";
}

class UserServiceClass extends CoreApiService {
  private readonly ENDPOINTS = {
    CURRENT_USER: "users/me",
    USER_PROFILE: "users/profile",
    USER_RESOURCES: "users/resources",
    USER_BALANCE: "users/balance",
    USER_ACTIVITY: "users/activity",
    UPDATE_PROFILE: "users/profile",
    UPLOAD_AVATAR: "users/avatar",
  } as const;

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    return this.get<User>(this.ENDPOINTS.CURRENT_USER);
  }

  /**
   * Get detailed user profile with balance and organization
   */
  async getUserProfile(): Promise<UserProfile> {
    return this.get<UserProfile>(this.ENDPOINTS.USER_PROFILE);
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateUserDto): Promise<UserProfile> {
    return this.patch<UserProfile>(this.ENDPOINTS.UPDATE_PROFILE, data);
  }

  /**
   * Get user's recycling resources
   */
  async getUserResources(): Promise<UserResource[]> {
    return this.get<UserResource[]>(this.ENDPOINTS.USER_RESOURCES);
  }

  /**
   * Get user's balance information
   */
  async getUserBalance(): Promise<UserBalance> {
    return this.get<UserBalance>(this.ENDPOINTS.USER_BALANCE);
  }

  /**
   * Get user's activity history with pagination
   */
  async getUserActivity(
    params: {
      page?: number;
      limit?: number;
      type?: UserActivity["type"];
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<PaginatedResponse<UserActivity>> {
    const queryString = this.buildQueryString(params);
    const endpoint = queryString
      ? `${this.ENDPOINTS.USER_ACTIVITY}?${queryString}`
      : this.ENDPOINTS.USER_ACTIVITY;

    return this.get<PaginatedResponse<UserActivity>>(endpoint);
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(imageFile: FormData): Promise<{ avatar_url: string }> {
    return this.request<{ avatar_url: string }>(this.ENDPOINTS.UPLOAD_AVATAR, {
      method: "POST",
      body: imageFile,
      headers: {}, // Don't set Content-Type for FormData
    });
  }

  /**
   * Refresh user session (useful for token refresh)
   */
  async refreshSession(): Promise<User> {
    return this.post<User>("auth/refresh");
  }

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>("users/account");
  }
}

// Export singleton instance
export const UserService = new UserServiceClass();
