import { useState, useEffect, useCallback } from "react";
import {
  orderService,
  OrdersResponse,
  OrderQuery,
  UpdateOrderStatusRequest,
} from "../services/orderService";
import { Order, OrderStatus, CreateOrderRequest } from "../types/Order";
import { useAuth } from "./AuthContext";

// Hook para manejar órdenes
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

        const response: OrdersResponse = await orderService.getUserOrders(
          query
        );
        setOrders(response.orders);
        setTotalOrders(response.total);
        setCurrentPage(response.page);
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

      const response: OrdersResponse = await orderService.getPendingOrders(
        query
      );
      setOrders(response.orders);
      setTotalOrders(response.total);
      setCurrentPage(response.page);
    } catch (err: any) {
      console.error("Error loading pending orders:", err);
      setError(err.message || "Error al cargar órdenes pendientes");
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear orden desde carrito
  const createOrderFromCart = useCallback(
    async (cartId: string) => {
      try {
        setLoading(true);
        setError(null);

        const newOrder = await orderService.createOrderFromCart(cartId);

        // Recargar órdenes después de crear
        await loadUserOrders();
        return newOrder;
      } catch (err: any) {
        console.error("Error creating order from cart:", err);
        setError(err.message || "Error al crear orden");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [loadUserOrders]
  );

  // Crear orden directa
  const createOrder = useCallback(
    async (orderData: CreateOrderRequest) => {
      try {
        setLoading(true);
        setError(null);

        const newOrder = await orderService.createOrder(orderData);

        // Recargar órdenes después de crear
        await loadUserOrders();
        return newOrder;
      } catch (err: any) {
        console.error("Error creating order:", err);
        setError(err.message || "Error al crear orden");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [loadUserOrders]
  );

  // Obtener orden por ID
  const getOrderById = useCallback(async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);

      const order = await orderService.getOrderById(orderId);
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

        const updatedOrder = await orderService.confirmDelivery(orderId, notes);

        // Actualizar orden en la lista local
        setOrders((prev) =>
          prev.map((order) => (order.id === orderId ? updatedOrder : order))
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

        const updatedOrder = await orderService.confirmReception(
          orderId,
          rating,
          feedback
        );

        // Actualizar orden en la lista local
        setOrders((prev) =>
          prev.map((order) => (order.id === orderId ? updatedOrder : order))
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

        const updatedOrder = await orderService.updateOrderStatus(
          orderId,
          data
        );

        // Actualizar orden en la lista local
        setOrders((prev) =>
          prev.map((order) => (order.id === orderId ? updatedOrder : order))
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

      const updatedOrder = await orderService.cancelOrder(orderId, reason);

      // Actualizar orden en la lista local
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updatedOrder : order))
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
