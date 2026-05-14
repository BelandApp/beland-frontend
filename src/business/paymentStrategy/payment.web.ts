import { PaymentStripeService } from "src/services/payment/payment.service";
import { PaymentStrategy } from "./payment.strategy";

export const useWebPayment = (): PaymentStrategy => {
  const pay = async (amount: number, userId: string) => {
    const paymentIntent = await PaymentStripeService.createStripeUrlWeb(
      amount,
      userId,
    );
    return {
      success: true,
      clientSecret: paymentIntent.clientSecret,
    };
  };

  return { pay };
};
