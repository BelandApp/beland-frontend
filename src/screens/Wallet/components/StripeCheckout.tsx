import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";

export const StripeCheckout = ({ clientSecret }: { clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleConfirm = async () => {
    if (!stripe || !elements) return;

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/success",
      },
    });

    if (result.error) {
      console.error(result.error.message);
    }
  };

  return (
    <div>
      <PaymentElement />
      <button onClick={handleConfirm}>Confirmar pago</button>
    </div>
  );
};
