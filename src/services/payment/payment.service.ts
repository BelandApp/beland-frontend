import { CoreApiService } from "@/services/core/ApiService";

const core = new CoreApiService();
export interface StripeIntentResponse {
  amountUsd: number;
  clientSecret: string;
  clientTransactionId: string;
  currency: string;
  paymentIntentId: string;
  status: "PENDING" | "SUCCEEDED" | "FAILED";
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
  createStripeUrlWeb: async (
    amountUsd: number,
  ): Promise<StripeIntentResponse> => {
    const response = await core.post(`/stripe-topups/create-intent`, {
      amountUsd,
    });
    return response;
  },
};
