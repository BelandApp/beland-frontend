import {
  PaymentStripeService,
  transactionType,
} from "src/services/payment/payment.service";
import { PaymentStrategy } from "./payment.strategy";

export const useWebPayment = (): PaymentStrategy => {
  const pay = async (amount: number, transactionType: transactionType) => {
    const paymentIntent = await PaymentStripeService.createStripeUrlWeb(
      amount,
      transactionType,
    );
    return {
      success: true,
      clientSecret: paymentIntent.clientSecret,
    };
  };

  return { pay };
};
