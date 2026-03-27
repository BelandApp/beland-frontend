import React from "react";

export const StripeProviderWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // 🌐 Web → no Stripe RN
  return <>{children}</>;
};
