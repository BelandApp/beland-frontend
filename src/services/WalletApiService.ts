/**
 * Wallet Service - Consolidated wallet operations
 * Handles wallets, transfers, recharges, and payment amounts
 */

import { CoreApiService, PaginatedResponse } from "./core/ApiService";

// Wallet Types
export interface Wallet {
  id: string;
  user_id: string;
  becoin_balance: number;
  locked_balance: number;
  address?: string;
  alias?: string;
  qr?: string;
  private_key_encrypted?: string;
  created_at: string;
}

export interface RechargeRequest {
  wallet_id: string;
  amountUsd: number;
  referenceCode: string;
  clientTransactionId: string;
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
    updateData: Partial<Wallet>
  ): Promise<Wallet> {
    return this.put(walletId, updateData);
  }

  /**
   * Get all wallets (admin)
   */
  async getAllWallets(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Wallet>> {
    const queryString = this.buildQueryString({ page, limit });
    return this.get(`?${queryString}`);
  }

  // Wallet Search
  /**
   * Find wallet by alias
   */
  async findWalletByAlias(alias: string): Promise<Wallet> {
    return this.get(`alias/${alias}`);
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
  async createRecharge(
    rechargeData: RechargeRequest
  ): Promise<{ wallet: Wallet }> {
    return this.post("recharge", rechargeData);
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
   */
  async getDataPayment(identifier: string): Promise<any> {
    const safeId = encodeURIComponent(identifier);
    return this.get(`data-Payment/${safeId}`);
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
  async createAmountToPayment(amount: number): Promise<any> {
    return this.request("/amount-to-payment", {
      method: "POST",
      body: JSON.stringify({ amount }),
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
    amount: number
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
      | "BANK_TRANSFER" = "CREDIT_CARD"
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
      wallet_id: wallet.id,
      amountUsd: amountUsd,
      referenceCode: referenceCode,
      payphone_transactionId: Date.now(),
      clientTransactionId,
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
        "El monto de recarga debe ser un número válido y mayor a cero."
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
      wallet_id: data.userId,
      amountUsd: amountNum,
      referenceCode: `RCH-${Date.now()}`,
      clientTransactionId,
      payphone_transactionId: Date.now(),
    };

    return this.createRecharge(payload);
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
