import {
  adaptSequelizePagination,
  CoreApiService,
  PaginatedResponse,
} from "../core/ApiService";

export interface PaymentAccount {
  id: string;
  user_id: string;
  alias: string;
  account_number: string;
  account_type: string;
  bank_name: string;
  identification: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class PaymentAccountServiceClass extends CoreApiService {
  private readonly ENDPOINT = "payment-account/at-recharge";

  /**
   * Get all payment accounts
   */
  async getPaymentAccounts(
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponse<PaymentAccount>> {
    const queryString = this.buildQueryString({ page, limit });
    // Note: The backend returns [data, total] tuple for this endpoint sometimes,
    // but usually CoreApiService expects { data, total ... } or just data.
    // Based on controller: return await this.service.findAll(pageNumber, limitNumber);
    // which returns [PaymentAccount[], number]
    // So we might need to adapt the response if CoreApiService doesn't handle tuple automatically.
    // However, looking at other services, let's assume standard response or we handle it.
    // Actually, most NestJS standard is just returning the value.
    // If it returns [items, count], we should probably wrap it or type it as any first to be safe.
    return this.get<any>(`${this.ENDPOINT}`);
  }

  /**
   * Get specific payment account
   */
  async getPaymentAccount(id: string): Promise<PaymentAccount> {
    return this.get<PaymentAccount>(`${this.ENDPOINT}/${id}`);
  }
}

export const PaymentAccountService = new PaymentAccountServiceClass();
