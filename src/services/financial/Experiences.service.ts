import { Product } from "src/types";
import { CoreApiService, PaginatedResponse, WithdrawAccount } from "../core";
import { adaptSequelizePagination } from "../core/ApiService";

export interface ExperiencePurchase {
  id: string;

  payphone_transaction_id: string | null;

  email: string;

  phone: string;

  total_amount: number;

  currency: string;

  status: "RESERVADO" | "ENTREGADO" | "PAGADO";

  is_reserved: boolean;

  payment_method: "PAYPHONE" | "TRANSFER" | string;

  orange_reward_amount: number;

  orange_reward_credited: boolean;
  created_at: string;

  updated_at: string;

  items: ExperiencePurchaseItem[];
}

export interface ExperiencePurchaseItem {
  id: string;

  purchase: ExperiencePurchase;

  purchase_id: string;

  product: Product;

  product_id: string;

  quantity: number;

  unit_price: number;

  subtotal: number;
}

class ExperiencesPurchaseServiceClass extends CoreApiService {
  private readonly ENDPOINTS = {
    EXPERIENCES: "experiences/purchases",
  } as const;

  // Account Management
  /**
   * Get all experiences purchases
   */
  async getAllExperiences(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<ExperiencePurchase>> {
    const queryString = this.buildQueryString({ page, limit });
    const resp = await this.get(`${this.ENDPOINTS.EXPERIENCES}?${queryString}`);
    return adaptSequelizePagination<ExperiencePurchase>(resp, page, limit);
  }

  /**
   * Get specific experience purchase by ID
   */
  async getExperienceID(id: string): Promise<ExperiencePurchase> {
    return this.get(`${this.ENDPOINTS.EXPERIENCES}/${id}`);
  }
  /**
   * PATCH to DELIVERED experience purchase by ID
   */
  async patchExperiencePurchase(id: string): Promise<ExperiencePurchase> {
    return this.patch(`${this.ENDPOINTS.EXPERIENCES}/${id}/status/delivered`);
  }
}

export const ExperiencesPurchasesService =
  new ExperiencesPurchaseServiceClass();
