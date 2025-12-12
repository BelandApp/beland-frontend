import { CoreApiService } from "@/services/core/ApiService";

const core = new CoreApiService();

export const discountService = {
  getDiscounts: async () => {
    try {
      const discounts = await core.get(`/coupons`);
      return discounts;
    } catch (error) {
      console.error("Error fetching discounts:", error);
      return [];
    }
  },
};
