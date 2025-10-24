import Constants from "expo-constants";
import { apiRequest } from "../api";
const API_URL = Constants.expoConfig?.extra?.apiUrl as string;
export const discountService = {
  getDiscounts: async () => {
    try {
     const response = await apiRequest(`${API_URL}/coupons`);
      const discounts = await response.json();
      return discounts;
    } catch (error) {
      console.error("Error fetching discounts:", error);
      return [];
    }
  }
};
