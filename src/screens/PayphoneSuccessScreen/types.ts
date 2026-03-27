/**
 * Tipos y interfaces para PayphoneSuccessScreen
 */

export type TransactionStatus =
  | "Pendiente"
  | "Pago exitoso"
  | "Recarga exitosa"
  | "Error";

export type TransactionType = "recharge" | "payment";

export interface PayphoneTransactionParams {
  id: string | null;
  clientTxId: string | null;
}

export interface PayphoneConfirmResponse {
  transactionStatus: "Approved" | "Rejected" | "Cancelled";
  transactionId: number;
  amount: number;
  reference: string;
  phoneNumber?: string;
  document?: string;
  cardHolder?: string;
  cardBrand?: string;
  cardType?: string;
  lastDigits?: string;
  cardToken?: string;
}

export interface BackendRechargePayload {
  amountUsd: number;
  referenceCode: string;
  payphone_transactionId: number;
  clientTransactionId: number;
}

export interface BackendPaymentPayload extends BackendRechargePayload {
  wallet_id: string;
  amount_payment_id?: string;
}

export interface BackendResponse {
  wallet?: {
    becoin_balance: number;
  };
  becoin_balance?: number;
  message?: string;
  error?: string;
}

export interface SessionStorageData {
  finalToWalletId: string | null;
  finalAmountPaymentId: string | null;
  isPayment: boolean;
}

export interface UserCardPayload {
  user_id: string;
  email: string;
  phoneNumber?: string;
  documentId?: string;
  optionalParameter4: string; // encrypted card holder
  cardBrand?: string;
  cardType?: string;
  lastDigits?: string;
  cardToken?: string;
}
