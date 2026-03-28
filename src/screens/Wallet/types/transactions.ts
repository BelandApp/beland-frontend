export const TRANSACTION_FILTER_MAP: Record<string, string[]> = {
  all: [],

  transfer: ["GIFTCARD_SEND"],
  receive: ["GIFTCARD_RECEIVED"],

  recarga: ["RECHARGE"],

  canje: ["RECYCLE"],

  PURCHASE: [
    "PURCHASE",
    "PURCHASE_BELAND",
    "PURCHASE_RESOURCE",
    "PURCHASE_EVENTPASS",
    "SERVICE_BELAND",
  ],

  ingresos: [
    "SALE",
    "SALE_BELAND",
    "SALE_RESOURCE",
    "SALE_EVENTPASS",
    "DONATION_RECEIVED",
    "WITHDRAW_IN",
    "ORANGE_CREDIT",
  ],

  egresos: ["WITHDRAW", "DONATION_SEND", "ORANGE_CREDIT_USED"],

  refunds: ["REFUND_ORDER", "REFUND_EVENTPASS", "CANCELLED_ORDER"],
};
