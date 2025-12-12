import { SocketService } from "@/services/SocketService";
import { useAuth } from "@/context";
import { useNotification } from "@/hooks/NotificationContext";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { convertBeCoinsToUSD } from "@/constants/currency";

/**
 * Hook para escuchar eventos de órdenes a través de sockets
 * Se conecta globalmente en la app para notificar al admin de nuevas órdenes
 *
 * NOTA: El backend emite las órdenes en el evento 'payment-success' junto con pagos y event-pass.
 * Diferenciamos por la estructura de datos: órdenes tienen { order_id, total_becoin, items }
 */
export function useOrderSocket(onOrderCreated?: (data: any) => void) {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const socketService = useRef<SocketService | null>(null);

  useEffect(() => {
    // Solo conectar si hay usuario autenticado
    if (!user?.id) return;

    let isMounted = true;
    // callback declarado en scope exterior para que el cleanup pueda acceder
    let onPayment: ((data: any) => void) | null = null;

    const initSocket = async () => {
      let token: string | null = null;
      try {
        if (Platform.OS === "web") {
          token = localStorage.getItem("access_token");
        } else {
          token = await AsyncStorage.getItem("access_token");
        }
      } catch (err) {
        console.error("[OrderSocket] Error getting token:", err);
        return;
      }

      if (!token) return;

      const svc = SocketService.getInstance();

      onPayment = async (data: {
        order_id?: string;
        total_becoin?: number;
        items?: number;
        status_old_id?: string;
        status_new_id?: string;
        [key: string]: any;
      }) => {
        if (!isMounted) return;

        const isStatusUpdate = data?.status_old_id || data?.status_new_id;
        if (isStatusUpdate) return;

        const isOrderNotification =
          data?.order_id &&
          data?.total_becoin !== undefined &&
          data?.items !== undefined;

        if (!isOrderNotification) return;

        console.log("[OrderSocket] Order created event received:", data);

        const orderId = data.order_id || "N/A";
        const totalBecoin = parseFloat(String(data.total_becoin || 0));
        const itemsCount = parseInt(String(data.items || 0));
        const shortOrderId =
          orderId.length > 8 ? orderId.substring(0, 8) : orderId;
        const totalUsd = convertBeCoinsToUSD(totalBecoin);

        showNotification({
          title: "🛍️ Nueva Orden Recibida",
          message: `Orden #${shortOrderId}`,
          amount: totalUsd,
          persistent: true,
          meta: {
            type: "order",
            order_id: orderId,
            short_id: shortOrderId,
            total_becoin: totalBecoin,
            total_usd: totalUsd,
            items_count: itemsCount,
          },
        });

        if (onOrderCreated) onOrderCreated(data);
      };

      if (onPayment) svc.onPaymentSuccess(onPayment);
    };

    initSocket();

    return () => {
      isMounted = false;
      try {
        const svc = SocketService.getInstance();
        if (onPayment) svc.off("payment-success", onPayment);
      } catch (e) {
        // ignore
      }
    };
  }, [user?.id, onOrderCreated, showNotification]);
}
