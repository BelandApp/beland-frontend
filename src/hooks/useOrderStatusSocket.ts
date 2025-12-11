import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthTokenStore } from "src/stores/useAuthTokenStore";
import { useOrdersStoreAPI } from "src/stores/useOrdersStoreAPI";
import { OrderStatus } from "src/types/Order";

type StatusUpdatePayload = {
  status_old_id?: string;
  status_new_id?: string;
  order_id?: string;
};

// Mapeo de IDs de estado del backend a estados del frontend
const mapBackendStatusIdToFrontend = (statusId?: string): OrderStatus => {
  if (!statusId) return "pending";

  const statusMap: Record<string, OrderStatus> = {
    "1": "pending",
    "2": "preparing",
    "3": "shipped",
    "4": "delivered",
    "5": "collected",
    "6": "recycled",
    "7": "cancelled",
  };

  return statusMap[statusId] || "pending";
};

/**
 * Hook para escuchar actualizaciones de estado de órdenes en tiempo real
 * Se conecta al socket del backend y recarga las órdenes cuando detecta un cambio de estado
 * NO muestra notificaciones, solo recarga el store para que se refleje en la UI
 */
export const useOrderStatusSocket = () => {
  const token = useAuthTokenStore((s) => s.token);
  const loadUserOrders = useOrdersStoreAPI((s) => s.loadUserOrders);

  useEffect(() => {
    if (!token) return;

    // Usar la misma URL que SocketService
    let wsUrl =
      process.env.EXPO_PUBLIC_WS_URL ||
      "https://beland-backend-266662044893.us-east1.run.app";

    // Si la URL termina en /api, la removemos para WebSockets
    if (wsUrl.endsWith("/api")) {
      wsUrl = wsUrl.slice(0, -4);
    }

    console.log("[useOrderStatusSocket] Conectando a:", wsUrl);

    const socket: Socket = io(wsUrl, {
      transports: ["websocket"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const handler = (payload: any) => {
      console.log("[useOrderStatusSocket] Evento recibido:", payload);
      // El backend utiliza el mismo evento 'payment-success' para varios casos.
      // Detectamos si es actualización de estado de orden por la forma del payload.
      const p = payload as StatusUpdatePayload;
      // El backend solo envía status_old_id y status_new_id, NO envía order_id
      // Por lo tanto, recargamos todas las órdenes cuando detectamos un cambio de estado
      if (p && p.status_new_id && p.status_old_id) {
        const newStatus = mapBackendStatusIdToFrontend(p.status_new_id);
        console.log(
          `[useOrderStatusSocket] Detectado cambio de estado a ${newStatus}, recargando órdenes...`
        );
        loadUserOrders();
      }
    };

    socket.on("connect", () => {
      console.log("[useOrderStatusSocket] Conectado al servidor de sockets");
    });

    socket.on("connect_error", (err) => {
      console.error("[useOrderStatusSocket] Error de conexión:", err.message);
    });

    socket.on("payment-success", handler);

    return () => {
      socket.off("payment-success", handler);
      socket.disconnect();
    };
  }, [token, loadUserOrders]);
};
