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
          status_old_id?: string;
          status_new_id?: string;
          [key: string]: any;
        }) => {
          // Ignorar notificaciones de cambio de estado de órdenes (las maneja useOrderStatusSocket)
          const isStatusUpdate = data?.status_old_id || data?.status_new_id;
          if (isStatusUpdate) {
            console.log("[PaymentSocket] Es cambio de estado, ignorando");
            return;
          }

          // Ignorar notificaciones de ORDEN (las maneja useOrderSocket)
          const isOrderNotification =
            data?.order_id &&
            data?.total_becoin !== undefined &&
            data?.items !== undefined;

          if (isOrderNotification) {
            // Es una orden, ignorar aquí (useOrderSocket la maneja)
            return;
          }

          // Detectar notificación de EventPass (consume) por campos específicos
          const isEventPassNotification =
            data &&
            (data.attended_count !== undefined || data.user_name || data.code);

          if (isEventPassNotification) {
            // Mostrar notificación especial solo para Superadmin (si aplica)
            // El contexto del usuario está disponible en este hook
            if ((user as any)?.role_name === "SUPERADMIN") {
              const attended = data.attended_count ?? "?";
              const sold = data.sold_tickets ?? "?";
              const entryName = data.name || data.code || "Entrada";

              const lines: string[] = [];
              if (data.user_name) lines.push(`Usuario: ${data.user_name}`);
              if (data.user_phone) lines.push(`Tel: ${data.user_phone}`);
              if (data.user_email) lines.push(`Email: ${data.user_email}`);

              const message = `${entryName} — ${attended}/${sold} asistencias\n${lines.join(
                " • "
              )}`;

              showNotification({
                title: "Entrada consumida",
                message,
                persistent: true,
                meta: {
                  code: data.code,
                  name: data.name,
                  attended_count: data.attended_count,
                  sold_tickets: data.sold_tickets,
                  user_name: data.user_name,
                  user_instagram_tiktok: data.user_instagram_tiktok,
                  user_phone: data.user_phone,
                  user_email: data.user_email,
                  event_id: data.event_pass_id || data.eventPassId || null,
                },
              });
            }

            // También invocar el callback general
            onPaymentSuccess(data);
            return;
          }

          // Comportamiento original para pagos normales
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
