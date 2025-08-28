import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/AuthContext";
import { transactionService } from "../../../services/transactionService";
import { walletService } from "../../../services/walletService";
import { Transaction as BackendTransaction } from "../../../services/transactionService";
import { Transaction } from "../types";
import { convertBackendTransactionAmount } from "../../../utils/balanceConverter";

// Función para mapear transacciones del backend al formato del frontend
const mapBackendTransactionToFrontend = (
  backendTransaction: BackendTransaction
): Transaction => {
  // Mapear tipo de transacción según el backend
  let type: Transaction["type"] = "exchange";
  const typeName = (
    backendTransaction.type?.name ||
    backendTransaction.transaction_type?.name ||
    ""
  ).toLowerCase();
  console.log(
    "[Transacción] typeName recibido:",
    typeName,
    "id:",
    backendTransaction.id
  );

  if (typeName.includes("recarga") || typeName.includes("recharge")) {
    type = "recharge";
  } else if (typeName.includes("transferencia enviada")) {
    type = "transfer";
  } else if (typeName.includes("transferencia recibida")) {
    type = "receive";
  } else if (typeName.includes("compra") || typeName.includes("purchase")) {
    type = "payment";
  } else if (typeName.includes("venta") || typeName.includes("sale")) {
    type = "collection";
  } else if (typeName.includes("canje") || typeName.includes("exchange")) {
    type = "exchange";
  } else {
    type = "exchange";
  }

  // Mapear estado
  let status: Transaction["status"] = "completed";
  if (
    backendTransaction.status?.name ||
    backendTransaction.transaction_state?.name
  ) {
    const stateName = (
      backendTransaction.status?.name ||
      backendTransaction.transaction_state?.name ||
      ""
    ).toLowerCase();
    if (stateName.includes("pendiente") || stateName.includes("pending")) {
      status = "pending";
    } else if (
      stateName.includes("fallido") ||
      stateName.includes("failed") ||
      stateName.includes("error")
    ) {
      status = "failed";
    } else if (
      stateName.includes("completado") ||
      stateName.includes("completed") ||
      stateName.includes("exitoso")
    ) {
      status = "completed";
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
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  // Si es transferencia recibida, forzar monto positivo y descripción
  const isReceive = type === "receive";
  return {
    id: backendTransaction.id,
    type,
    amount: isReceive
      ? Math.abs(convertBackendTransactionAmount(backendTransaction.amount))
      : convertBackendTransactionAmount(backendTransaction.amount),
    amount_beicon: isReceive
      ? Math.abs(
          backendTransaction.amount_beicon !== undefined
            ? convertBackendTransactionAmount(backendTransaction.amount_beicon)
            : convertBackendTransactionAmount(backendTransaction.amount)
        )
      : backendTransaction.amount_beicon !== undefined
      ? convertBackendTransactionAmount(backendTransaction.amount_beicon)
      : convertBackendTransactionAmount(backendTransaction.amount),
    description: isReceive
      ? getTransactionDescription(type, backendTransaction)
      : getTransactionDescription(type, backendTransaction),
    date: formattedDate,
    status,
    from: isReceive
      ? backendTransaction.reference ||
        backendTransaction.reference_number ||
        "Usuario"
      : undefined,
    to:
      type === "transfer"
        ? backendTransaction.reference ||
          backendTransaction.reference_number ||
          "Usuario"
        : undefined,
  };
};

// Función helper para generar descripción de transacción
const getTransactionDescription = (
  type: Transaction["type"],
  backendTransaction: BackendTransaction
): string => {
  switch (type) {
    case "recharge":
      return "Recarga de billetera";
    case "transfer":
      return "Transferencia enviada";
    case "receive":
      return "Transferencia recibida";
    case "payment":
      return "Pago realizado";
    case "collection":
      return "Cobro recibido";
    case "exchange":
      return "Canjeado por premio";
    default:
      return backendTransaction.description || "Transacción";
  }
};

export const useWalletTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletId, setWalletId] = useState<string | null>(null);

  // Obtener el wallet_id del usuario actual
  useEffect(() => {
    const fetchWalletId = async () => {
      if (!user?.email || !user?.id) return;
      try {
        const wallet = await walletService.getWalletByUserId(
          user.email,
          user.id
        );
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
    setError(null);

    try {
      // Determinar si usar modo demo o producción
      const isDemoMode = process.env.EXPO_PUBLIC_USE_DEMO_MODE === "true";

      console.log("🔧 useWalletTransactions configuración:");
      console.log("- isDemoMode:", isDemoMode);
      console.log("- walletId:", walletId);

      if (!isDemoMode) {
        try {
          // Modo producción: intentar usar API real
          // Filtrar por wallet_id del usuario actual
          const response = await transactionService.getTransactions({
            wallet_id: walletId,
            limit: 20,
            page: 1,
          });

          // Mapear transacciones del backend al formato del frontend
          const mappedTransactions = response.transactions.map(
            mapBackendTransactionToFrontend
          );

          console.log(
            "✅ Transacciones obtenidas del backend:",
            mappedTransactions.length
          );
          setTransactions(mappedTransactions);
        } catch (apiError: any) {
          console.warn("API no disponible, usando modo demo:", apiError);

          // Si hay error de red, usar datos mock como fallback
        }
      } else {
        // Modo demo: usar datos mock
        console.log("📝 Usando transacciones mock (modo demo)");
        setTransactions([]);
      }
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
      setError(err.message || "Error al cargar transacciones");
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
    error,
    refetch: refetchTransactions,
  };
};
