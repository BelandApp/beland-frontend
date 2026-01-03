import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { WalletService } from "@services/core";
import { Transaction } from "../types";
import { getBackendErrorMessage } from "src/services";
import { notify } from "src/hooks/notification/notify.external";

// Función para mapear transacciones del backend al formato del frontend
export const mapBackendTransactionToFrontend = (
  backendTransaction: any
): Transaction => {
  // Mapear tipo de transacción según el backend

  let type: Transaction["type"] = "canje";
  const typeName = (
    backendTransaction.type?.name ||
    backendTransaction.type?.code ||
    ""
  ).toLowerCase();

  if (typeName.includes("recarga") || typeName.includes("recharge")) {
    type = "recarga";
  } else if (
    typeName.includes("transferencia enviada") ||
    typeName.includes("transfer_send")
  ) {
    type = "transferencia";
  } else if (
    typeName.includes("transferencia recibida") ||
    typeName.includes("transfer_received")
  ) {
    type = "receive";
  } else if (typeName.includes("compra") || typeName.includes("purchase")) {
    type = "pago";
  } else if (typeName.includes("venta") || typeName.includes("sale")) {
    type = "collection";
  } else if (typeName.includes("canje") || typeName.includes("exchange")) {
    type = "canje";
  } else {
    type = "canje";
  }

  // Mapear estado
  let status: Transaction["status"] = "exitoso";
  if (backendTransaction.status?.name) {
    const stateName = backendTransaction.status.name.toLowerCase();
    if (stateName.includes("pendiente") || stateName.includes("pending")) {
      status = "pendiente";
    } else if (
      stateName.includes("fallido") ||
      stateName.includes("failed") ||
      stateName.includes("error")
    ) {
      status = "error";
    } else if (
      stateName.includes("completado") ||
      stateName.includes("completed") ||
      stateName.includes("exitoso")
    ) {
      status = "exitoso";
    }
  }

  // Formatear fecha
  const date = new Date(backendTransaction.created_at);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let formattedDate: string;
  if (diffDays === 0) {
    formattedDate = `Hoy, ${date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (diffDays === 1) {
    formattedDate = `Ayer, ${date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (diffDays < 7) {
    formattedDate = `${diffDays} días atrás`;
  } else {
    formattedDate = date.toLocaleDateString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  // Obtener el monto de amount_becoin
  const amount = Number(backendTransaction.amount_becoin || 0);

  return {
    id: backendTransaction.id,
    type,
    type_description: backendTransaction.type?.description || "",
    amount: Math.abs(amount),
    amount_beicon: Math.abs(amount), // Para compatibilidad
    amount_becoin: Math.abs(amount),
    description: getTransactionDescription(type, backendTransaction),
    date: formattedDate,
    status,
    from: backendTransaction.reference || "Sistema",
    to: backendTransaction.reference || "Usuario",
  };
};

// Función helper para generar descripción de transacción
const getTransactionDescription = (
  type: Transaction["type"],
  backendTransaction: any
): string => {
  switch (type) {
    case "recarga":
      return "Recarga de billetera";
    case "transferencia":
      return "Transferencia enviada";
    case "receive":
      return "Transferencia recibida";
    case "pago":
      return "Compra";
    case "collection":
      return "Cobro recibido";
    case "canje":
      return "Canjeado por premio";
    default:
      return backendTransaction.reference || "Transacción";
  }
};

export const useWalletTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [walletId, setWalletId] = useState<string | null>(null);

  // Obtener el wallet_id del usuario actual
  useEffect(() => {
    const fetchWalletId = async () => {
      if (!user?.email || !user?.id) return;
      try {
        const wallet = await WalletService.getCurrentUserWallet();
        setWalletId(wallet.id);
        // Guardar el wallet_id en localStorage para el mapeo
        if (typeof window !== "undefined") {
          window.localStorage.setItem("wallet_id", wallet.id);
        }
      } catch (err) {
        setWalletId(null);
      }
    };
    fetchWalletId();
  }, [user?.email, user?.id]);

  const fetchTransactions = async () => {
    if (!walletId) return;
    setIsLoading(true);
    try {
      const response = await WalletService.getTransactions(1, 20, walletId);

      // La respuesta viene en formato [transacciones[], total]
      const transactionsData = Array.isArray(response[0])
        ? response[0]
        : response;

      // Mapear transacciones del backend al formato del frontend
      const mappedTransactions = transactionsData.map(
        mapBackendTransactionToFrontend
      );

      setTransactions(mappedTransactions);

      // Si hay error de red, usar datos mock como fallback
    } catch (err: any) {
      const message = getBackendErrorMessage(err);
      notify.error({ message });
    } finally {
      setIsLoading(false);
    }
  };

  const refetchTransactions = () => {
    fetchTransactions();
  };

  useEffect(() => {
    if (walletId) fetchTransactions();
  }, [walletId]);

  return {
    transactions,
    isLoading,
    refetch: refetchTransactions,
  };
};
