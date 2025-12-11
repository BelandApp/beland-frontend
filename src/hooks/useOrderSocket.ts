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

      socketService.current = new SocketService();
      socketService.current.connect(token);

      // El backend emite órdenes en 'payment-success'
      // Diferenciamos por la estructura de datos
      socketService.current.onPaymentSuccess(
        async (data: {
          order_id?: string;
          total_becoin?: number;
          items?: number;
          status_old_id?: string;
          status_new_id?: string;
          [key: string]: any;
        }) => {
          if (!isMounted) return;

          // Si tiene status_old_id o status_new_id, es un cambio de estado, NO una nueva orden
          const isStatusUpdate = data?.status_old_id || data?.status_new_id;
          if (isStatusUpdate) {
            console.log(
              "[OrderSocket] Es cambio de estado, ignorando para notificaciones"
            );
            return;
          }

          // Verificar si es una notificación de NUEVA orden (tiene order_id, total_becoin, items)
          const isOrderNotification =
            data?.order_id &&
            data?.total_becoin !== undefined &&
            data?.items !== undefined;

          if (!isOrderNotification) {
            // No es una orden, ignorar (puede ser pago o event-pass)
            return;
          }

          console.log("[OrderSocket] Order created event received:", data);

          // Extraer información disponible del backend
          const orderId = data.order_id || "N/A";
          const totalBecoin = parseFloat(String(data.total_becoin || 0));
          const itemsCount = parseInt(String(data.items || 0));

          // Crear ID corto para visualización (primeros 8 caracteres)
          const shortOrderId =
            orderId.length > 8 ? orderId.substring(0, 8) : orderId;

          // Calcular total en USD usando la función de conversión oficial
          const totalUsd = convertBeCoinsToUSD(totalBecoin);

          // Mostrar notificación enriquecida con la info disponible
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

          // Llamar callback opcional
          if (onOrderCreated) {
            onOrderCreated(data);
          }
        }
      );
    };

    initSocket();

    return () => {
      isMounted = false;
      socketService.current?.disconnect();
      socketService.current = null;
    };
  }, [user?.id, onOrderCreated, showNotification]);
}
