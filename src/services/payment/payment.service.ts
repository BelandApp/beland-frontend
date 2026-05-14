import { CoreApiService } from "@/services/core/ApiService";

const core = new CoreApiService();
export interface StripeIntentResponse {
  amountUsd: number;
  clientSecret: string;
  clientTransactionId: string;
  currency: string;
  paymentIntentId: string;
  status: "PENDING" | "SUCCEEDED" | "FAILED"; // ajustá según backend
  topupId: string;
}
export const PaymentStripeService = {
  createStripeIntentMobile: async (amountUsd: number) => {
    const response = await core.post(`/stripe-toups/create-intent`, {
      amountUsd,
    });
    if (!response.ok) throw new Error("Error creando payment intent on Stripe");
    return response;
  },
<<<<<<< HEAD
  createStripeUrlWeb: async (amount: number, userId: string) => {
    const response = await core.post(`/stripe-topups/create-intent`, {
      amountUsd: amount,
=======
  createStripeUrlWeb: async (
    amountUsd: number,
  ): Promise<StripeIntentResponse> => {
    const response = await core.post(`/stripe-topups/create-intent`, {
      amountUsd,
>>>>>>> 7e3df05ff23c90ded290f2b1089340e4cf9045e0
    });
    return response;
  },
};
