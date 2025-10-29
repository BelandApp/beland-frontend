import { CoreApiService, PaginatedResponse } from "./core/ApiService";

// Resource Types
export interface ResourceType {
  id: string;
  name: string;
  description?: string;
  unit: string; // 'kg', 'piece', 'liter', etc.
  price_per_unit: number;
  currency: string;
  category:
    | "plastic"
    | "metal"
    | "paper"
    | "glass"
    | "electronic"
    | "organic"
    | "other";
  image_url?: string;
  recycling_difficulty: "easy" | "medium" | "hard";
  environmental_impact_score: number; // 1-10
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecyclingTransaction {
  id: string;
  user_id: string;
  resource_type_id: string;
  resource_type: ResourceType;
  quantity: number;
  unit_price: number;
  total_value: number;
  status: "pending" | "verified" | "approved" | "rejected";
  verification_method: "photo" | "qr_code" | "weight_scale" | "manual";
  evidence_urls: string[]; // Photo evidence
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  notes?: string;
  verified_by?: string; // Admin/verifier ID
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserResourceSummary {
  user_id: string;
  total_transactions: number;
  total_value_earned: number;
  total_weight_recycled: number; // in kg
  environmental_impact_score: number;
  favorite_resource_type: ResourceType;
  recycling_streak_days: number;
  last_recycling_date: string;
  by_category: {
    category: ResourceType["category"];
    count: number;
    total_weight: number;
    total_value: number;
  }[];
}

export interface CreateRecyclingTransactionDto {
  resource_type_id: string;
  quantity: number;
  verification_method: RecyclingTransaction["verification_method"];
  evidence_urls?: string[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  notes?: string;
}

export interface UpdateRecyclingTransactionDto {
  quantity?: number;
  evidence_urls?: string[];
  notes?: string;
}

export interface RecyclingQuery {
  page?: number;
  limit?: number;
  status?: RecyclingTransaction["status"];
  resource_type_id?: string;
  category?: ResourceType["category"];
  start_date?: string;
  end_date?: string;
  verified_by?: string;
}

export interface EnvironmentalImpact {
  co2_saved: number; // kg of CO2
  water_saved: number; // liters
  energy_saved: number; // kWh
  landfill_waste_avoided: number; // kg
  trees_equivalent: number;
  recycling_rate: number; // percentage
}

export interface RecyclingGoal {
  id: string;
  user_id: string;
  type: "daily" | "weekly" | "monthly" | "yearly";
  target_value: number;
  target_unit: "transactions" | "weight" | "value" | "impact_score";
  current_progress: number;
  is_active: boolean;
  started_at: string;
  ends_at: string;
  completed_at?: string;
}

class ResourceServiceClass extends CoreApiService {
  private readonly ENDPOINTS = {
    RESOURCE_TYPES: "resource-type",
    RECYCLING_TRANSACTIONS: "recycling-transactions",
    USER_RESOURCES: "user-resources",
    RECYCLING_GOALS: "recycling-goals",
    ENVIRONMENTAL_IMPACT: "environmental-impact",
    UPLOAD_EVIDENCE: "recycling-transactions/evidence",
    VERIFY_TRANSACTION: "recycling-transactions/verify",
  } as const;

  // Resource Types
  /**
   * Get all resource types with optional filtering
   */
  async getResourceTypes(
    params: {
      category?: ResourceType["category"];
      active_only?: boolean;
    } = {}
  ): Promise<ResourceType[]> {
    const queryString = this.buildQueryString(params);
    const endpoint = queryString
      ? `${this.ENDPOINTS.RESOURCE_TYPES}?${queryString}`
      : this.ENDPOINTS.RESOURCE_TYPES;

    const [resourceTypes] = await this.get<[ResourceType[], number]>(endpoint);
    return resourceTypes;
  }

  /**
   * Get a specific resource type
   */
  async getResourceType(id: string): Promise<ResourceType> {
    return this.get<ResourceType>(`${this.ENDPOINTS.RESOURCE_TYPES}/${id}`);
  }

  /**
   * Get resource types by category
   */
  async getResourceTypesByCategory(
    category: ResourceType["category"]
  ): Promise<ResourceType[]> {
    return this.getResourceTypes({ category, active_only: true });
  }

  // Recycling Transactions
  /**
   * Get recycling transactions with filtering
   */
  async getRecyclingTransactions(
    query: RecyclingQuery = {}
  ): Promise<PaginatedResponse<RecyclingTransaction>> {
    const queryString = this.buildQueryString(query);
    const endpoint = queryString
      ? `${this.ENDPOINTS.RECYCLING_TRANSACTIONS}?${queryString}`
      : this.ENDPOINTS.RECYCLING_TRANSACTIONS;

    return this.get<PaginatedResponse<RecyclingTransaction>>(endpoint);
  }

  /**
   * Get a specific recycling transaction
   */
  async getRecyclingTransaction(id: string): Promise<RecyclingTransaction> {
    return this.get<RecyclingTransaction>(
      `${this.ENDPOINTS.RECYCLING_TRANSACTIONS}/${id}`
    );
  }

  /**
   * Create a new recycling transaction
   */
  async createRecyclingTransaction(
    data: CreateRecyclingTransactionDto
  ): Promise<RecyclingTransaction> {
    return this.post<RecyclingTransaction>(
      this.ENDPOINTS.RECYCLING_TRANSACTIONS,
      data
    );
  }

  /**
   * Update a recycling transaction
   */
  async updateRecyclingTransaction(
    id: string,
    data: UpdateRecyclingTransactionDto
  ): Promise<RecyclingTransaction> {
    return this.patch<RecyclingTransaction>(
      `${this.ENDPOINTS.RECYCLING_TRANSACTIONS}/${id}`,
      data
    );
  }

  /**
   * Delete a recycling transaction (only if pending)
   */
  async deleteRecyclingTransaction(id: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(
      `${this.ENDPOINTS.RECYCLING_TRANSACTIONS}/${id}`
    );
  }

  /**
   * Upload evidence for recycling transaction
   */
  async uploadRecyclingEvidence(
    transactionId: string,
    files: FormData
  ): Promise<{
    evidence_urls: string[];
    transaction: RecyclingTransaction;
  }> {
    return this.request(`${this.ENDPOINTS.UPLOAD_EVIDENCE}/${transactionId}`, {
      method: "POST",
      body: files,
      headers: {}, // Don't set Content-Type for FormData
    });
  }

  // User Resource Summary
  /**
   * Get user's resource summary
   */
  async getUserResourceSummary(): Promise<UserResourceSummary> {
    return this.get<UserResourceSummary>(this.ENDPOINTS.USER_RESOURCES);
  }

  /**
   * Get user's resources with pagination
   */
  async getUserResources(
    params: {
      page?: number;
      limit?: number;
      resource_id?: string;
    } = {}
  ): Promise<PaginatedResponse<any>> {
    const queryString = this.buildQueryString(params);
    const endpoint = queryString
      ? `${this.ENDPOINTS.USER_RESOURCES}?${queryString}`
      : this.ENDPOINTS.USER_RESOURCES;

    return this.get<PaginatedResponse<any>>(endpoint);
  }

  /**
   * Get user's recycling history
   */
  async getUserRecyclingHistory(
    params: {
      page?: number;
      limit?: number;
      resource_type_id?: string;
      start_date?: string;
      end_date?: string;
    } = {}
  ): Promise<PaginatedResponse<RecyclingTransaction>> {
    const queryString = this.buildQueryString(params);
    const endpoint = queryString
      ? `${this.ENDPOINTS.USER_RESOURCES}/history?${queryString}`
      : `${this.ENDPOINTS.USER_RESOURCES}/history`;

    return this.get<PaginatedResponse<RecyclingTransaction>>(endpoint);
  }

  // Environmental Impact
  /**
   * Get user's environmental impact
   */
  async getEnvironmentalImpact(
    params: {
      period?: "week" | "month" | "quarter" | "year" | "all";
      start_date?: string;
      end_date?: string;
    } = {}
  ): Promise<EnvironmentalImpact> {
    const queryString = this.buildQueryString(params);
    const endpoint = queryString
      ? `${this.ENDPOINTS.ENVIRONMENTAL_IMPACT}?${queryString}`
      : this.ENDPOINTS.ENVIRONMENTAL_IMPACT;

    return this.get<EnvironmentalImpact>(endpoint);
  }

  /**
   * Get community environmental impact
   */
  async getCommunityImpact(): Promise<
    EnvironmentalImpact & {
      total_users: number;
      top_recyclers: {
        user_id: string;
        user_name: string;
        total_impact: number;
      }[];
    }
  > {
    return this.get("environmental-impact/community");
  }

  // Recycling Goals
  /**
   * Get user's recycling goals
   */
  async getRecyclingGoals(): Promise<RecyclingGoal[]> {
    return this.get<RecyclingGoal[]>(this.ENDPOINTS.RECYCLING_GOALS);
  }

  /**
   * Create a new recycling goal
   */
  async createRecyclingGoal(data: {
    type: RecyclingGoal["type"];
    target_value: number;
    target_unit: RecyclingGoal["target_unit"];
    ends_at: string;
  }): Promise<RecyclingGoal> {
    return this.post<RecyclingGoal>(this.ENDPOINTS.RECYCLING_GOALS, data);
  }

  /**
   * Update a recycling goal
   */
  async updateRecyclingGoal(
    id: string,
    data: {
      target_value?: number;
      ends_at?: string;
      is_active?: boolean;
    }
  ): Promise<RecyclingGoal> {
    return this.patch<RecyclingGoal>(
      `${this.ENDPOINTS.RECYCLING_GOALS}/${id}`,
      data
    );
  }

  /**
   * Delete a recycling goal
   */
  async deleteRecyclingGoal(id: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(
      `${this.ENDPOINTS.RECYCLING_GOALS}/${id}`
    );
  }

  // Admin/Verification Methods
  /**
   * Verify a recycling transaction (admin/verifier only)
   */
  async verifyRecyclingTransaction(
    id: string,
    data: {
      status: "approved" | "rejected";
      notes?: string;
      adjusted_quantity?: number;
    }
  ): Promise<RecyclingTransaction> {
    return this.post<RecyclingTransaction>(
      `${this.ENDPOINTS.VERIFY_TRANSACTION}/${id}`,
      data
    );
  }

  /**
   * Get pending transactions for verification (admin only)
   */
  async getPendingVerifications(
    params: {
      page?: number;
      limit?: number;
      resource_type_id?: string;
    } = {}
  ): Promise<PaginatedResponse<RecyclingTransaction>> {
    const queryString = this.buildQueryString(params);
    return this.get<PaginatedResponse<RecyclingTransaction>>(
      `${this.ENDPOINTS.VERIFY_TRANSACTION}/pending?${queryString}`
    );
  }

  // Analytics and Reporting
  /**
   * Get recycling analytics
   */
  async getRecyclingAnalytics(
    params: {
      period?: "week" | "month" | "quarter" | "year";
      start_date?: string;
      end_date?: string;
    } = {}
  ): Promise<{
    total_transactions: number;
    total_value: number;
    total_weight: number;
    by_category: Record<
      ResourceType["category"],
      {
        count: number;
        weight: number;
        value: number;
      }
    >;
    daily_stats: {
      date: string;
      transactions: number;
      weight: number;
      value: number;
    }[];
  }> {
    const queryString = this.buildQueryString(params);
    return this.get(`recycling-analytics?${queryString}`);
  }

  /**
   * Get recycling leaderboard
   */
  async getRecyclingLeaderboard(
    params: {
      period?: "week" | "month" | "all";
      metric?: "transactions" | "weight" | "value" | "impact";
      limit?: number;
    } = {}
  ): Promise<
    {
      user_id: string;
      user_name: string;
      avatar_url?: string;
      value: number;
      rank: number;
    }[]
  > {
    const queryString = this.buildQueryString(params);
    return this.get(`recycling-leaderboard?${queryString}`);
  }
}

// Export singleton instance
export const ResourceService = new ResourceServiceClass();
