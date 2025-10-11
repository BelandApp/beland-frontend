/**
 * Payment Service - Consolidated payment operations
 * Handles payment types, processing, wallets, and transactions
 */

import { CoreApiService, PaginatedResponse } from "./core/ApiService";
import type { Wallet } from "./WalletApiService";

// Payment Types
export interface PaymentType {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  allowed_modes: PaymentMode[];
  minimum_amount?: number;
  maximum_amount?: number;
  processing_fee?: number;
  created_at: string;
  updated_at: string;
}

export type PaymentMode = "FULL" | "SPLIT" | "EQUAL_SPLIT";

export interface PaymentMethod {
  id: string;
  user_id: string;
  type: "card" | "bank_account" | "digital_wallet" | "crypto";
  provider: string; // 'stripe', 'paypal', 'payphone', etc.
  last_four?: string;
  brand?: string; // 'visa', 'mastercard', etc.
  is_default: boolean;
  is_active: boolean;
  expires_at?: string;
  metadata?: Record<string, any>;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: "payment" | "refund" | "withdrawal" | "deposit" | "fee";
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  amount: number;
  currency: string;
  description: string;
  reference_id?: string; // Order ID, withdrawal ID, etc.
  payment_method_id?: string;
  payment_method?: PaymentMethod;
  fee_amount?: number;
  net_amount: number;
  external_transaction_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface UserBalance {
  available: number;
  locked: number;
  currency: string;
}

export interface CreatePaymentDto {
  amount: number;
  currency?: string;
  payment_method_id?: string;
  payment_type_id: string;
  reference_id?: string; // Order ID
  description?: string;
  metadata?: Record<string, any>;
}

export interface ProcessPaymentDto {
  payment_intent_id: string;
  payment_method_id: string;
  confirm?: boolean;
  return_url?: string;
}

export interface WithdrawDto {
  amount: number;
  account_id: string;
  description?: string;
}

export interface TransactionQuery {
  user_id?: string;
  type?: Transaction["type"];
  status?: Transaction["status"];
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface ProcessPaymentDto {
  payment_intent_id: string;
  payment_method_id: string;
  confirmation_token?: string;
  use_wallet_balance?: boolean;
  wallet_amount?: number;
}

export interface WithdrawDto {
  amount: number;
  payment_method_id: string;
  description?: string;
}

export interface TransactionQuery {
  page?: number;
  limit?: number;
  type?: Transaction["type"];
  status?: Transaction["status"];
  start_date?: string;
  end_date?: string;
  reference_id?: string;
}

class PaymentServiceClass extends CoreApiService {
  private readonly ENDPOINTS = {
    PAYMENT_TYPES: "payment-types",
    PAYMENT_METHODS: "payment-methods",
    PAYMENTS: "payments",
    TRANSACTIONS: "transactions",
    WALLET: "wallet",
    WITHDRAWALS: "withdrawals",
    REFUNDS: "refunds",
  } as const;

  // Payment Types Management
  /**
   * Get available payment types
   */
  async getPaymentTypes(
    params: {
      active_only?: boolean;
      mode?: PaymentMode;
    } = {}
  ): Promise<PaymentType[]> {
    const queryString = this.buildQueryString(params);
    const endpoint = queryString
      ? `${this.ENDPOINTS.PAYMENT_TYPES}?${queryString}`
      : this.ENDPOINTS.PAYMENT_TYPES;

    return this.get<PaymentType[]>(endpoint);
  }

