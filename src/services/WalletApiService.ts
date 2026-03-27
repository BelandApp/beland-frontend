/**
 * Wallet Service - Consolidated wallet operations
 * Handles wallets, transfers, recharges, and payment amounts
 */

import { Transaction } from "src/screens/Wallet";
import {
  adaptSequelizePagination,
  CoreApiService,
  PaginatedResponse,
} from "./core/ApiService";
import { User } from "src/context";

// Wallet Types
export interface Wallet {
  id: string;
  user_id: string;
  becoin_balance: number;
  becoin_green: number;
  becoin_orange: number;
  locked_balance: number;
  address?: string;
  alias?: string;
  qr?: string;
  private_key_encrypted?: string;
  created_at: string;
  user?: User;
}

export interface RechargeRequest {
  amountUsd: number;
  referenceCode: string;
  clientTransactionId: number;
  payphone_transactionId: number;
}

export interface TransferRequest {
  toWalletId: string;
  amountBecoin: number;
  amount_payment_id?: string;
  user_resource_id?: string;
}

export interface WalletCreateRequest {
  userId?: string;
  address?: string;
  alias?: string;
  private_key_encrypted?: string;
}

class WalletServiceClass extends CoreApiService {
  protected basePath = "/wallets";

  /**
   * Make request to wallet-specific endpoints
   */
  protected async walletRequest<T = any>(
    endpoint: string,
    options: any = {},
  ): Promise<T> {
    const walletEndpoint = endpoint.startsWith("/")
      ? `/wallets${endpoint}`
      : `/wallets/${endpoint}`;
    return this.request<T>(walletEndpoint, options);
  }

  /**
   * Override get method to use wallet endpoints
   */
  public get<T = any>(endpoint: string, options: any = {}): Promise<T> {
    return this.walletRequest<T>(endpoint, { ...options, method: "GET" });
  }

