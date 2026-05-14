import { PropsWithChildren } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Constants from "expo-constants";

const stripePromise = loadStripe(
  "pk_test_51Rnp04D63qxcjsNssQIMLs60iaDGZlnejeVZIAds4twCrHixh2wxUnxxaAhag50I0XnQCSg222mBvIXJ2jG3YUco00SH5vgvY4",
);
export const StripeProviderWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  console.log("Provider", stripePromise);
  // 🌐 Web → no Stripe RN
  return <Elements stripe={stripePromise}>{children}</Elements>;
};
