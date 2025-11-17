import { SocketService } from "@/services/SocketService";
import { useAuth } from "@/context";
import { useNotification } from "@/hooks/NotificationContext";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Hook para escuchar eventos de órdenes a través de sockets
 * Se conecta globalmente en la app para notificar al admin de nuevas órdenes
 */
export function useOrderSocket(onOrderCreated?: (data: any) => void) {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const socketService = useRef<SocketService | null>(null);

  useEffect(() => {
    // Solo conectar si el usuario es admin
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

      // Escuchar cuando se crea una nueva orden
      socketService.current.onOrderCreated(
        (data: {
          order?: any;
          orderNumber?: string;
          user?: any;
          totalAmount?: number;
          [key: string]: any;
        }) => {
          if (!isMounted) return;

          console.log("[OrderSocket] Order created event received:", data);

          // Extraer información de la orden
          const orderNumber =
            data?.order?.orderNumber || data?.orderNumber || "N/A";
          const userName =
            data?.order?.user?.name || data?.user?.name || "Cliente";
          const userPhone = data?.order?.user?.phone || data?.user?.phone || "";
          const userEmail = data?.order?.user?.email || data?.user?.email || "";
          const totalAmount =
            data?.order?.totalAmount ||
            data?.order?.total_amount ||
            data?.totalAmount ||
            0;

          // Mostrar notificación con NotificationBanner
          showNotification({
            title: "🛒 Nueva Orden Recibida",
            message: `Orden #${orderNumber} de ${userName}`,
            amount: Number(totalAmount),
            persistent: true, // Persistente para que el admin deba confirmar que la vio
            meta: {
              name: `Orden #${orderNumber}`,
              user_name: userName,
              user_phone: userPhone,
              user_email: userEmail,
            },
          });

          // Llamar callback opcional
          if (onOrderCreated) {
            onOrderCreated(data);
          }
        }
      );

      // Escuchar cuando se actualiza una orden (opcional)
      socketService.current.onOrderUpdated(
        (data: {
          order?: any;
          orderNumber?: string;
          status?: string;
          [key: string]: any;
        }) => {
          if (!isMounted) return;

          console.log("[OrderSocket] Order updated event received:", data);

          // Aquí podrías agregar lógica para mostrar notificaciones de cambios de estado
          // si el backend lo requiere en el futuro
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
