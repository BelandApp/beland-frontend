export type OrderStatus =
  | "pending" // Orden creada, pago pendiente
  | "confirmed" // Pago confirmado, preparando
  | "preparing" // En preparación
  | "ready" // Listo para envío
  | "shipped" // Enviado (en camino)
  | "delivered" // Entregado
  | "collected" // Recolectado (residuos)
  | "recycled" // Reciclado
  | "cancelled" // Cancelado
  | "refunded"; // Reembolsado

export type DeliveryType = "home" | "group";

export interface OrderItem {
  id: string;
  productId: string;
  product_id?: string;
  name: string;
  price: number;
  priceBecoin?: number;
  quantity: number;
  image?: string;
  subtotal: number; // price * quantity
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state?: string;
  zipCode?: string;
  country: string;
  additionalInfo?: string; // Apartamento, referencias, etc.
  latitude?: number;
  longitude?: number;
  phone?: string; // Número de teléfono del destinatario
}

export interface Order {
  id: string;
  order_number?: number;
  userId: string;
  items: OrderItem[];

  // Precios y totales
  subtotal: number; // Suma de todos los items
  discount: number; // Descuentos aplicados
  deliveryFee: number; // Costo de envío
  total: number; // Total final a pagar

  // Información de entrega
  deliveryType: DeliveryType;
  deliveryAddress?: DeliveryAddress; // Solo si es home delivery
  delivery_cost: string;

  groupId?: string; // Solo si es group delivery

  // Estados y fechas
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  estimatedDelivery?: Date;
  deliveredAt?: Date;

  // Información adicional
  notes?: string;
  trackingNumber?: string;

  // Información de pago (simulado por ahora)
  paymentMethod: "becoins" | "cash" | "card";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  becoinsUsed?: number;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  deliveryType: DeliveryType;
  deliveryAddress?: DeliveryAddress;
  groupId?: string;
  paymentMethod: "becoins" | "cash" | "card";
  notes?: string;
}

// Helper types para filtros y estados
export interface OrderFilters {
  status?: OrderStatus[];
  deliveryType?: DeliveryType;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface OrderSummary {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSpent: number;
}
