/**
 * Hook personalizado para manejar la confirmación de transacciones Payphone
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { WalletService } from "@services/core";
import { TokenService } from "@services/auth/token.service";
import {
  getSessionStorageData,
  getTransactionParamsFromURL,
  clearQRPaymentData,
  generateClientTransactionId,
  confirmPayphoneTransaction,
  createRechargePayload,
  createPaymentPayload,
  savePayloadToSessionStorage,
  saveBackendResponseToSessionStorage,
  createUserCardPayload,
  extractBalanceFromResponse,
  extractErrorMessage,
  validateAmount,
  redirectAfterDelay,
} from "../utils/helpers";
import { STATUS_MESSAGES, TIMING, REDIRECT_URLS } from "../constants";

export function usePayphoneConfirmation() {
  const { user, status: userStatus } = useAuth();

  const [id, setId] = useState<string | null>(null);
  const [clientTxId, setClientTxId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>(STATUS_MESSAGES.PENDING);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  useEffect(() => {
    // Obtener parámetros de URL
    const { id: idParam, clientTxId: clientTxIdParam } =
      getTransactionParamsFromURL();
    setId(idParam);
    setClientTxId(clientTxIdParam);

    // Obtener datos de sessionStorage
    const { finalToWalletId, finalAmountPaymentId, isPayment } =
      getSessionStorageData();

    console.log("[PayphoneSuccess][SessionStorage] State:", {
      isPayment,
      finalToWalletId,
      finalAmountPaymentId,
    });

    /**
     * Función principal de confirmación
     */
    async function confirmarTransaccion() {
      try {
        if (!idParam || !clientTxIdParam) {
          setStatus(STATUS_MESSAGES.INVALID_URL_PARAMS);
          setLoading(false);
          return;
        }

        // 1. Confirmar transacción con Payphone
        const payphoneData = await confirmPayphoneTransaction(
          Number(idParam),
          clientTxIdParam,
        );

        if (payphoneData.transactionStatus !== "Approved") {
          setStatus(STATUS_MESSAGES.REJECTED_OR_CANCELLED);
          clearQRPaymentData();
          setLoading(false);
          return;
        }

        // 2. Validar usuario
        if (!user && userStatus === "unauthenticated") {
          setStatus("Usuario no autenticado");
          setLoading(false);
          return;
        }

        // 3. Obtener wallet del usuario
        let walletId;
        try {
          const wallet = await WalletService.getCurrentUserWallet();
          walletId = wallet?.id;
        } catch (e) {
          setStatus(STATUS_MESSAGES.NO_WALLET);
          setLoading(false);
          return;
        }

        // 4. Preparar datos de transacción
        const generatedClientTxId = generateClientTransactionId();
        const amountUsd = Number(payphoneData.amount) / 100;

        if (!validateAmount(amountUsd)) {
          setStatus(STATUS_MESSAGES.INVALID_AMOUNT);
          setLoading(false);
          return;
        }

        // 5. Realizar pago o recarga en el backend
        let backendResult;

        if (finalToWalletId) {
          // Pago QR
          const payload = createPaymentPayload(
            payphoneData,
            generatedClientTxId,
            finalToWalletId,
            finalAmountPaymentId || undefined,
          );

          console.log("[PayphoneSuccess] Payload pago QR:", payload);
          savePayloadToSessionStorage(payload);

          try {
            backendResult = await WalletService.createPurchaseRecharge(
              finalToWalletId,
              payload,
            );
            console.log(
              "[PayphoneSuccess] Respuesta backend pago QR:",
              backendResult,
            );
          } catch (error) {
            console.error("[PayphoneSuccess] Error en pago QR:", error);
            backendResult = null;
          }

          saveBackendResponseToSessionStorage(backendResult);
          clearQRPaymentData();
        } else {
          // Recarga
          const rechargeData = createRechargePayload(
            payphoneData,
            generatedClientTxId,
          );

          try {
            backendResult = await WalletService.createRecharge(rechargeData);
            console.log(
              "[PayphoneSuccess] Respuesta backend recarga:",
              backendResult,
            );
          } catch (error) {
            console.error("[PayphoneSuccess] Error en recarga:", error);
            backendResult = null;
            setStatus(STATUS_MESSAGES.ALREADY_PROCESS);
            setLoading(false);
          }
        }

        // 6. Extraer balance de la respuesta
        const balance = extractBalanceFromResponse(backendResult);
        if (balance !== null) {
          setWalletBalance(balance);
        }

        // 7. Verificar resultado del backend
        const errorMessage = extractErrorMessage(backendResult);
        if (errorMessage) {
          setStatus(errorMessage);
          setLoading(false);
          return;
        }

        // 8. Guardar tarjeta si viene cardToken
        if (payphoneData.cardToken && user) {
          try {
            const userCardPayload = createUserCardPayload(
              payphoneData,
              user.id,
              user.email,
            );

            const authToken = await TokenService.getToken();
            await fetch(`${process.env.EXPO_PUBLIC_API_URL}/user-cards`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
              },
              body: JSON.stringify(userCardPayload),
            });
          } catch (e) {
            console.error("[PayphoneSuccess] Error guardando tarjeta:", e);
          }
        }

        // 9. Mostrar éxito y redirigir
        setLoading(false);
        setTimeout(() => {
          const successStatus = finalToWalletId
            ? STATUS_MESSAGES.PAYMENT_SUCCESS
            : STATUS_MESSAGES.RECHARGE_SUCCESS;

          setStatus(successStatus);

          // Redirigir solo para recargas
          if (!finalToWalletId) {
            redirectAfterDelay(
              REDIRECT_URLS.WALLET_MAIN,
              TIMING.REDIRECT_DELAY,
            );
          }
        }, TIMING.SUCCESS_MESSAGE_DELAY);
      } catch (error) {
        console.error("[PayphoneSuccess] Error general:", error);
        setStatus(
          error instanceof Error && error.message.includes("token")
            ? STATUS_MESSAGES.NO_PAYPHONE_TOKEN
            : STATUS_MESSAGES.REJECTED_OR_CANCELLED,
        );
        clearQRPaymentData();
      } finally {
        clearQRPaymentData();
        setLoading(false);
      }
    }

    if (idParam && clientTxIdParam) {
      confirmarTransaccion();
    } else {
      setStatus(STATUS_MESSAGES.INVALID_URL_PARAMS);
      setLoading(false);
    }
  }, [user]);

  return {
    id,
    clientTxId,
    status,
    loading,
    walletBalance,
  };
}