  /**
   * Override post method to use wallet endpoints
   */
  public post<T = any>(
    endpoint: string,
    data?: any,
    options: any = {},
  ): Promise<T> {
    return this.walletRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Override put method to use wallet endpoints
   */
  public put<T = any>(
    endpoint: string,
    data?: any,
    options: any = {},
  ): Promise<T> {
    return this.walletRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Wallet Management
  /**
   * Get current user's wallet
   */
  async getCurrentUserWallet(): Promise<Wallet> {
    return this.get("user");
  }

  /**
   * Get wallet by ID
   */
  async getWalletById(walletId: string): Promise<Wallet> {
    return this.get(walletId);
  }

  /**
   * Create new wallet
   */
  async createWallet(walletData: WalletCreateRequest): Promise<Wallet> {
    return this.post("", walletData);
  }

  /**
   * Update wallet
   */
  async updateWallet(
    walletId: string,
    updateData: Partial<Wallet>,
  ): Promise<Wallet> {
    return this.put(walletId, updateData);
  }

  /**
   * Get all wallets (admin)
   */
  async getAllWallets(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<Wallet>> {
    const queryString = this.buildQueryString({ page, limit });
    return this.get(`?${queryString}`);
  }

  // Wallet Search
  /**
   * Find wallet by alias
   */
  async findWalletByAlias(alias: string): Promise<Wallet> {
    // Normalize alias to lowercase to match database format
    const normalizedAlias = alias.toLowerCase().trim();
    return this.get(`alias/${normalizedAlias}`);
  }

  /**
   * Get wallet QR code
   */
  async getWalletQR(): Promise<{ qr: string }> {
    return this.get("qr");
  }

  /**
   * Generate alias and QR if not exists
   */
  async generateAliasAndQr(): Promise<Wallet> {
    return this.put("alias-qr");
  }

  // Transfers
  /**
   * Transfer BeCoins between users
   */
  async transferBetweenUsers(transferData: TransferRequest): Promise<any> {
    return this.post("transfer", transferData);
  }

  /**
   * Transfer between users with alias resolution
   */
  async transferToAlias(alias: string, amountBecoin: number): Promise<any> {
    // First find the wallet by alias
    const recipientWallet = await this.findWalletByAlias(alias);

    // Then transfer to that wallet
    return this.transferBetweenUsers({
      toWalletId: recipientWallet.id,
      amountBecoin,
    });
  }

  // Recharges
  /**
   * Create recharge (buy BeCoins)
   */
  async createRecharge(rechargeData: RechargeRequest): Promise<any> {
    return this.post("recharge", rechargeData);
  }

  /**
   * Purchase and Recharge (for QR payments)
   */
  async createPurchaseRecharge(
    walletId: string,
    purchaseData: {
      amountUsd: number;
      referenceCode: string;
      payphone_transactionId: number;
      clientTransactionId: number;
      wallet_id: string;
      amount_payment_id?: string;
    },
  ): Promise<any> {
    return this.post(`purchase-recharge/${walletId}`, purchaseData);
  }

  /**
   * Purchase BeCoins
   */
  async createPurchaseBecoin(purchaseData: {
    toWalletId: string;
    amountBecoin: number;
    amount_payment_id?: string;
    user_resource_id?: string;
  }): Promise<any> {
    return this.post("purchase-becoin", purchaseData);
  }

  /**
   * Purchase resource with BeCoins
   */
  async purchaseResource(resourceId: string, quantity: number): Promise<any> {
    return this.post("purchase-resource", {
      resource_id: resourceId,
      quantity: quantity,
    });
  }

  // Payment Data
  /**
   * Get payment data by identifier (for QR scans)
   * Accepts string (UUID/alias/address) or object (with wallet_id, id, alias, etc.)
   */
  async getDataPayment(rawIdentifier: any): Promise<any> {
    try {
      // Normalizar identificador: puede venir como JSON-stringified desde algunos QR
      let identifier: any = rawIdentifier;

      if (typeof identifier === "string") {
        // Intentar decodeURIComponent en caso venga url-encoded
        try {
          const decoded = decodeURIComponent(identifier);
          if (decoded && decoded !== identifier) {
            identifier = decoded;
          }
        } catch (e) {
          // ignore
        }

        // Si es un JSON string, parsearlo
        const trimmed = (identifier || "").toString().trim();
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
          try {
            const obj = JSON.parse(trimmed);
            identifier = obj;
          } catch (e) {
            // no es JSON válido, mantener string
          }
        }
      }

      // Si ahora es objeto, extraer campos relevantes
      if (identifier && typeof identifier === "object") {
        // Priorizar wallet_id/id, luego alias, luego address
        identifier =
          identifier.wallet_id ||
          identifier.id ||
          identifier.walletId ||
          identifier.alias ||
          identifier.address ||
          identifier.amount_to_payment_id ||
          null;
      }

      if (!identifier) {
        throw new Error("Identificador de wallet inválido");
      }

      let walletId: string;

      // Verificar si el identificador es un UUID válido
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      if (uuidRegex.test(identifier)) {
        // Es un UUID, usarlo directamente
        walletId = identifier;
      } else {
        // Es un alias, necesitamos obtener el wallet primero
        console.log("🔍 Buscando wallet por alias:", identifier);
        const wallet = await this.findWalletByAlias(identifier);
        walletId = wallet.id;
        console.log("✅ Wallet encontrado por alias:", walletId);
      }

      // Ahora llamar al endpoint data-Payment con el wallet_id UUID
      return this.get(`data-Payment/${walletId}`);
    } catch (error) {
      console.error("Error al obtener datos de pago:", error);
      throw error;
    }
  }

  // Preset Amount Methods (via direct request to different endpoints)
  /**
   * Get preset amounts
   */
  async getPresetAmounts(): Promise<any[]> {
    return this.request("/preset-amount", { method: "GET" });
  }

  /**
   * Create preset amount
   */
  async createPresetAmount(data: {
    name: string;
    amount: number;
    message?: string;
  }): Promise<any> {
    return this.request("/preset-amount", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete preset amount
   */
  async deletePresetAmount(id: string): Promise<void> {
    return this.request(`/preset-amount/${id}`, { method: "DELETE" });
  }

  // Amount to Payment Methods (via direct request to different endpoints)
  /**
   * Get amounts to payment
   */
  async getAmountsToPayment(): Promise<any[]> {
    return this.request("/amount-to-payment", { method: "GET" });
  }

  /**
   * Create amount to payment
   */
  async createAmountToPayment(
    amountOrPayload: number | { amount: number; message?: string },
  ): Promise<any> {
    const payload =
      typeof amountOrPayload === "number"
        ? { amount: amountOrPayload }
        : amountOrPayload;
    return this.request("/amount-to-payment", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Delete amount to payment
   */
  async deleteAmountToPayment(id: string): Promise<void> {
    return this.request(`/amount-to-payment/${id}`, { method: "DELETE" });
  }

  // Legacy compatibility methods
  /**
   * @deprecated Use getCurrentUserWallet() instead
   */
  async getWalletByUserId(userEmail: string, userId?: string): Promise<Wallet> {
    return this.getCurrentUserWallet();
  }

  /**
   * @deprecated Use findWalletByAlias() instead but handle errors properly
   */
  async findWalletByIdentifier(alias: string): Promise<Wallet | null> {
    try {
      return await this.findWalletByAlias(alias);
    } catch (error) {
      return null;
    }
  }

  /**
   * @deprecated Use transferToAlias() instead
   */
  async transferBetweenUsersLegacy(
    senderEmail: string,
    recipientIdentifier: string,
    amount: number,
  ): Promise<any> {
    const result = await this.transferToAlias(recipientIdentifier, amount);
    return { ...result, isPending: false };
  }

  /**
   * @deprecated Use createRecharge() instead
   */
  async rechargeByUserEmail(
    userEmail: string,
    userId: string,
    amountUsd: number,
    rechargeMethod:
      | "CREDIT_CARD"
      | "DEBIT_CARD"
      | "PAYPHONE"
      | "BANK_TRANSFER" = "CREDIT_CARD",
  ): Promise<{ wallet: Wallet }> {
    const wallet = await this.getCurrentUserWallet();

    const referenceCode = `RCH-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const clientTransactionId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-tx-uuid`;

    const rechargeData: RechargeRequest = {
      amountUsd: amountUsd,
      referenceCode: referenceCode,
      payphone_transactionId: Date.now(),
      clientTransactionId: Number(clientTransactionId),
    };

    return this.createRecharge(rechargeData);
  }

  /**
   * @deprecated Use createRecharge() instead
   */
  async rechargeWithPayphoneAPI(data: {
    userId: string;
    email: string;
    amount: number;
    paymentMethod: string;
  }): Promise<{ wallet: Wallet }> {
    const amountNum = Number(data.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      throw new Error(
        "El monto de recarga debe ser un número válido y mayor a cero.",
      );
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const clientTransactionId = uuidRegex.test(data.userId)
      ? data.userId
      : typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-fake-uuid-frontend`;

    const payload: RechargeRequest = {
      amountUsd: amountNum,
      referenceCode: `RCH-${Date.now()}`,
      payphone_transactionId: Date.now(),
      clientTransactionId: Number(clientTransactionId),
    };

    return this.createRecharge(payload);
  }

  /**
   * Create recharge via Bank Transfer
   */
  async createRechargeTransfer(data: {
    payment_account_id: string;
    amount_usd: number;
    transfer_id: string;
    ticket_image_url: string;
  }): Promise<any> {
    // Note: Endpoint is /user-recharge, handled by UserRechargeController
    // Since this service base path is /wallets, we need to use directApiCall or absolute path if request supports it.
    // CoreApiService buildUrl handles absolute paths or paths pending base_url.
    // If we pass /user-recharge, buildUrl might overwrite.
    // Let's use directApiCall equivalent or override.
    // Actually directApiCall is private but available.
    return this.directApiCall("user-recharge", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Get wallet transactions (uses transactions endpoint, not wallets)
   */
  async getTransactions(
    page: number = 1,
    limit: number = 20,
    walletId?: string,
  ): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (walletId) {
      params.append("wallet_id", walletId);
    }

    const resp = await this.directApiCall(`transactions?${params.toString()}`);

    return adaptSequelizePagination<Transaction>(resp, page, limit);
  }

  /**
   * Direct API call without wallet prefix
   */
  private async directApiCall(
    endpoint: string,
    options: any = {},
  ): Promise<any> {
    const token = await this.getAuthToken();
    const url = `${this.baseUrl}/${endpoint}`;

    console.log(`🌐 Direct API Request: ${options.method || "GET"} ${url}`);

    const response = await fetch(url, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = null;
      }
      throw new Error(
        errorData?.message || `HTTP error! status: ${response.status}`,
      );
    }

    return response.json();
  }

  /**
   * Health check for wallet service
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      await this.get("?page=1&limit=1");
      return {
        status: "OK",
        message: "WalletService está funcionando correctamente",
      };
    } catch (error) {
      return {
        status: "ERROR",
        message: `WalletService no está disponible: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      };
    }
  }
}

// Export singleton instance
export const WalletService = new WalletServiceClass();
