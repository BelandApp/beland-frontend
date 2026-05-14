import { PropsWithChildren } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
const stripeKey = process.env.EXPO_PUBLIC_STRIPE_KEY;
const stripePromise = loadStripe(stripeKey);
export const StripeProviderWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // 🌐 Web → no Stripe RN
  return <Elements stripe={stripePromise}>{children}</Elements>;
};
