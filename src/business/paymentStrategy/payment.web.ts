import { PaymentStripeService } from "src/services/payment/payment.service";
import { PaymentStrategy } from "./payment.strategy";

export const useWebPayment = (): PaymentStrategy => {
  const pay = async (amount: number) => {
    const response = await PaymentStripeService.createStripeUrlWeb(amount);
    console.log("URL DEVUELTO", response);
    // redirección a Stripe
    // window.location.href = url;

    return { success: true };
  };

  return { pay };
};
