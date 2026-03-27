import { PaymentStripeService } from "src/services/payment/payment.service";
import { PaymentStrategy } from "./payment.strategy";

export const useWebPayment = (): PaymentStrategy => {
  const pay = async (amount: number, userId: string) => {
    const url = await PaymentStripeService.createStripeUrlWeb(amount, userId);

    // redirección a Stripe
    window.location.href = url;

    return { success: true };
  };

  return { pay };
};
