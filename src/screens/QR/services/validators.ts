import { PaymentData, RawPaymentData } from "./types";

export const buildPaymentData = (raw: RawPaymentData): PaymentData | null => {
  if (!raw.wallet_id) {
    return null;
  }

  const amount = Number(raw.amount);

  if (Number.isNaN(amount) || amount <= 0) {
    return null;
  }

  return {
    wallet_id: raw.wallet_id,

    img_url: raw.img_url,

    full_name: raw.full_name,

    commerce_name: raw.commerce_name,

    amount,

    amount_to_payment_id: raw.amount_to_payment_id ?? null,

    message: raw.message ?? "",

    resource: raw.resource ?? [],

    redemptions: raw.redemptions ?? [],

    user_resources: raw.user_resources ?? [],

    appliedRedemption: raw.appliedRedemption,
  };
};

export const isAdminQR = (
  payment: Pick<PaymentData, "full_name" | "commerce_name">,
) => {
  const name = (payment.full_name ?? payment.commerce_name ?? "")
    .toLowerCase()
    .trim();

  return /super.*admin|superadmin|\badmin\b|beland\s*admin/i.test(name);
};
