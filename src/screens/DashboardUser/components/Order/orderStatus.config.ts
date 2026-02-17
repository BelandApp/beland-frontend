export type OrderStatus =
  | "pending"
  | "preparing"
  | "on_route"
  | "delivered"
  | "collected"
  | "recycled"
  | "cancelled";

export enum OrderStatusEnum {
  PENDING = "PENDING",
  PREPARING = "PREPARING",
  ON_ROUTE = "ON_ROUTE",
  DELIVERED = "DELIVERED",
  RECYCLED = "RECYCLED",
  COLLECTED = "COLLECTED",
  CANCELLED = "CANCELLED",
}

export interface Order {
  id: string;
  order_number: string;
  total_amount: string;
  user?: {
    full_name?: string;
  };
  normalizedStatus: OrderStatus;
}

/**
 * SOLO estados automáticos
 * delivered se maneja aparte (verificación)
 */
export const STATUS_FLOW: Record<
  OrderStatus,
  { next?: OrderStatus; label?: string; icon?: string }
> = {
  pending: { next: "preparing", label: "Preparar", icon: "package-variant" },
  preparing: { next: "on_route", label: "Enviar", icon: "truck-delivery" },
  on_route: {}, // ← se entrega con código
  delivered: { next: "collected", label: "Recolectar", icon: "recycle" },
  collected: { next: "recycled", label: "Reciclar", icon: "leaf" },

  recycled: {},
  cancelled: {},
};

export const STATUS_META: Record<
  OrderStatus,
  { label: string; color: string; icon: string }
> = {
  pending: { label: "Pendiente", color: "#FF9500", icon: "clock-outline" },
  preparing: {
    label: "Preparando",
    color: "#34C759",
    icon: "package-variant",
  },
  on_route: {
    label: "Enviada",
    color: "#5856D6",
    icon: "truck-delivery-outline",
  },
  delivered: { label: "Entregada", color: "#30B0C7", icon: "check-circle" },
  collected: { label: "Recolectada", color: "#34C759", icon: "recycle" },
  recycled: { label: "Reciclada", color: "#4CAF50", icon: "leaf" },
  cancelled: {
    label: "Cancelada",
    color: "#FF3B30",
    icon: "close-circle-outline",
  },
};

export const normalizeOrderStatus = (raw: any): OrderStatus => {
  const map: Record<string, OrderStatus> = {
    PENDING: "pending",
    PREPARING: "preparing",
    ON_ROUTE: "on_route",
    DELIVERED: "delivered",
    COLLECTED: "collected",
    RECYCLED: "recycled",
    CANCELLED: "cancelled",
  };

  if (typeof raw === "string") {
    return map[raw.toUpperCase()] ?? raw.toLowerCase();
  }

  if (raw?.code) {
    return map[raw.code.toUpperCase()] ?? "pending";
  }

  return "pending";
};
