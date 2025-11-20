import { SocketService } from "@/services/SocketService";
import { useAuth } from "@/context";
import { useNotification } from "@/hooks/NotificationContext";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
          [key: string]: any;
        }) => {
          if (!isMounted) return;

          // Verificar si es una notificación de orden (tiene order_id, total_becoin, items)
          const isOrderNotification =
            data?.order_id &&
            data?.total_becoin !== undefined &&
            data?.items !== undefined;

          if (!isOrderNotification) {
            // No es una orden, ignorar (puede ser pago o event-pass)
            return;
          }

          console.log("[OrderSocket] Order created event received:", data);

          // Extraer información básica de la orden
          const orderNumber = data.order_id || "N/A";
          // Convertir total_becoin a número (puede venir como string)
          const totalBecoin = parseFloat(String(data.total_becoin || 0));

          // Crear ID corto para visualización (primeros 8 caracteres)
          const shortOrderId =
            orderNumber.length > 8 ? orderNumber.substring(0, 8) : orderNumber;

          // Mostrar notificación con la información disponible
          // NOTA: No mostramos cantidad de items porque el backend envía null
          // (intenta convertir array items a número con +savedOrder.items)
          showNotification({
            title: "Nueva Orden",
            message: `Orden #${shortOrderId}\nMonto: $${totalBecoin.toLocaleString()}`,
            amount: totalBecoin,
            persistent: true,
            meta: {
              type: "order",
              order_id: orderNumber,
              total_becoin: totalBecoin,
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