  // Payment Methods Management
  /**
   * Get user's payment methods
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return this.get<PaymentMethod[]>(this.ENDPOINTS.PAYMENT_METHODS);
  }

  /**
   * Add a new payment method
   */
  async addPaymentMethod(data: {
    type: PaymentMethod["type"];
    provider: string;
    token: string; // From payment provider (Stripe, etc.)
    is_default?: boolean;
    metadata?: Record<string, any>;
  }): Promise<PaymentMethod> {
    return this.post<PaymentMethod>(this.ENDPOINTS.PAYMENT_METHODS, data);
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(
    id: string,
    data: {
      is_default?: boolean;
      is_active?: boolean;
    }
  ): Promise<PaymentMethod> {
    return this.patch<PaymentMethod>(
      `${this.ENDPOINTS.PAYMENT_METHODS}/${id}`,
      data
    );
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(id: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(
      `${this.ENDPOINTS.PAYMENT_METHODS}/${id}`
    );
  }

  // Payment Processing
  /**
   * Create payment intent
   */
  async createPaymentIntent(data: CreatePaymentDto): Promise<{
    payment_intent_id: string;
    client_secret?: string;
    amount: number;
    currency: string;
    status: string;
  }> {
    return this.post(`${this.ENDPOINTS.PAYMENTS}/intent`, data);
  }

  /**
   * Process payment
   */
  async processPayment(data: ProcessPaymentDto): Promise<{
    success: boolean;
    transaction_id: string;
    status: Transaction["status"];
    amount: number;
    net_amount: number;
  }> {
    return this.post(`${this.ENDPOINTS.PAYMENTS}/process`, data);
  }

  /**
   * Confirm payment (for 3D Secure, etc.)
   */
  async confirmPayment(
    paymentIntentId: string,
    data: {
      confirmation_token?: string;
      payment_method_id?: string;
    }
  ): Promise<{
    success: boolean;
    transaction_id: string;
    status: string;
  }> {
    return this.post(
      `${this.ENDPOINTS.PAYMENTS}/${paymentIntentId}/confirm`,
      data
    );
  }

  // Wallet Management
  /**
   * Get user's wallet information
   */
  async getWallet(): Promise<Wallet> {
    return this.get<Wallet>(this.ENDPOINTS.WALLET);
  }

  /**
   * Add funds to wallet
   */
  async addFundsToWallet(data: {
    amount: number;
    payment_method_id: string;
  }): Promise<{
    success: boolean;
    transaction_id: string;
    new_balance: number;
  }> {
    return this.post(`${this.ENDPOINTS.WALLET}/add-funds`, data);
  }

  /**
   * Withdraw funds from wallet
   */
  async withdrawFromWallet(data: WithdrawDto): Promise<{
    success: boolean;
    withdrawal_id: string;
    transaction_id: string;
    estimated_completion: string;
  }> {
    return this.post(`${this.ENDPOINTS.WITHDRAWALS}`, data);
  }

  /**
   * Get withdrawal history
   */
  async getWithdrawals(
    params: {
      page?: number;
      limit?: number;
      status?: "pending" | "processing" | "completed" | "failed";
    } = {}
  ): Promise<
    PaginatedResponse<{
      id: string;
      amount: number;
      status: string;
      payment_method: PaymentMethod;
      created_at: string;
      completed_at?: string;
    }>
  > {
    const queryString = this.buildQueryString(params);
    const endpoint = queryString
      ? `${this.ENDPOINTS.WITHDRAWALS}?${queryString}`
      : this.ENDPOINTS.WITHDRAWALS;

    return this.get<PaginatedResponse<any>>(endpoint);
  }

  // Transaction History
  /**
   * Get user's transaction history
   */
  async getTransactions(
    query: TransactionQuery = {}
  ): Promise<PaginatedResponse<Transaction>> {
    const queryString = this.buildQueryString(query);
    const endpoint = queryString
      ? `${this.ENDPOINTS.TRANSACTIONS}?${queryString}`
      : this.ENDPOINTS.TRANSACTIONS;

    return this.get<PaginatedResponse<Transaction>>(endpoint);
  }

  /**
   * Get a specific transaction
   */
  async getTransaction(id: string): Promise<Transaction> {
    return this.get<Transaction>(`${this.ENDPOINTS.TRANSACTIONS}/${id}`);
  }

  // Refunds
  /**
   * Request refund for a transaction
   */
  async requestRefund(
    transactionId: string,
    data: {
      amount?: number; // Partial refund amount
      reason: string;
    }
  ): Promise<{
    success: boolean;
    refund_id: string;
    estimated_processing_days: number;
  }> {
    return this.post(`${this.ENDPOINTS.REFUNDS}`, {
      transaction_id: transactionId,
      ...data,
    });
  }

  /**
   * Get refund status
   */
  async getRefundStatus(refundId: string): Promise<{
    id: string;
    transaction_id: string;
    amount: number;
    status: "pending" | "processing" | "completed" | "failed";
    reason: string;
    created_at: string;
    completed_at?: string;
  }> {
    return this.get(`${this.ENDPOINTS.REFUNDS}/${refundId}`);
  }

  // Payment Analytics
  /**
   * Get payment analytics for user
   */
  async getPaymentAnalytics(
    params: {
      period?: "week" | "month" | "quarter" | "year";
      start_date?: string;
      end_date?: string;
    } = {}
  ): Promise<{
    total_spent: number;
    total_transactions: number;
    average_transaction: number;
    by_payment_method: Record<string, number>;
    by_category: Record<string, number>;
    monthly_spending: { month: string; amount: number }[];
  }> {
    const queryString = this.buildQueryString(params);
    return this.get(`payments/analytics?${queryString}`);
  }

  // External Provider Integration
  /**
   * Get Payphone payment link (Ecuador-specific)
   */
  async createPayphonePayment(data: {
    amount: number;
    order_id: string;
    description: string;
    client_transaction_id?: string;
  }): Promise<{
    payment_url: string;
    transaction_id: string;
    expires_at: string;
  }> {
    return this.post("payments/payphone", data);
  }

  /**
   * Verify Payphone payment status
   */
  async verifyPayphonePayment(transactionId: string): Promise<{
    status: "pending" | "completed" | "failed";
    amount: number;
    client_transaction_id?: string;
  }> {
    return this.get(`payments/payphone/${transactionId}/verify`);
  }
}

// Export singleton instance
export const PaymentService = new PaymentServiceClass();
