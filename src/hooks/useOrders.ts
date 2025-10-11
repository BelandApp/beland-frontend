import { useState, useEffect, useCallback } from "react";
import { OrderService } from "@services/core";
import { Order, OrderStatus, CreateOrderRequest } from "../types/Order";
import { useAuth } from "./AuthContext";

interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
}

interface OrderQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

interface UpdateOrderStatusRequest {
  orderId: string;
  status: OrderStatus;
  notes?: string;
}

const mapStatusToAPI = (status?: OrderStatus): string | undefined => {
  if (!status) return undefined;
  const statusMap: Record<string, string> = {
    pending: "pending",
    confirmed: "confirmed",
    preparing: "processing",
    ready: "processing",
    shipped: "shipped",
    delivered: "delivered",
    cancelled: "cancelled",
    refunded: "cancelled",
  };
  return statusMap[status] || status;
};

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();

  // Cargar órdenes del usuario
  const loadUserOrders = useCallback(
    async (query: OrderQuery = {}) => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const apiQuery = {
          ...query,
          status: mapStatusToAPI(query.status) as any,
        };
        const response = await OrderService.getOrders(apiQuery);

        const ordersResponse: OrdersResponse = {
          orders: (response.data || []).map((apiOrder: any) => ({
            ...apiOrder,
            userId: apiOrder.user_id || "",
            discount: apiOrder.discount_amount || 0,
            deliveryFee: apiOrder.shipping_cost || 0,
            total: apiOrder.total_amount || 0,
            items: apiOrder.order_items || [],
            deliveryType: "home" as const,
            deliveryAddress: apiOrder.shipping_address,
            subtotal: apiOrder.subtotal_amount || 0,
            status: apiOrder.status,
            createdAt: apiOrder.created_at,
            updatedAt: apiOrder.updated_at,
            paymentMethod: apiOrder.payment_method,
            notes: apiOrder.notes,
          })),
          total: response.total || 0,
          page: response.page || 1,
        };
        setOrders(ordersResponse.orders);
        setTotalOrders(ordersResponse.total);
        setCurrentPage(ordersResponse.page);
      } catch (err: any) {
        console.error("Error loading user orders:", err);
        setError(err.message || "Error al cargar órdenes");
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Cargar órdenes pendientes (para admin)
  const loadPendingOrders = useCallback(async (query: OrderQuery = {}) => {
    try {
      setLoading(true);
      setError(null);

      const apiQuery = {
        ...query,
        status: "pending" as any,
      };
      const response = await OrderService.getOrders(apiQuery);
      // Map API response to legacy format
      const ordersResponse: OrdersResponse = {
        orders: (response.data || []).map((apiOrder: any) => ({
          ...apiOrder,
          userId: apiOrder.user_id || "",
          discount: apiOrder.discount_amount || 0,
          deliveryFee: apiOrder.shipping_cost || 0,
          total: apiOrder.total_amount || 0,
          items: apiOrder.order_items || [],
          deliveryType: "home" as const,
          deliveryAddress: apiOrder.shipping_address,
          subtotal: apiOrder.subtotal_amount || 0,
          status: apiOrder.status,
          createdAt: apiOrder.created_at,
          updatedAt: apiOrder.updated_at,
          paymentMethod: apiOrder.payment_method,
          notes: apiOrder.notes,
        })),
        total: response.total || 0,
        page: response.page || 1,
      };
      setOrders(ordersResponse.orders);
      setTotalOrders(ordersResponse.total);
      setCurrentPage(ordersResponse.page);
    } catch (err: any) {
      console.error("Error loading pending orders:", err);
      setError(err.message || "Error al cargar órdenes pendientes");
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear orden desde carrito
  const createOrderFromCart = useCallback(
    async (orderData: {
      shipping_address_id: string;
      billing_address_id?: string;
      payment_method: string;
      notes?: string;
      coupon_code?: string;
      use_balance?: boolean;
    }) => {
      try {
        setLoading(true);
        setError(null);

        const result = await OrderService.createOrder(orderData);

        const mappedOrder = {
          ...result.order,
          userId: result.order.user_id,
          discount: result.order.discount_amount,
          deliveryFee: result.order.shipping_amount,
          total: result.order.total_amount,
          items: result.order.items || [],
          deliveryType: "home" as const,
          deliveryAddress: result.order.shipping_address,
          subtotal: result.order.subtotal,
          status: result.order.status,
          createdAt: result.order.created_at,
          updatedAt: result.order.updated_at,
          paymentMethod: result.order.payment_method,
          notes: result.order.notes,
        };

        // Recargar órdenes después de crear
        await loadUserOrders();

        return {
          order: mappedOrder,
          payment_intent: result.payment_intent,
        };
      } catch (err: any) {
        console.error("❌ Error creating order from cart:", err);
        setError(err.message || "Error al crear orden desde carrito");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [loadUserOrders]
  );

  const createOrder = useCallback(
    async (orderData: CreateOrderRequest) => {
      try {
        setLoading(true);
        setError(null);

        const apiOrderData = {
          shipping_address_id: "default",
          payment_method: orderData.paymentMethod,
          notes: orderData.notes,
        };

        const result = await OrderService.createOrder(apiOrderData);

        const mappedOrder = {
          ...result.order,
          userId: result.order.user_id,
          discount: result.order.discount_amount,
          deliveryFee: result.order.shipping_amount,
          total: result.order.total_amount,
          items: result.order.items || [],
          deliveryType: "home" as const,
          deliveryAddress: result.order.shipping_address,
          subtotal: result.order.subtotal,
          status: result.order.status,
          createdAt: result.order.created_at,
          updatedAt: result.order.updated_at,
          paymentMethod: result.order.payment_method,
          notes: result.order.notes,
        };

        // Recargar órdenes después de crear
        await loadUserOrders();

        return {
          order: mappedOrder,
          payment_intent: result.payment_intent,
        };
      } catch (err: any) {
        console.error("❌ Error creating direct order:", err);
        setError(err.message || "Error al crear orden");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [loadUserOrders]
  );

  // Función simplificada para crear orden desde carrito con datos mínimos
  const createQuickOrderFromCart = useCallback(
    async (paymentMethod: string, addressId?: string, notes?: string) => {
      return createOrderFromCart({
        shipping_address_id: addressId || "default",
        payment_method: paymentMethod,
        notes: notes,
      });
    },
    [createOrderFromCart]
  );

  // Función para crear orden con datos completos del carrito y opciones avanzadas
  const createAdvancedOrderFromCart = useCallback(
    async (options: {
      paymentMethod: string;
      shippingAddressId?: string;
      billingAddressId?: string;
      notes?: string;
      couponCode?: string;
      useBalance?: boolean;
    }) => {
      return createOrderFromCart({
        shipping_address_id: options.shippingAddressId || "default",
        billing_address_id: options.billingAddressId,
        payment_method: options.paymentMethod,
        notes: options.notes,
        coupon_code: options.couponCode,
        use_balance: options.useBalance,
      });
    },
    [createOrderFromCart]
  );

  // Obtener orden por ID
  const getOrderById = useCallback(async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);

      const order = await OrderService.getOrder(orderId);
      return order;
    } catch (err: any) {
      console.error("Error getting order by ID:", err);
      setError(err.message || "Error al obtener orden");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Confirmar entrega (delivery)
  const confirmDelivery = useCallback(
    async (orderId: string, notes?: string) => {
      try {
        setLoading(true);
        setError(null);

        const updatedOrder = await OrderService.updateOrderStatus(
          orderId,
          "delivered"
        );

        // Actualizar orden en la lista local - TODO: Fix type mapping
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? (updatedOrder as any) : order
          )
        );

        return updatedOrder;
      } catch (err: any) {
        console.error("Error confirming delivery:", err);
        setError(err.message || "Error al confirmar entrega");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Confirmar recepción (cliente)
  const confirmReception = useCallback(
    async (orderId: string, rating?: number, feedback?: string) => {
      try {
        setLoading(true);
        setError(null);

        const updatedOrder = await OrderService.updateOrderStatus(
          orderId,
          "delivered"
        );

        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? (updatedOrder as any) : order
          )
        );

        return updatedOrder;
      } catch (err: any) {
        console.error("Error confirming reception:", err);
        setError(err.message || "Error al confirmar recepción");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Actualizar estado de orden
  const updateOrderStatus = useCallback(
    async (orderId: string, data: UpdateOrderStatusRequest) => {
      try {
        setLoading(true);
        setError(null);

        const updatedOrder = await OrderService.updateOrderStatus(
          orderId,
          mapStatusToAPI(data.status) as any
        );

        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? (updatedOrder as any) : order
          )
        );

        return updatedOrder;
      } catch (err: any) {
        console.error("Error updating order status:", err);
        setError(err.message || "Error al actualizar estado");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Cancelar orden
  const cancelOrder = useCallback(async (orderId: string, reason?: string) => {
    try {
      setLoading(true);
      setError(null);

      const updatedOrder = await OrderService.updateOrderStatus(
        orderId,
        "cancelled"
      );

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? (updatedOrder as any) : order
        )
      );

      return updatedOrder;
    } catch (err: any) {
      console.error("Error canceling order:", err);
      setError(err.message || "Error al cancelar orden");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtrar órdenes por estado
  const filterOrdersByStatus = useCallback(
    (status: OrderStatus) => {
      return orders.filter((order) => order.status === status);
    },
    [orders]
  );

  // Obtener resumen de órdenes
  const getOrdersSummary = useCallback(() => {
    const summary = {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      confirmed: orders.filter((o) => o.status === "confirmed").length,
      preparing: orders.filter((o) => o.status === "preparing").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      totalSpent: orders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, order) => sum + order.total, 0),
    };
    return summary;
  }, [orders]);

  // Cargar órdenes del usuario cuando esté disponible
  useEffect(() => {
    if (user) {
      loadUserOrders();
    }
  }, [user, loadUserOrders]);

  return {
    orders,
    loading,
    error,
    totalOrders,
    currentPage,
    loadUserOrders,
    loadPendingOrders,
    createOrderFromCart,
    createQuickOrderFromCart,
    createAdvancedOrderFromCart,
    createOrder,
    getOrderById,
    confirmDelivery,
    confirmReception,
    updateOrderStatus,
    cancelOrder,
    filterOrdersByStatus,
    getOrdersSummary,
  };
};
