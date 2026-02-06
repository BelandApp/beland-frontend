import { User } from "src/context";
import { CoreApiService, PaginatedResponse } from "../core";
export type UserRecharge = {
  id: string;
  payment_account_id: string;
  transfer_id: string;
  ticket_image_url: string;
  user: User;
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
};
class UserRechargeServiceClass extends CoreApiService {
  private readonly ENDPOINTS = {
    USER_RECHARGE: "user/recharge",
  };
  async getAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<UserRecharge>> {
    const queryString = this.buildQueryString({ page, limit });
    return this.get(`${this.ENDPOINTS.USER_RECHARGE}?${queryString}`);
  }
}
export const UserRechargeService = new UserRechargeServiceClass();
