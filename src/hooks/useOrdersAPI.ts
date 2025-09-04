import { useOrdersStoreAPI } from "../stores/useOrdersStoreAPI";

/**
 * Hook que proporciona funcionalidades de órdenes usando APIs reales
 */
export const useOrders = () => {
  const {
    orders,
    currentOrder,
    isLoading,
    error,
    createOrder,
    updateOrderStatus,
    getOrderById,
    cancelOrder,
    loadUserOrders,
    loadPendingOrders,
    confirmDelivery,
    confirmReception,
    setFilters,
    getFilteredOrders,
    clearFilters,
    getOrderSummary,
    getOrdersByStatus,
    setCurrentOrder,
    setLoading,
    setError,
    clearOrders,
  } = useOrdersStoreAPI();

  return {
    // State
    orders,
    currentOrder,
    loading: isLoading,
    error,

    // CRUD operations
    createOrder,
    updateOrderStatus,
    getOrderById,
    cancelOrder,

    // API operations
    loadUserOrders,
    loadPendingOrders,
    confirmDelivery,
    confirmReception,

    // Filtering and search
    setFilters,
    getFilteredOrders,
    clearFilters,

    // Statistics
    getOrderSummary,
    getOrdersByStatus,

    // UI helpers
    setCurrentOrder,
    setLoading,
    setError,
    clearOrders,
  };
};
