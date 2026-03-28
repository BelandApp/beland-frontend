/**
 * Constantes para PayphoneSuccessScreen
 */

// Session Storage Keys
export const SESSION_STORAGE_KEYS = {
  TO_WALLET_ID: "payphone_to_wallet_id",
  AMOUNT_PAYMENT_ID: "payphone_amount_to_payment_id",
  IS_QR_PAYMENT: "payphone_is_qr_payment",
  BACKEND_QR_PAYLOAD: "payphone_backend_qr_payload",
  BACKEND_QR_RESPONSE: "payphone_backend_qr_response",
} as const;

// Local Storage Keys
export const LOCAL_STORAGE_KEYS = {
  PAYPHONE_TOKEN: "payphone_token",
  TO_WALLET_ID: "payphone_to_wallet_id",
  AMOUNT_PAYMENT_ID: "payphone_amount_to_payment_id",
  IS_QR_PAYMENT: "payphone_is_qr_payment",
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  PAYPHONE_CONFIRM:
    "https://pay.payphonetodoesposible.com/api/button/V2/Confirm",
} as const;

// Transaction Status Messages
export const STATUS_MESSAGES = {
  ALREADY_PROCESS: "Ya fue procesado correctamente la recarga",
  PENDING: "Pendiente",
  PAYMENT_SUCCESS: "Pago exitoso",
  RECHARGE_SUCCESS: "Recarga exitosa",
  REJECTED_OR_CANCELLED: "Transacción rechazada o cancelada",
  NO_WALLET: "No pudimos encontrar tu billetera",
  NO_PAYPHONE_TOKEN: "No se encontró el token de Payphone en localStorage.",
  INVALID_AMOUNT: "El monto recibido de Payphone es inválido.",
  INVALID_URL_PARAMS: "Parámetros inválidos en la URL",
} as const;

// Timing
export const TIMING = {
  SUCCESS_MESSAGE_DELAY: 100,
  REDIRECT_DELAY: 1500,
} as const;

// Redirect URLs
export const REDIRECT_URLS = {
  WALLET_MAIN: "/wallet/main",
} as const;
