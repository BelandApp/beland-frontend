/**
 * Withdraw Service - Consolidated withdraw operations
 * Handles withdraw accounts, account types, and withdraw requests
 */

import { User } from "src/context";
import {
  CoreApiService,
  PaginatedResponse,
  adaptSequelizePagination,
} from "../core/ApiService";

// Withdraw Types
export interface WithdrawAccount {
  id: string;
  user_id: string;
  withdraw_account_type_id: string;
  owner_name: string;
  holderName: string;
  cbu?: string;
  alias?: string;
  provider?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  currency?: number;
  withdraw_account_type: WithdrawAccountType;
  type?: WithdrawAccountType; // For backward compatibility
  bankName: string;
  holderDocument: string;
  accountNumber: string;
  country: string;
}

export interface WithdrawAccountType {
  id: string;
  code: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWithdrawAccountRequest {
  owner_name: string;
  withdraw_account_type_id: string;
  cbu?: string;
  alias?: string;
  provider?: string;
  phone?: string;
}

export interface UpdateWithdrawAccountRequest {
  owner_name?: string;
  cbu?: string;
  alias?: string;
  provider?: string;
  phone?: string;
}

export interface WithdrawRequest {
  amountBecoin: number;
  withdraw_account_id: string;
}

export interface UserWithdraw {
  id: string;
  user_id: string;
  user: User;
  withdraw_account_id: string;
  amount_becoin: number;
  amount_usd: number;
  status: {
    code: string;
    description: string;
    name: string;
    created_at: string;
    updated_at: string;
  };
  reference?: string;
  observation?: string;
  created_at: string;
  updated_at: string;
  withdraw_account: WithdrawAccount;
  transaction_banck_id: string;
}

class WithdrawServiceClass extends CoreApiService {
  private readonly ENDPOINTS = {
    WITHDRAW_ACCOUNTS: "withdraw-account",
    WITHDRAW_ACCOUNT_TYPES: "withdraw-account-type",
    USER_WITHDRAW: "user-withdraw",
    USER_WITHDRAW_FINISH: "user-withdraw/withdraw-",
  } as const;

  /**
   * Get enums / options for withdraw accounts (countries, document types, currencies)
   */
  async getWithdrawEnums(): Promise<any> {
    return this.get(`${this.ENDPOINTS.WITHDRAW_ACCOUNTS}/enums`);
  }

