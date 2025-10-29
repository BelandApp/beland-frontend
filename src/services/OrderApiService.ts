/**
 * Order Service - Consolidated order management operations
 * Handles order creation, tracking, and history
 */

import { CoreApiService, PaginatedResponse } from "./core/ApiService";
import { Product } from "./ProductApiService";

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
  shipping_address_id: string;
  billing_address_id?: string;
  payment_method: string;
  notes?: string;
  coupon_code?: string;
  use_balance?: boolean;
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
    CREATE_ORDER: "orders",
    CANCEL_ORDER: "orders/cancel",
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

    return this.get<PaginatedResponse<Order>>(endpoint);
  }

  /**
   * Get a single order by ID
   */
  async getOrder(id: string): Promise<Order> {
    return this.get<Order>(`${this.ENDPOINTS.ORDERS}/${id}`);
  }

  /**
   * Create a new order from current cart
   */
  async createOrder(data: CreateOrderDto): Promise<{
    order: Order;
    payment_intent?: any; // Payment processor specific data
  }> {
    return this.post(`${this.ENDPOINTS.CREATE_ORDER}`, data);
  }

  /**
   * Cancel an order
   */
  async cancelOrder(
    orderId: string,
    reason?: string
  ): Promise<{
    success: boolean;
    order: Order;
    refund_info?: {
      amount: number;
      status: string;
      refund_id: string;
    };
  }> {
    return this.patch(`${this.ENDPOINTS.CANCEL_ORDER}/${orderId}`, { reason });
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
   */
  async updateOrderStatus(
    orderId: string,
    status: Order["status"],
    notes?: string
  ): Promise<Order> {
    return this.patch<Order>(`orders/${orderId}/status`, { status, notes });
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
}

// Export singleton instance
export const OrderService = new OrderServiceClass();
