import { Transaction } from "src/screens/Wallet";
import { CoreApiService } from "../core";

class TransfersClass extends CoreApiService {
  private readonly ENDPOINTS = {
    transferId: "transactions",
  };

  /**
   * Get transaction by ID
   */
  async GetTransactionById(transactionId: string): Promise<Transaction> {
    const token = await this.getAuthToken();
    return await this.get(`${this.ENDPOINTS.transferId}/${transactionId}`, {
      headers: [["Authorization", `Bearer ${token}`]],
    });
  }
}

export const TransfersService = new TransfersClass();