  // Account Management
  /**
   * Get all withdraw accounts for authenticated user
   */
  async getWithdrawAccounts(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<WithdrawAccount>> {
    const queryString = this.buildQueryString({ page, limit });
    const resp = await this.get(
      `${this.ENDPOINTS.WITHDRAW_ACCOUNTS}?${queryString}`,
    );

    return adaptSequelizePagination<WithdrawAccount>(resp, page, limit);
  }

  /**
   * Get specific withdraw account by ID
   */
  async getWithdrawAccount(id: string): Promise<WithdrawAccount> {
    return this.get(`${this.ENDPOINTS.WITHDRAW_ACCOUNTS}/${id}`);
  }

  /**
   * Create new withdraw account
   */
  async createWithdrawAccount(
    data: CreateWithdrawAccountRequest,
  ): Promise<WithdrawAccount> {
    return this.post(this.ENDPOINTS.WITHDRAW_ACCOUNTS, data);
  }

  /**
   * Update existing withdraw account
   */
  async updateWithdrawAccount(
    id: string,
    data: UpdateWithdrawAccountRequest,
  ): Promise<WithdrawAccount> {
    return this.put(`${this.ENDPOINTS.WITHDRAW_ACCOUNTS}/${id}`, data);
  }

  /**
   * Deactivate withdraw account
   */
  async deactivateWithdrawAccount(id: string): Promise<void> {
    return this.put(`${this.ENDPOINTS.WITHDRAW_ACCOUNTS}/disactive/${id}`);
  }

  /**
   * Delete withdraw account permanently
   */
  async deleteWithdrawAccount(id: string): Promise<void> {
    return this.delete(`${this.ENDPOINTS.WITHDRAW_ACCOUNTS}/${id}`);
  }

  /**
   * Reactivate withdraw account
   */
  async activateWithdrawAccount(id: string): Promise<void> {
    return this.put(`${this.ENDPOINTS.WITHDRAW_ACCOUNTS}/active/${id}`);
  }

  // Account Types
  /**
   * Get all available account types
   */
  async getWithdrawAccountTypes(): Promise<WithdrawAccountType[]> {
    return this.get(this.ENDPOINTS.WITHDRAW_ACCOUNT_TYPES);
  }

  // Withdraw Operations
  /**
   * Request withdraw of BeCoins to bank account
   */
  async requestWithdraw(data: WithdrawRequest): Promise<any> {
    // Validate data
    if (!data.amountBecoin || data.amountBecoin <= 0) {
      throw new Error("El monto debe ser mayor a 0");
    }

    if (!data.withdraw_account_id) {
      throw new Error("Debe seleccionar una cuenta de destino");
    }

    return this.post(`${this.ENDPOINTS.USER_WITHDRAW}/withdraw`, data);
  }

  /**
   * Get user withdraw history
   */
  async getWithdrawHistory(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<UserWithdraw>> {
    const queryString = this.buildQueryString({ page, limit });
    const res = await this.get(
      `${this.ENDPOINTS.USER_WITHDRAW}?${queryString}`,
    );
    return adaptSequelizePagination<UserWithdraw>(res, page, limit);
  }
  /**
   * Aprove user withdraw ID
   */
  async approveWithdraw(data: {
    user_withdraw_id: string;
    observation?: string;
    reference?: string;
  }): Promise<UserWithdraw> {
    const res = await this.post(
      `${this.ENDPOINTS.USER_WITHDRAW_FINISH}completed`,
      data,
    );
    return res;
  }
  /**
   * Edit user withdraw ID
   */
  async rejectWithdraw(data: {
    user_withdraw_id: string;
    observation?: string;
    reference?: string;
  }): Promise<UserWithdraw> {
    const res = await this.post(
      `${this.ENDPOINTS.USER_WITHDRAW_FINISH}failed`,
      data,
    );
    return res;
  }

  // Utility Methods
  /**
   * Validate account data
   */
  validateAccountData(
    data: CreateWithdrawAccountRequest | UpdateWithdrawAccountRequest,
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (
      "owner_name" in data &&
      (!data.owner_name || data.owner_name.trim().length < 2)
    ) {
      errors.push("El nombre del propietario es requerido");
    }

    if ("cbu" in data && data.cbu && data.cbu.length !== 22) {
      errors.push("El CBU debe tener exactamente 22 dígitos");
    }

    if ("alias" in data && data.alias && data.alias.trim().length < 6) {
      errors.push("El alias debe tener al menos 6 caracteres");
    }

    if ("phone" in data && data.phone && data.phone.length < 10) {
      errors.push("El teléfono debe tener al menos 10 dígitos");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format account number for display (hide middle digits)
   */
  formatAccountNumber(accountNumber: string): string {
    if (!accountNumber || accountNumber.length < 8) {
      return accountNumber;
    }

    const first4 = accountNumber.slice(0, 4);
    const last4 = accountNumber.slice(-4);
    const middle = "*".repeat(Math.max(0, accountNumber.length - 8));

    return `${first4}${middle}${last4}`;
  }

  /**
   * Get icon based on account type
   */
  getAccountTypeIcon(accountType: string): string {
    switch (accountType.toLowerCase()) {
      case "ahorros":
      case "savings":
        return "💰";
      case "corriente":
      case "checking":
        return "🏦";
      case "payphone":
        return "💳";
      default:
        return "🏦";
    }
  }

  /**
   * Health check for withdraw service
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      await this.getWithdrawAccountTypes();
      return {
        status: "OK",
        message: "WithdrawService está funcionando correctamente",
      };
    } catch (error) {
      return {
        status: "ERROR",
        message: `WithdrawService no está disponible: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      };
    }
  }
}

// Export singleton instance
export const WithdrawService = new WithdrawServiceClass();
