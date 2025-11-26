/**
 * Transaction Service - Handles transaction operations
 * Including history and recent recipients
 */

import { CoreApiService, PaginatedResponse } from "./core/ApiService";

// Transaction Types
export interface Transaction {
  id: string;
  wallet_id: string;
  type_id: string;
  status_id: string;
  amount_becoin: number;
  post_balance: number;
  reference?: string;
  related_wallet_id?: string;
  created_at: string;
  updated_at: string;
  type?: {
    id: string;
    name: string;
    code: string;
  };
  status?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface RecentRecipient {
  wallet_id: string;
  email: string;
  full_name: string;
  username?: string | null;
  picture?: string | null;
}

class TransactionServiceClass extends CoreApiService {
  constructor() {
    super("transactions");
  }

  /**
   * Get user's transaction history
   */
  async getTransactions(
    params: {
      page?: number;
      limit?: number;
      state_id?: string;
      type_id?: string;
    } = {}
  ): Promise<PaginatedResponse<Transaction>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.state_id) queryParams.append("state_id", params.state_id);
    if (params.type_id) queryParams.append("type_id", params.type_id);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : "";

    const response = await this.get<[Transaction[], number]>(endpoint);
    const page = params.page || 1;
    const limit = params.limit || 10;
    return {
      data: response[0],
      total: response[1],
      page,
      limit,
      totalPages: Math.ceil(response[1] / limit),
    };
  }

  /**
   * Get recent transfer recipients
   */
  async getRecentRecipients(
    params: {
      page?: number;
      limit?: number;
    } = {}
  ): Promise<RecentRecipient[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());

      const queryString = queryParams.toString();
      const endpoint = `recent-recipients${
        queryString ? `?${queryString}` : ""
      }`;

      console.log(
        `[TransactionService] Fetching recent recipients: ${endpoint}`
      );
      const data = await this.get<RecentRecipient[]>(endpoint);
      console.log(`[TransactionService] Recent recipients response:`, data);

      const validData = Array.isArray(data) ? data : [];
      console.log(
        `[TransactionService] Returning ${validData.length} recipients`
      );

      return validData;
    } catch (error: any) {
      console.error(
        "[TransactionService] Error in getRecentRecipients:",
        error
      );
      console.error("[TransactionService] Error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return [];
    }
  }

  /**
   * Get a specific transaction
   */
  async getTransaction(id: string): Promise<Transaction> {
    return this.get<Transaction>(`${id}`);
  }
}

// Export singleton instance
export const TransactionService = new TransactionServiceClass();
