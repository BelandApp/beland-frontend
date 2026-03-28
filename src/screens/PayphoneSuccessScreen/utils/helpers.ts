/**
 * Utilidades para PayphoneSuccessScreen
 */

import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";
import {
  SESSION_STORAGE_KEYS,
  LOCAL_STORAGE_KEYS,
  API_ENDPOINTS,
} from "../constants";
import type {
  SessionStorageData,
  PayphoneTransactionParams,
  UserCardPayload,
  PayphoneConfirmResponse,
  BackendRechargePayload,
  BackendPaymentPayload,
} from "../types";

/**
 * Lee los datos de QR payment desde sessionStorage
 */
export function getSessionStorageData(): SessionStorageData {
  const finalToWalletId =
    sessionStorage.getItem(SESSION_STORAGE_KEYS.TO_WALLET_ID) || null;
  const finalAmountPaymentId =
    sessionStorage.getItem(SESSION_STORAGE_KEYS.AMOUNT_PAYMENT_ID) || null;
  const isPayment = !!finalToWalletId && !!finalAmountPaymentId;

  return {
    finalToWalletId,
    finalAmountPaymentId,
    isPayment,
  };
}

/**
 * Extrae los parámetros de transacción de la URL
 */
export function getTransactionParamsFromURL(): PayphoneTransactionParams {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const clientTxId = params.get("clientTransactionId");

  return { id, clientTxId };
}

/**
 * Limpia los datos de pago QR del storage
 */
export function clearQRPaymentData(): void {
  // Session Storage
  sessionStorage.removeItem(SESSION_STORAGE_KEYS.TO_WALLET_ID);
  sessionStorage.removeItem(SESSION_STORAGE_KEYS.AMOUNT_PAYMENT_ID);

  // Local Storage
  localStorage.removeItem(LOCAL_STORAGE_KEYS.TO_WALLET_ID);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.AMOUNT_PAYMENT_ID);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.IS_QR_PAYMENT);
}

/**
 * Genera un nuevo client transaction ID
 */
export function generateClientTransactionId(): string {
  return uuidv4();
}

/**
 * Encripta el nombre del titular de la tarjeta
 */
export function encryptCardHolder(cardHolder: string): string {
  const encryptionKey = process.env.EXPO_PUBLIC_PAYPHONE_AES_KEY || "";

  try {
    const key = CryptoJS.enc.Utf8.parse(encryptionKey);
    const encrypted = CryptoJS.AES.encrypt(cardHolder, key, {
      iv: CryptoJS.enc.Utf8.parse(""),
    });
    return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  } catch (e) {
    console.error("[PayphoneSuccess] Error encriptando cardHolder:", e);
    return "";
  }
}

/**
 * Confirma la transacción con Payphone
 */
export async function confirmPayphoneTransaction(
  id: number,
  clientTxId: string,
): Promise<PayphoneConfirmResponse> {
  const payphoneToken = localStorage.getItem(LOCAL_STORAGE_KEYS.PAYPHONE_TOKEN);

  if (!payphoneToken) {
    throw new Error("No se encontró el token de Payphone");
  }

  const response = await fetch(API_ENDPOINTS.PAYPHONE_CONFIRM, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${payphoneToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      clientTxId,
    }),
  });

  const data = await response.json();
  return data;
}

/**
 * Crea el payload para recarga
 */
export function createRechargePayload(
  payphoneData: PayphoneConfirmResponse,
  clientTxIdParam: string,
): BackendRechargePayload {
  const amountUsd = Number(payphoneData.amount) / 100;

  return {
    amountUsd,
    referenceCode: payphoneData.reference,
    payphone_transactionId: payphoneData.transactionId,
    clientTransactionId: clientTxIdParam,
  };
}

/**
 * Crea el payload para pago QR
 */
export function createPaymentPayload(
  payphoneData: PayphoneConfirmResponse,
  walletId: string,
  clientTxIdParam: string,
  amountPaymentId?: string,
): BackendPaymentPayload {
  const basePayload = createRechargePayload(payphoneData, clientTxIdParam);

  const payload: BackendPaymentPayload = {
    ...basePayload,
    wallet_id: walletId,
  };

  if (amountPaymentId) {
    payload.amount_payment_id = amountPaymentId;
  }

  return payload;
}

/**
 * Guarda el payload en sessionStorage para debugging
 */
export function savePayloadToSessionStorage(
  payload: BackendPaymentPayload,
): void {
  if (typeof window !== "undefined" && window.sessionStorage) {
    try {
      window.sessionStorage.setItem(
        SESSION_STORAGE_KEYS.BACKEND_QR_PAYLOAD,
        JSON.stringify(payload),
      );
    } catch (e) {
      console.warn("No se pudo guardar el payload en sessionStorage", e);
    }
  }
}

/**
 * Guarda la respuesta del backend en sessionStorage para debugging
 */
export function saveBackendResponseToSessionStorage(response: any): void {
  if (typeof window !== "undefined" && window.sessionStorage) {
    try {
      window.sessionStorage.setItem(
        SESSION_STORAGE_KEYS.BACKEND_QR_RESPONSE,
        JSON.stringify(response),
      );
    } catch (e) {
      console.warn("No se pudo guardar la respuesta en sessionStorage", e);
    }
  }
}

/**
 * Crea el payload para guardar la tarjeta del usuario
 */
export function createUserCardPayload(
  payphoneData: PayphoneConfirmResponse,
  userId: string,
  email: string,
): UserCardPayload {
  const encryptedCardHolder = encryptCardHolder(payphoneData.cardHolder || "");

  return {
    user_id: userId,
    email,
    phoneNumber: payphoneData.phoneNumber,
    documentId: payphoneData.document,
    optionalParameter4: encryptedCardHolder,
    cardBrand: payphoneData.cardBrand,
    cardType: payphoneData.cardType,
    lastDigits: payphoneData.lastDigits,
    cardToken: payphoneData.cardToken,
  };
}

/**
 * Extrae el balance de la respuesta del backend
 */
export function extractBalanceFromResponse(backendResult: any): number | null {
  if (!backendResult) return null;

  if (
    backendResult.wallet &&
    typeof backendResult.wallet.becoin_balance === "number"
  ) {
    return backendResult.wallet.becoin_balance;
  }

  if (typeof backendResult.becoin_balance === "number") {
    return backendResult.becoin_balance;
  }

  return null;
}

/**
 * Extrae el mensaje de error de la respuesta del backend
 */
export function extractErrorMessage(backendResult: any): string {
  if (!backendResult || !backendResult.wallet) {
    if (backendResult?.message) {
      return `Error backend: ${backendResult.message}`;
    }
    if (backendResult?.error) {
      return `Error backend: ${backendResult.error}`;
    }
    return "Transacción rechazada o cancelada";
  }
  return "";
}

/**
 * Valida que el monto sea válido
 */
export function validateAmount(amount: number): boolean {
  return !isNaN(amount) && amount > 0;
}

/**
 * Redirecciona después de un delay
 */
export function redirectAfterDelay(url: string, delay: number): void {
  setTimeout(() => {
    window.location.href = url;
  }, delay);
}
