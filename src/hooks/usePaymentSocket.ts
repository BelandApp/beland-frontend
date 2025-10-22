import { SocketService } from "@/services/SocketService";
import { useAuth } from "@/context";
import { useNotification } from "@/hooks/NotificationContext";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface RecentTransaction {
  timestamp: number;
  amount: number;
  type: "becoin" | "payphone" | "free_entry" | "redemption_applied";
  resourceName?: string;
  resourceQuantity?: number;
  redemptionCode?: string;
  becoinsUsed?: number;
  commerceName?: string;
}

class TransactionContextManager {
  private static instance: TransactionContextManager;
  private recentTransactions: RecentTransaction[] = [];

  static getInstance() {
    if (!this.instance) this.instance = new TransactionContextManager();
    return this.instance;
  }

  addTransaction(transaction: RecentTransaction) {
    this.recentTransactions.unshift(transaction);

    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    this.recentTransactions = this.recentTransactions
      .filter((t) => t.timestamp > fiveMinutesAgo)
      .slice(0, 10);
  }

  findRecentTransaction(
    amount: number,
    maxAgeMs = 30000
  ): RecentTransaction | null {
    const now = Date.now();
    return (
      this.recentTransactions.find(
        (t) =>
          Math.abs(t.amount - amount) < 0.01 && now - t.timestamp < maxAgeMs
      ) || null
    );
  }
}

// --- createDetailedMessage ---
function createDetailedMessage(data: Record<string, any>): string {
  let message = data?.message || `Pago exitoso de $${data?.amount || 0}`;

  if (!data.resource_name && data.amount) {
    const contextManager = TransactionContextManager.getInstance();
    const recentTx = contextManager.findRecentTransaction(data.amount);
    if (recentTx) {
      data = { ...data, ...recentTx };
      message = `${data.message || "Pago exitoso"} - Contexto local aplicado`;
    }
  }

  const details: string[] = [];
  if (data.resource_name || data.resourceName)
    details.push(`📦 ${data.resource_name || data.resourceName}`);
  if ((data.resource_quantity || data.resourceQuantity) > 1)
    details.push(
      `📊 Cantidad: ${data.resource_quantity || data.resourceQuantity}`
    );
  if (
    (data.transaction_type === "redemption_applied" ||
      data.type === "redemption_applied") &&
    (data.redemption_code || data.redemptionCode)
  )
    details.push(`🎫 Cupón: ${data.redemption_code || data.redemptionCode}`);
  if ((data.becoins_used || data.becoinsUsed) > 0)
    details.push(
      `🪙 ${(data.becoins_used || data.becoinsUsed).toLocaleString()} BeCoins`
    );
  if (data.transaction_type === "free_entry" || data.type === "free_entry")
    details.push(`🆓 Entrada gratuita`);

  if (details.length) message += `\n\n${details.join(" • ")}`;
  return message;
}

// --- usePaymentSocket ---
export function usePaymentSocket(onPaymentSuccess: (data: any) => void) {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const socketService = useRef<SocketService | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;

    const initSocket = async () => {
      let token: string | null = null;
      try {
        if (Platform.OS === "web") {
          token = localStorage.getItem("access_token");
        } else {
          token = await AsyncStorage.getItem("access_token");
        }
      } catch (err) {
        console.error("[Socket] Error getting token:", err);
        return;
      }

      if (!token) return;

      socketService.current = new SocketService();
      socketService.current.connect(token);

      // Escuchar eventos de transacción recibida (nuevo pago)
      socketService.current.onTransactionReceived(
        (data: {
          amount: number;
          message?: string;
          wallet_id?: string;
          resource_name?: string;
          resource_quantity?: number;
          transaction_type?: string;
          redemption_code?: string;
          becoins_used?: number;
          commerce_name?: string;
          [key: string]: any;
        }) => {
          const detailedMessage = createDetailedMessage(data);
          showNotification({
            title: "¡Pago recibido!",
            message: detailedMessage,
            amount: data?.amount,
            persistent: true,
          });
          onPaymentSuccess(data);
        }
      );

      // También escuchar actualizaciones de balance para compatibilidad
      socketService.current.onBalanceUpdated(
        (data: {
          amount: number;
          message?: string;
          success?: boolean;
          resource_name?: string;
          resource_quantity?: number;
          transaction_type?: string;
          [key: string]: any;
        }) => {
          if (data.success && data.amount > 0) {
            const detailedMessage = createDetailedMessage(data);
            showNotification({
              title: "¡Pago recibido!",
              message: detailedMessage,
              amount: data?.amount,
              persistent: true, // Notificación persistente con botón OK
            });
            onPaymentSuccess(data);
          }
        }
      );

      // Mantener compatibilidad con el evento original
      socketService.current.onPaymentSuccess(
        (data: {
          amount: number;
          message?: string;
          resource_name?: string;
          resource_quantity?: number;
          transaction_type?: string;
          redemption_code?: string;
          becoins_used?: number;
          commerce_name?: string;
          [key: string]: any;
        }) => {
          const detailedMessage = createDetailedMessage(data);
          showNotification({
            title: "¡Venta recibida!",
            message: detailedMessage,
            amount: data?.amount,
            persistent: true, // Notificación persistente con botón OK
          });
          onPaymentSuccess(data);
        }
      );
    };

    initSocket();

    return () => {
      isMounted = false;
      socketService.current?.disconnect();
      socketService.current = null;
    };
  }, [user?.id, onPaymentSuccess, showNotification]);
}

export { TransactionContextManager };
