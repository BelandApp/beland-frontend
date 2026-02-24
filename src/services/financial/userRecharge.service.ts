import { User } from "src/context";
import { CoreApiService, PaginatedResponse } from "../core";
import { adaptSequelizePagination } from "../core/ApiService";
export type UserRecharge = {
  id: string;
  payment_account_id: string;
  transfer_id: string;
  ticket_image_url: string;
  user: User;
  amount_becoin: number;
  amount_usd: number;
  paymentAccount: {
    accountHolder: string;
    alias: string | null;
    bank: string;
    cbu: string | null;
    id: string;
    nro_account: string;
    type_account: string;
  };
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
};
class UserRechargeServiceClass extends CoreApiService {
  private readonly ENDPOINTS = {
    USER_RECHARGE: "user-recharge",
    APROVE: "user-recharge/completed",
    REJECT: "user-recharge/failed",
  };
  async getAll(page: number = 1, limit: number = 10): Promise<UserRecharge[]> {
    // const queryString = this.buildQueryString({ page, limit });
    const res = await this.get(`${this.ENDPOINTS.USER_RECHARGE}`);
    return res[0];
  }
  async aprove(id: string) {
    return await this.put(`${this.ENDPOINTS.APROVE}/${id}`);
  }
  async reject(id: string) {
    return await this.put(`${this.ENDPOINTS.REJECT}/${id}`);
  }
}
export const UserRechargeService = new UserRechargeServiceClass();
