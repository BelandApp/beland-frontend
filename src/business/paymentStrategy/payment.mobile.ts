import { useStripe } from "@stripe/stripe-react-native";
import { useState } from "react";
import { useAuth } from "src/context";
import { notify } from "src/hooks/notification/notify.external";
import { PaymentStripeService } from "src/services/payment/payment.service";
import { PaymentStrategy } from "./payment.strategy";

export const useMobilePayment = (): PaymentStrategy => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const pay = async (amount: number, userId: string) => {
    const { clientSecret } =
      await PaymentStripeService.createStripeIntentMobile(amount, userId);

    const { error: initError } = await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: "BelandApp",
      returnURL: "beland://processPayment",
      // chequear que tengamos esto
      defaultBillingDetails: {
        email: user?.email,
        name: user?.full_name,
        phone: user?.phone,
        address: {
          city: user?.city,
          country: user?.country,
        },
      },
    });

    if (initError) {
      throw initError;
    } else {
      setLoading(true);
    }

    // Mostrar UI
    const { error: presentError } = await presentPaymentSheet();

    if (presentError) {
      notify.error({ message: "Error en el servicio de Stripe" });
      return { success: false };
    }
    notify.info({ message: "Procesando pago..." });
    return { success: true };
  };

  return { pay };
};
