import { CoreApiService } from "@/services/core/ApiService";

const core = new CoreApiService();

export const PaymentStripeService = {
  createStripeIntentMobile: async (amount: number, userId: string) => {
    // TODO CHEQUEAR EL ENDPOINT
    const response = await core.post(`/payments`, { amount, userId });
    if (!response.ok) throw new Error("Error creando payment intent on Stripe");
    return response;
  },
  createStripeUrlWeb: async (amount: number, userId: string) => {
    const response = await core.post(`/paymentWeb`, { amount, userId });
    return response;
  },
};
