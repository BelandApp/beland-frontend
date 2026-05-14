import React from "react";
import { StripeProvider } from "@stripe/stripe-react-native";
import Constants from "expo-constants";

export const StripeProviderWrapper = ({
  children,
}: {
  children: React.ReactElement;
}) => {
  const publishableKey = Constants.expoConfig?.extra
    ?.stripePublishableKey as string;

  const scheme = Constants.expoConfig?.extra?.scheme as string;

  return (
    <StripeProvider
      publishableKey={publishableKey}
      merchantIdentifier="BelandApp"
      urlScheme={scheme}
    >
      {children}
    </StripeProvider>
  );
};
