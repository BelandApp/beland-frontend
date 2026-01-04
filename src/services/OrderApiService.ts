/**
 * Order Service - Consolidated order management operations
 * Handles order creation, tracking, and history
 */

import { CoreApiService, PaginatedResponse } from "./core/ApiService";
import { Product } from "./ProductApiService";
import { CartService } from "./cart/CartApiService";

// Order Types
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface OrderAddress {
  id: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  shipping_amount: number;
  total_amount: number;
  currency: string;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_method?: string;
  shipping_address: OrderAddress;
  billing_address?: OrderAddress;
  tracking_number?: string;
  estimated_delivery?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  coupon_code?: string;
}

export interface CreateOrderDto {
  cart_id: string;
}

export interface OrderQuery {
  page?: number;
  limit?: number;
  status?: Order["status"];
  payment_status?: Order["payment_status"];
  start_date?: string;
  end_date?: string;
  order_by?: "created_at" | "total_amount" | "status";
  sort_order?: "ASC" | "DESC";
}

export interface OrderTracking {
  order_id: string;
  tracking_number: string;
  carrier: string;
  status: string;
  estimated_delivery: string;
  events: {
    timestamp: string;
    location: string;
    description: string;
    status: string;
  }[];
}

export interface OrderStats {
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  orders_by_status: Record<Order["status"], number>;
  recent_orders: Order[];
}

class OrderServiceClass extends CoreApiService {
  private readonly ENDPOINTS = {
    ORDERS: "orders",
    ORDER_TRACKING: "orders/tracking",
    ORDER_STATS: "orders/stats",
    CREATE_ORDER: "orders/cart",
    CANCEL_ORDER: "orders/cancelled",
    REORDER: "orders/reorder",
  } as const;

