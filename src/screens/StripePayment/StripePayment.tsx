import { View, Text } from "react-native";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import React from "react";
import { Button, ThemedHeader } from "src/components";
import { notify } from "src/hooks/notification/notify.external";
import { useCustomNavigation } from "src/hooks";

type StripePaymentProps = {
  clientSecret: string;
};
const StripePayment: React.FC<StripePaymentProps> = ({ clientSecret }) => {
  const { navigate } = useCustomNavigation();

  const stripe = useStripe();
  const elements = useElements();

  const handlePay = async () => {
    if (!stripe || !elements || !clientSecret) return;

    const card = elements.getElement(CardElement);

    if (!card) return;
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card,
      },
    });

    if (result.error) {
      notify.error({ message: "Hubo un error, intenta luego" });
    } else if (result.paymentIntent?.status === "succeeded") {
      notify.success({ message: "Pago exitoso, se acreditara en la brevedad" });
      navigate("WalletHistoryScreen");
    }
  };
  const handleBeforeClose = () => {
    return new Promise<boolean>((resolve) => {
      notify.confirm({
        message: "¿Seguro que quieres salir? Perderás tu progreso",
        onConfirm: () => navigate("RechargeScreen"),
        onCancel: () => resolve(false),
      });
    });
  };
  return (
    <>
      <ThemedHeader
        title="Pago en Stripe"
        canGoBack
        onBackPress={handleBeforeClose}
      />
      <View className="flex-col gap-2 justify-center items-center">
        <Text>Ingresa los datos de tu tarjeta</Text>
        <CardElement />
        <Button title="Pagar" onPress={handlePay} />
      </View>
    </>
  );
};

export default StripePayment;
