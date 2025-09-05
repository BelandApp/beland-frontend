import { apiRequest } from "./api";
import { Order, OrderStatus, CreateOrderRequest } from "../types/Order";

// Types adicionales para el servicio de órdenes
export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

export interface OrderQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  user_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  notes?: string;
}

export interface OrderDeliveryConfirmation {
  order_id: string;
  delivery_confirmed_at: Date;
  delivery_notes?: string;
}

export interface OrderReceptionConfirmation {
  order_id: string;
  received_confirmed_at: Date;
  customer_rating?: number;
  customer_feedback?: string;
}

class OrderService {
  // Crear orden desde carrito
  async createOrderFromCart(cartId: string): Promise<Order> {
    try {
      // Validar que el cartId sea un string válido
      if (!cartId || typeof cartId !== "string" || cartId.trim() === "") {
        throw new Error(`Invalid cart_id: ${cartId}`);
      }

      // Usar query parameter según la documentación de la API
      const response = await apiRequest(
        `/orders/cart?cart_id=${encodeURIComponent(cartId.trim())}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      return this.mapOrderResponse(response);
    } catch (error) {
      console.error("❌ OrderService: Error creating order from cart:", error);

      // Log more details about the error
      if (error instanceof Error && "status" in error) {
        console.error("❌ OrderService: HTTP Status:", (error as any).status);
        console.error("❌ OrderService: Error body:", (error as any).body);
      }

      throw error;
    }
  }

  // Crear orden directa (sin carrito)
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    try {
      console.log(
        "🌐 OrderService: Creating direct order with data:",
        orderData
      );
      console.log("🌐 OrderService: Calling endpoint: POST /orders");

      const response = await apiRequest("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      console.log("✅ OrderService: Response received:", response);
      return this.mapOrderResponse(response);
    } catch (error) {
      console.error("❌ OrderService: Error creating order:", error);

      // Log more details about the error
      if (error instanceof Error && "status" in error) {
        console.error("❌ OrderService: HTTP Status:", (error as any).status);
        console.error("❌ OrderService: Error body:", (error as any).body);
      }

      throw error;
    }
  }

  // Obtener órdenes del usuario
  async getUserOrders(query: OrderQuery = {}): Promise<OrdersResponse> {
    try {
      const params = new URLSearchParams();
      if (query.page) params.append("page", String(query.page));
      if (query.limit) params.append("limit", String(query.limit));
      if (query.status) params.append("status", query.status);
      if (query.date_from) params.append("date_from", query.date_from);
      if (query.date_to) params.append("date_to", query.date_to);

      const url = `/orders/user?${params.toString()}`;
      const response = await apiRequest(url, {
        method: "GET",
      });

      // Determinar qué contiene las órdenes
      let ordersArray = response.orders || response;

      // Manejar el caso donde el backend devuelve [array_de_ordenes, total]
      if (Array.isArray(ordersArray) && ordersArray.length >= 2) {
        const firstElement = ordersArray[0];
        const secondElement = ordersArray[1];

        // Si el primer elemento es un array de órdenes y el segundo es un número (total)
        if (Array.isArray(firstElement) && typeof secondElement === "number") {
          ordersArray = firstElement; // Usar solo el array de órdenes
        }
      }

      // Filtrar y mapear solo elementos válidos
      const validOrders = Array.isArray(ordersArray)
        ? ordersArray.filter((item, index) => {
            const isValid = item && typeof item === "object" && item.id;
            return isValid;
          })
        : [];

      return {
        orders: validOrders.map(this.mapOrderResponse.bind(this)),
        total:
          response.total ||
          (typeof response[1] === "number"
            ? response[1]
            : validOrders.length) ||
          0,
        page: response.page || query.page || 1,
        limit: response.limit || query.limit || 10,
      };
    } catch (error) {
      console.error("Error getting user orders:", error);
      throw error;
    }
  }

  // Obtener órdenes pendientes (para admin)
  async getPendingOrders(query: OrderQuery = {}): Promise<OrdersResponse> {
    try {
      const params = new URLSearchParams();
      if (query.page) params.append("page", String(query.page));
      if (query.limit) params.append("limit", String(query.limit));

      const url = `/orders/pending?${params.toString()}`;
      const response = await apiRequest(url, {
        method: "GET",
      });

      return {
        orders: (response.orders || response).map(this.mapOrderResponse),
        total: response.total || response.length || 0,
        page: response.page || query.page || 1,
        limit: response.limit || query.limit || 10,
      };
    } catch (error) {
      console.error("Error getting pending orders:", error);
      throw error;
    }
  }

  // Obtener orden por ID
  async getOrderById(orderId: string): Promise<Order> {
    try {
      const response = await apiRequest(`/orders/${orderId}`, {
        method: "GET",
      });
      return this.mapOrderResponse(response);
    } catch (error) {
      console.error("Error getting order by ID:", error);
      throw error;
    }
  }

  // Confirmar entrega (delivery)
  async confirmDelivery(orderId: string, notes?: string): Promise<Order> {
    try {
      const url = `/orders/delivered?order_id=${orderId}`;
      const body = notes ? JSON.stringify({ notes }) : undefined;

      const response = await apiRequest(url, {
        method: "PUT",
        headers: body ? { "Content-Type": "application/json" } : {},
        body,
      });
      return this.mapOrderResponse(response);
    } catch (error) {
      console.error("Error confirming delivery:", error);
      throw error;
    }
  }

  // Confirmar recepción (cliente)
  async confirmReception(
    orderId: string,
    rating?: number,
    feedback?: string
  ): Promise<Order> {
    try {
      const url = `/orders/received?order_id=${orderId}`;
      const body: any = {};

      if (rating !== undefined) body.rating = rating;
      if (feedback) body.feedback = feedback;

      const response = await apiRequest(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
      });
      return this.mapOrderResponse(response);
    } catch (error) {
      console.error("Error confirming reception:", error);
      throw error;
    }
  }

  // Actualizar estado de orden
  async updateOrderStatus(
    orderId: string,
    data: UpdateOrderStatusRequest
  ): Promise<Order> {
    try {
      const response = await apiRequest(`/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return this.mapOrderResponse(response);
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  }

  // Cancelar orden
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    try {
      const response = await apiRequest(`/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: reason ? JSON.stringify({ reason }) : undefined,
      });
      return this.mapOrderResponse(response);
    } catch (error) {
      console.error("Error canceling order:", error);
      throw error;
    }
  }

  // Helper para mapear respuesta del backend
  private mapOrderResponse(response: any): Order {
    // Validar que la respuesta sea un objeto válido
    if (!response || typeof response !== "object") {
      throw new Error(
        `Invalid order data: expected object, got ${typeof response}`
      );
    }

    // Validar que tenga al menos un ID
    if (!response.id) {
      throw new Error("Order data missing required ID field");
    }

    // Helper function para parsear fechas de forma segura
    const parseDate = (dateValue: any, fieldName: string): Date => {
      if (!dateValue) {
        return new Date();
      }
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return new Date();
      }
      return date;
    };

    const parseOptionalDate = (
      dateValue: any,
      fieldName: string
    ): Date | undefined => {
      if (!dateValue) {
        return undefined;
      }
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return undefined;
      }
      return date;
    };

    // Mapear el status correctamente desde el objeto anidado
    let orderStatus: OrderStatus = "pending";
    if (response.status?.code) {
      const statusCode = response.status.code.toLowerCase();
      switch (statusCode) {
        case "pending":
          orderStatus = "pending";
          break;
        case "confirmed":
          orderStatus = "confirmed";
          break;
        case "preparing":
          orderStatus = "preparing";
          break;
        case "ready":
          orderStatus = "ready";
          break;
        case "shipped":
          orderStatus = "shipped";
          break;
        case "delivered":
          orderStatus = "delivered";
          break;
        case "cancelled":
          orderStatus = "cancelled";
          break;
        case "refunded":
          orderStatus = "refunded";
          break;
        default:
          orderStatus = "pending";
      }
    }

    const mappedOrder = {
      id: response.id,
      userId: response.user_id || response.userId || "",
      items: Array.isArray(response.items) ? response.items : [],
      subtotal: parseFloat(response.subtotal || response.total_amount || 0),
      discount: parseFloat(response.discount || 0),
      deliveryFee: parseFloat(
        response.delivery_fee || response.deliveryFee || 0
      ),
      total: parseFloat(response.total || response.total_amount || 0),
      deliveryType: response.delivery_type || response.deliveryType || "home",
      deliveryAddress: response.delivery_address || response.deliveryAddress,
      groupId: response.group_id || response.groupId,
      status: orderStatus,
      createdAt: parseDate(
        response.created_at || response.createdAt,
        "createdAt"
      ),
      updatedAt: parseDate(
        response.updated_at || response.updatedAt,
        "updatedAt"
      ),
      estimatedDelivery: parseOptionalDate(
        response.estimated_delivery || response.estimatedDelivery,
        "estimatedDelivery"
      ),
      deliveredAt: parseOptionalDate(
        response.delivered_at || response.deliveredAt,
        "deliveredAt"
      ),
      notes: response.notes || "",
      trackingNumber: response.tracking_number || response.trackingNumber,
      paymentMethod:
        response.payment_method || response.paymentMethod || "becoins",
      paymentStatus:
        response.payment_status || response.paymentStatus || "pending",
      becoinsUsed: response.becoins_used || response.becoinsUsed,
    };

    // Si los items están vacíos pero tenemos total_items, crear items placeholder
    if (mappedOrder.items.length === 0 && response.total_items > 0) {
      mappedOrder.items = Array.from(
        { length: response.total_items },
        (_, index) => ({
          id: `${response.id}-item-${index + 1}`,
          productId: `unknown-product-${index + 1}`,
          name: `Producto ${index + 1}`,
          price: parseFloat(response.total_amount || 0) / response.total_items,
          quantity: 1,
          subtotal:
            parseFloat(response.total_amount || 0) / response.total_items,
        })
      );
    }

    return mappedOrder;
  }
}

export const orderService = new OrderService();