  /**
   * Get user's orders with optional filtering and pagination
   */
  async getOrders(query: OrderQuery = {}): Promise<PaginatedResponse<Order>> {
    const queryString = this.buildQueryString(query);
    const endpoint = queryString
      ? `${this.ENDPOINTS.ORDERS}?${queryString}`
      : this.ENDPOINTS.ORDERS;

    // Raw response can be inconsistent across environments/backends:
    // - Paginated object: { data: Order[], total, page, limit }
    // - Tuple: [Order[], total]
    // - Direct array: Order[]
    // - Wrapped: { data: { data: Order[], total } }
    const raw = await this.get<any>(endpoint);

    // Diagnostic helper - keep logs minimal here; callers may log full raw
    // Normalize into PaginatedResponse<Order>
    let data: Order[] = [];
    let total = 0;
    const page = query.page ?? 1;
    let limit = query.limit ?? 0;

    if (Array.isArray(raw)) {
      // [orders, total] OR direct array of orders
      if (raw.length > 0 && Array.isArray(raw[0])) {
        data = raw[0] as Order[];
        total = Number(raw[1] ?? data.length) || data.length;
      } else {
        data = raw as Order[];
        total = data.length;
      }
    } else if (raw && typeof raw === "object") {
      if (Array.isArray(raw.data)) {
        data = raw.data as Order[];
        total = Number(raw.total ?? data.length) || data.length;
      } else if (raw.data && raw.data.data && Array.isArray(raw.data.data)) {
        data = raw.data.data as Order[];
        total = Number(raw.data.total ?? data.length) || data.length;
      } else if (Array.isArray(raw.orders)) {
        data = raw.orders as Order[];
        total = Number(raw.total ?? data.length) || data.length;
      } else {
        // Fallback: try to find first array-valued property
        const found = Object.values(raw).find((v) => Array.isArray(v));
        if (found) {
          data = found as Order[];
          total = Number((raw as any).total ?? data.length) || data.length;
        }
      }
    }

    // Finalize limit and totalPages
    if (!limit || limit <= 0) limit = data.length || 50;
    const totalPages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    } as PaginatedResponse<Order>;
  }

  /**
   * Get orders for the authenticated user
   */
  async getUserOrders(
    query: OrderQuery = {}
  ): Promise<PaginatedResponse<Order>> {
    const queryString = this.buildQueryString(query);
    const endpoint = queryString
      ? `${this.ENDPOINTS.ORDERS}/user?${queryString}`
      : `${this.ENDPOINTS.ORDERS}/user`;

    const raw = await this.get<any>(endpoint);

    // Normalize response same as getOrders
    let data: Order[] = [];
    let total = 0;
    const page = query.page ?? 1;
    let limit = query.limit ?? 0;

    if (Array.isArray(raw)) {
      if (raw.length > 0 && Array.isArray(raw[0])) {
        data = raw[0] as Order[];
        total = Number(raw[1] ?? data.length) || data.length;
      } else {
        data = raw as Order[];
        total = data.length;
      }
    } else if (raw && typeof raw === "object") {
      if (Array.isArray(raw.data)) {
        data = raw.data as Order[];
        total = Number(raw.total ?? data.length) || data.length;
      } else if (raw.data && raw.data.data && Array.isArray(raw.data.data)) {
        data = raw.data.data as Order[];
        total = Number(raw.data.total ?? data.length) || data.length;
      } else if (Array.isArray(raw.orders)) {
        data = raw.orders as Order[];
        total = Number(raw.total ?? data.length) || data.length;
      } else {
        const found = Object.values(raw).find((v) => Array.isArray(v));
        if (found) {
          data = found as Order[];
          total = Number((raw as any).total ?? data.length) || data.length;
        }
      }
    }

    if (!limit || limit <= 0) limit = data.length || 50;
    const totalPages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    } as PaginatedResponse<Order>;
  }

  /**
   * Get a single order by ID
   */
  async getOrder(id: string): Promise<Order> {
    return this.get<Order>(`${this.ENDPOINTS.ORDERS}/${id}`);
  }

  /**
   * Create a new order from current cart
   * Supports both individual and group orders with different payment types
   */
  async createOrder(data: any): Promise<{
    order: Order;
    payment_intent?: any; // Payment processor specific data
  }> {
    let cartId = (data as any).cart_id;
    if (!cartId) {
      try {
        const cart = await CartService.getCart();
        cartId = cart.id;
      } catch (err) {
        throw new Error("No se pudo obtener el carrito para crear la orden");
      }
    }

    return this.post(`${this.ENDPOINTS.CREATE_ORDER}?cart_id=${cartId}`, {});
  }

  /**
   * Create group order with equal split payment
   * Handles setting group, payment type, and creating order
   */
  async createGroupOrderEqualSplit(groupId: string): Promise<{
    order: Order;
    payment_intent?: any;
  }> {
    try {
      // 1. Get current cart
      const cart = await CartService.getCart();

      // 2. Set group for cart
      await CartService.setCartGroup(groupId);

      // 3. Get payment types to find EQUAL_SPLIT
      const response = await this.get<any>("/payment-types");

      // Desenrollar respuesta si está envuelta en array
      let paymentTypes =
        Array.isArray(response) && Array.isArray(response[0])
          ? response[0]
          : response;

      console.log("[OrderService] Payment Types:", paymentTypes);

      // Buscar por código EQUAL_SPLIT
      let equalSplitPaymentType = paymentTypes.find(
        (pt: any) => pt.code === "EQUAL_SPLIT"
      );

      if (!equalSplitPaymentType) {
        throw new Error(
          `Tipo de pago EQUAL_SPLIT no disponible. Disponibles: ${paymentTypes
            .map((pt: any) => pt.code)
            .join(", ")}`
        );
      }

      // 4. Set payment type to EQUAL_SPLIT
      await CartService.setPaymentType(equalSplitPaymentType.id);

      // 5. Create order
      return this.createOrder({ cart_id: cart.id });
    } catch (error) {
      throw new Error(
        `Error creando orden de grupo: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Create group order with full payment (only leader pays)
   */
  async createGroupOrderFull(groupId: string): Promise<{
    order: Order;
    payment_intent?: any;
  }> {
    try {
      // 1. Get current cart
      const cart = await CartService.getCart();

      // 2. Set group for cart
      await CartService.setCartGroup(groupId);

      // 3. Get payment types to find FULL
      const response = await this.get<any>("/payment-types");

      // Desenrollar respuesta si está envuelta en array
      let paymentTypes =
        Array.isArray(response) && Array.isArray(response[0])
          ? response[0]
          : response;

      console.log("[OrderService] Payment Types:", paymentTypes);

      // Buscar por código FULL
      let fullPaymentType = paymentTypes.find((pt: any) => pt.code === "FULL");

      if (!fullPaymentType) {
        throw new Error(
          `Tipo de pago FULL no disponible. Disponibles: ${paymentTypes
            .map((pt: any) => pt.code)
            .join(", ")}`
        );
      }

      // 4. Set payment type to FULL
      await CartService.setPaymentType(fullPaymentType.id);

      // 5. Create order
      return this.createOrder({ cart_id: cart.id });
    } catch (error) {
      throw new Error(
        `Error creando orden de grupo: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const params = new URLSearchParams();
    params.append("order_id", orderId);
    params.append("observation", reason || "Cancelado por el administrador");
    return this.put(`${this.ENDPOINTS.CANCEL_ORDER}?${params.toString()}`);
  }

  /**
   * Get order tracking information
   */
  async getOrderTracking(orderId: string): Promise<OrderTracking> {
    return this.get<OrderTracking>(
      `${this.ENDPOINTS.ORDER_TRACKING}/${orderId}`
    );
  }

  /**
   * Get user's order statistics
   */
  async getOrderStats(): Promise<OrderStats> {
    return this.get<OrderStats>(this.ENDPOINTS.ORDER_STATS);
  }

  /**
   * Reorder items from a previous order
   */
  async reorder(orderId: string): Promise<{
    success: boolean;
    cart_items: number;
    unavailable_items: string[];
  }> {
    return this.post(`${this.ENDPOINTS.REORDER}/${orderId}`);
  }

  /**
   * Update order status (admin/system use)
   * Maps frontend status to backend-specific endpoints
   * Note: 'delivered' status requires a verification code and should use deliverOrder() method instead
   */
  async updateOrderStatus(
    orderId: string,
    status: Order["status"],
    notes?: string
  ): Promise<Order> {
    const params = new URLSearchParams();
    params.append("order_id", orderId);
    if (notes) {
      params.append("observation", notes);
    }

    // Map status to backend endpoints
    switch (status.toLowerCase()) {
      case "processing":
        return this.put(`orders/preparing?${params.toString()}`);
      case "shipped":
        return this.put(`orders/on-route?${params.toString()}`);
      case "delivered":
        // Note: In production, this should prompt for a delivery code
        // For now, we'll throw an error to prevent issues
        throw new Error(
          "Para marcar como entregado, se requiere un código de verificación. Use el método deliverOrder() en su lugar."
        );
      case "cancelled":
        return this.put(`orders/cancelled?${params.toString()}`);
      default:
        throw new Error(
          `Status "${status}" no tiene un endpoint configurado en el backend`
        );
    }
  }

  /**
   * Mark order as delivered with verification code
   */
  async deliverOrder(
    orderId: string,
    verificationCode: number
  ): Promise<Order> {
    const params = new URLSearchParams();
    params.append("order_id", orderId);
    params.append("code", verificationCode.toString());
    return this.put(`orders/delivered?${params.toString()}`);
  }

  /**
   * Mark order as collected (user returns packaging)
   * Returns the order with a recycling code that can be used at recycling centers
   */
  async collectOrder(orderId: string): Promise<Order> {
    const params = new URLSearchParams();
    params.append("order_id", orderId);
    return this.put(`orders/collected?${params.toString()}`);
  }

  /**
   * Add tracking information to order (admin/system use)
   */
  async addTracking(
    orderId: string,
    data: {
      tracking_number: string;
      carrier: string;
      estimated_delivery?: string;
    }
  ): Promise<Order> {
    return this.patch<Order>(`orders/${orderId}/tracking`, data);
  }

  /**
   * Process payment for order
   */
  async processPayment(
    orderId: string,
    paymentData: {
      payment_method: string;
      payment_token?: string;
      use_balance?: boolean;
    }
  ): Promise<{
    success: boolean;
    payment_status: string;
    order: Order;
    transaction_id?: string;
  }> {
    return this.post(`orders/${orderId}/payment`, paymentData);
  }

  /**
   * Get invoice for order
   */
  async getInvoice(orderId: string): Promise<{
    invoice_url: string;
    invoice_number: string;
  }> {
    return this.get(`orders/${orderId}/invoice`);
  }

  /**
   * Request order refund
   */
  async requestRefund(
    orderId: string,
    data: {
      reason: string;
      items?: { item_id: string; quantity: number }[];
      amount?: number;
    }
  ): Promise<{
    success: boolean;
    refund_request_id: string;
    estimated_processing_days: number;
  }> {
    return this.post(`orders/${orderId}/refund`, data);
  }

  /**
   * Rate and review order
   */
  async rateOrder(
    orderId: string,
    data: {
      rating: number; // 1-5
      review?: string;
      item_ratings?: { item_id: string; rating: number }[];
    }
  ): Promise<{
    success: boolean;
    review_id: string;
  }> {
    return this.post(`orders/${orderId}/review`, data);
  }

  /**
   * Get all delivery statuses
   */
  async getDeliveryStatuses(): Promise<DeliveryStatus[]> {
    return this.get("delivery-status");
  }

  /**
   * Get all orders for a specific group
   */
  async getGroupOrders(
    groupId: string,
    query: OrderQuery = {}
  ): Promise<PaginatedResponse<Order>> {
    const queryString = this.buildQueryString(query);
    const endpoint = queryString
      ? `groups/${groupId}/orders?${queryString}`
      : `groups/${groupId}/orders`;

    const raw = await this.get<any>(endpoint);

    // Normalize response same as getOrders
    let data: Order[] = [];
    let total = 0;
    const page = query.page ?? 1;
    let limit = query.limit ?? 0;

    if (Array.isArray(raw)) {
      if (raw.length > 0 && Array.isArray(raw[0])) {
        data = raw[0] as Order[];
        total = Number(raw[1] ?? data.length) || data.length;
      } else {
        data = raw as Order[];
        total = data.length;
      }
    } else if (raw && typeof raw === "object") {
      if (Array.isArray(raw.data)) {
        data = raw.data as Order[];
        total = Number(raw.total ?? data.length) || data.length;
      } else if (raw.data && raw.data.data && Array.isArray(raw.data.data)) {
        data = raw.data.data as Order[];
        total = Number(raw.data.total ?? data.length) || data.length;
      } else if (Array.isArray(raw.orders)) {
        data = raw.orders as Order[];
        total = Number(raw.total ?? data.length) || data.length;
      } else {
        const found = Object.values(raw).find((v) => Array.isArray(v));
        if (found) {
          data = found as Order[];
          total = Number((raw as any).total ?? data.length) || data.length;
        }
      }
    }

    if (!limit || limit <= 0) limit = data.length || 50;
    const totalPages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    } as PaginatedResponse<Order>;
  }
}

// Delivery Status Type
export interface DeliveryStatus {
  id: string;
  code: string;
  name: string;
}

// Export singleton instance
export const OrderService = new OrderServiceClass();
