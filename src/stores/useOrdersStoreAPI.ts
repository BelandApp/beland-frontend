import { create } from "zustand";
import {
  Order,
  OrderStatus,
  CreateOrderRequest,
  OrderFilters,
  OrderSummary,
} from "../types/Order";
import { OrderService, CartService } from "@services/core";
import { useCartStore } from "./useCartStore";

// Import dinámico de AsyncStorage solo en mobile
let AsyncStorage: any = undefined;
if (typeof navigator !== "undefined" && navigator.product === "ReactNative") {
  try {
    AsyncStorage = require("@react-native-async-storage/async-storage").default;
  } catch {}
}

function isWeb() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

const STORAGE_KEY = "orders-store-api";

function saveOrdersState(state: Partial<OrdersState>) {
  const data = JSON.stringify({
    ...state,
    // Convertir fechas a strings para serialización
    orders: state.orders?.map((order) => ({
      ...order,
      createdAt:
        order.createdAt && !isNaN(order.createdAt.getTime())
          ? order.createdAt.toISOString()
          : new Date().toISOString(),
      updatedAt:
        order.updatedAt && !isNaN(order.updatedAt.getTime())
          ? order.updatedAt.toISOString()
          : new Date().toISOString(),
      estimatedDelivery:
        order.estimatedDelivery && !isNaN(order.estimatedDelivery.getTime())
          ? order.estimatedDelivery.toISOString()
          : undefined,
      deliveredAt:
        order.deliveredAt && !isNaN(order.deliveredAt.getTime())
          ? order.deliveredAt.toISOString()
          : undefined,
    })),
  });

  if (isWeb()) {
    window.localStorage.setItem(STORAGE_KEY, data);
  } else if (AsyncStorage) {
    AsyncStorage.setItem(STORAGE_KEY, data);
  }
}

async function loadOrdersState(): Promise<Partial<OrdersState> | null> {
  try {
    let data: string | null = null;

    if (isWeb()) {
      data = window.localStorage.getItem(STORAGE_KEY);
    } else if (AsyncStorage) {
      data = await AsyncStorage.getItem(STORAGE_KEY);
    }

    if (!data) return null;

    const parsed = JSON.parse(data);

    // Convertir strings de fechas de vuelta a Date objects
    if (parsed.orders) {
      parsed.orders = parsed.orders.map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
        estimatedDelivery: order.estimatedDelivery
          ? new Date(order.estimatedDelivery)
          : undefined,
        deliveredAt: order.deliveredAt
          ? new Date(order.deliveredAt)
          : undefined,
      }));
    }

    return parsed;
  } catch (error) {
    console.error("Error loading orders state:", error);
    return null;
  }
}

export interface OrdersState {
  orders: Order[];
  currentOrder?: Order;
  filters: OrderFilters;
  isLoading: boolean;
  error?: string;
}

export interface OrdersActions {
  // CRUD operations
  createOrder: (orderRequest: CreateOrderRequest) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  getOrderById: (orderId: string) => Order | undefined;
  cancelOrder: (orderId: string) => void;
  loadUserOrders: () => Promise<void>;
  loadPendingOrders: () => Promise<void>;
  confirmDelivery: (orderId: string, notes?: string) => Promise<boolean>;
  confirmReception: (orderId: string) => Promise<boolean>;

  // Filtering and search
  setFilters: (filters: OrderFilters) => void;
  getFilteredOrders: () => Order[];
  clearFilters: () => void;

  // Statistics
  getOrderSummary: () => OrderSummary;
  getOrdersByStatus: (status: OrderStatus) => Order[];

  // UI helpers
  setCurrentOrder: (order: Order | undefined) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | undefined) => void;

  // Persistence
  hydrate: () => Promise<void>;
  clearOrders: () => void;
}

type OrdersStore = OrdersState & OrdersActions;

const initialOrdersState: OrdersState = {
  orders: [],
  currentOrder: undefined,
  filters: {},
  isLoading: false,
  error: undefined,
};

export const useOrdersStoreAPI = create<OrdersStore>((set, get) => ({
  ...initialOrdersState,

  // Create a new order using real API with simplified cart flow
  createOrder: async (orderRequest: CreateOrderRequest): Promise<Order> => {
    // Starting createOrder (verbose logs removed)
    set({ isLoading: true, error: undefined });

    try {
      // Get cart state
      const cartState = useCartStore.getState();

      // Validate cart has items
      if (!cartState.products || cartState.products.length === 0) {
        throw new Error("No items in cart to create order");
      }

      // processing checkout with cart items (verbose logs removed)

      // Step 1: Get current cart from backend
      const cart = await CartService.getCart();
      // Diagnostic: log cartId used to create the order
      console.log("[OrdersStoreAPI] Creating order using cartId:", cart.id);

      // Step 2: Create order directly from the user's existing cart
      console.log(
        "[OrdersStoreAPI] Calling OrderService.createOrder with cartId:",
        cart.id
      );
      const newOrder = await OrderService.createOrder({
        shipping_address_id: "default", // TODO: Map from orderRequest.deliveryAddress
        payment_method: orderRequest.paymentMethod,
        notes: orderRequest.notes,
      });
      // Use a mutable variable for potential patching before saving/returning
      let orderToSave: any = newOrder.order;
      // Diagnostic: log the response returned by OrderService
      console.log(
        "[OrdersStoreAPI] OrderService.createOrder returned:",
        orderToSave
      );

      // Clear the local cart after successful order creation
      // Note: Backend automatically clears cart items when order is created
      useCartStore.getState().clearCart();

      // Sync with server to ensure consistency
      // (Backend already cleared the cart, this ensures our local state matches)
      try {
        const cartSyncResult = await CartService.getCart();
        if (cartSyncResult) {
          const serverItems = cartSyncResult.items || [];
          // Should be empty since backend cleared it
          console.log(
            `🔄 Store API: Cart synced - server has ${serverItems.length} items (should be 0)`
          );
        }
      } catch (syncError) {
        console.log(
          "⚠️ Store API: Cart sync failed (non-critical):",
          syncError
        );
      }

      // If the created order lacks deliveryAddress (or GET failed), and we have
      // the deliveryAddress in the original orderRequest, attach it here so the
      // object persisted in the store contains the fallback address. This is
      // necessary because callers (like the modal) may patch their local copy
      // but that wouldn't update the copy saved in the store.
      try {
        const hasDelivery =
          orderToSave &&
          ((orderToSave as any).deliveryAddress ||
            (orderToSave as any).delivery_address);

        if (
          (!hasDelivery || (orderToSave as any).__get_failed) &&
          (orderRequest as any)?.deliveryAddress
        ) {
          const od = (orderRequest as any).deliveryAddress;
          let fallbackAddress: any = {
            addressLine1: od.street,
            addressLine2: od.additionalInfo || "",
            city: od.city,
            state: od.state || "",
            postalCode: od.zipCode || "",
            country: od.country,
            latitude: od.latitude,
            longitude: od.longitude,
            phone: od.phone || undefined,
          };

          const normalized = {
            street:
              fallbackAddress.addressLine1 ||
              (fallbackAddress as any).address_line_1 ||
              (fallbackAddress as any).street ||
              "",
            additionalInfo:
              fallbackAddress.addressLine2 ||
              (fallbackAddress as any).address_line_2 ||
              (fallbackAddress as any).additionalInfo ||
              "",
            city: fallbackAddress.city || (fallbackAddress as any).town || "",
            state:
              fallbackAddress.state || (fallbackAddress as any).province || "",
            zipCode:
              fallbackAddress.postalCode ||
              (fallbackAddress as any).postal_code ||
              (fallbackAddress as any).zip ||
              "",
            country: fallbackAddress.country || "",
            latitude: fallbackAddress.latitude,
            longitude: fallbackAddress.longitude,
            phone: fallbackAddress.phone,
          };

          const patched: any = { ...(orderToSave as any) };
          patched.deliveryAddress = normalized;
          patched.delivery_address = normalized;
          try {
            patched.__attached_fallback = true;
            console.log(
              "[OrdersStoreAPI] Forced attach of deliveryAddress to newOrder before saving to store (__attached_fallback = true)"
            );
          } catch (e) {}
          // update orderToSave variable with patched
          orderToSave = patched as any;
        }
      } catch (e) {
        console.error(
          "[OrdersStoreAPI] Could not attach fallback deliveryAddress to newOrder:",
          e
        );
      }

      // Add to store
      set((state) => {
        const newState = {
          ...state,
          orders: [orderToSave, ...state.orders],
          currentOrder: orderToSave,
          isLoading: false,
        };

        console.log("💾 Store API: Saving to storage...");
        // saving to storage
        saveOrdersState(newState);

        return newState;
      });

      console.log("🎉 Store API: Order creation completed successfully");
      // order creation completed successfully
      return orderToSave;
    } catch (error) {
      console.error("❌ Store API: Error in createOrder:", error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Error creating order",
      });
      throw error;
    }
  },

  // Load user orders from API
  loadUserOrders: async (): Promise<void> => {
    set({ isLoading: true, error: undefined });

    try {
      console.log("🌐 Store API: Loading user orders from API...");
      const response = await OrderService.getOrders();
      // TODO: Map API response to store types - temporary conversion
      const orders = (response.data || []).map((apiOrder: any) => ({
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
      }));

      set((state) => {
        const newState = {
          ...state,
          orders,
          isLoading: false,
        };
        saveOrdersState(newState);
        return newState;
      });

      console.log("✅ Store API: User orders loaded:", orders.length);
      // user orders loaded
    } catch (error) {
      console.error("❌ Store API: Error loading user orders:", error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Error loading orders",
      });
    }
  },

  // Load pending orders from API (for delivery)
  loadPendingOrders: async (): Promise<void> => {
    set({ isLoading: true, error: undefined });

    try {
      console.log("🌐 Store API: Loading pending orders from API...");
      const response = await OrderService.getOrders({ status: "pending" });
      // TODO: Map API response to store types - temporary conversion
      const orders = (response.data || []).map((apiOrder: any) => ({
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
      }));

      set((state) => {
        const newState = {
          ...state,
          orders,
          isLoading: false,
        };
        saveOrdersState(newState);
        return newState;
      });

      console.log("✅ Store API: Pending orders loaded:", orders.length);
      // pending orders loaded
    } catch (error) {
      console.error("❌ Store API: Error loading pending orders:", error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Error loading orders",
      });
    }
  },

  // Confirm delivery via API
  confirmDelivery: async (
    orderId: string,
    notes?: string
  ): Promise<boolean> => {
    set({ isLoading: true, error: undefined });

    try {
      console.log("🌐 Store API: Confirming delivery via API:", orderId);
      const updatedOrder = await OrderService.updateOrderStatus(
        orderId,
        "delivered"
      );

      if (updatedOrder) {
        // Update local state
        get().updateOrderStatus(orderId, "delivered");
        console.log("✅ Store API: Delivery confirmed");
        // delivery confirmed
        set({ isLoading: false });
        return true;
      }

      set({ isLoading: false });
      return false;
    } catch (error) {
      console.error("❌ Store API: Error confirming delivery:", error);
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Error confirming delivery",
      });
      return false;
    }
  },

  // Confirm reception via API
  confirmReception: async (orderId: string): Promise<boolean> => {
    set({ isLoading: true, error: undefined });

    try {
      console.log("🌐 Store API: Confirming reception via API:", orderId);
      const updatedOrder = await OrderService.updateOrderStatus(
        orderId,
        "delivered"
      );

      if (updatedOrder) {
        // Update local state
        get().updateOrderStatus(orderId, "delivered");
        console.log("✅ Store API: Reception confirmed");
        // reception confirmed
        set({ isLoading: false });
        return true;
      }

      set({ isLoading: false });
      return false;
    } catch (error) {
      console.error("❌ Store API: Error confirming reception:", error);
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Error confirming reception",
      });
      return false;
    }
  },

  // Update order status locally
  updateOrderStatus: (orderId: string, status: OrderStatus) => {
    set((state) => {
      const updatedOrders = state.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
              updatedAt: new Date(),
              deliveredAt:
                status === "delivered" ? new Date() : order.deliveredAt,
            }
          : order
      );

      const newState = {
        ...state,
        orders: updatedOrders,
        currentOrder:
          state.currentOrder?.id === orderId
            ? updatedOrders.find((o) => o.id === orderId)
            : state.currentOrder,
      };

      saveOrdersState(newState);
      return newState;
    });
  },

  // Get order by ID (normalized for UI)
  getOrderById: (orderId: string) => {
    const raw = get().orders.find((order) => order.id === orderId);
    if (!raw) return undefined;

    // Normalize items without mutating stored order
    const normalizedItems = (raw.items || []).map((it: any) => {
      // Map backend fields to UI fields
      const price =
        it.price !== undefined
          ? it.price
          : it.unit_price !== undefined
          ? parseFloat(String(it.unit_price))
          : undefined;

      const subtotal =
        it.subtotal !== undefined
          ? it.subtotal
          : it.total_price !== undefined
          ? parseFloat(String(it.total_price))
          : undefined;

      // Preserve other fields, but prefer 'name'/'image' if present
      return {
        ...it,
        price,
        subtotal,
        // back-compat: ensure quantity exists
        quantity: it.quantity ?? 1,
      };
    });

    // Return a shallow copy of order with normalized items
    return {
      ...raw,
      items: normalizedItems,
    } as any;
  },

  // Cancel order
  cancelOrder: (orderId: string) => {
    get().updateOrderStatus(orderId, "cancelled");
  },

  // Set filters
  setFilters: (filters: OrderFilters) => {
    set((state) => ({ ...state, filters }));
  },

  // Get filtered orders
  getFilteredOrders: () => {
    const { orders, filters } = get();

    return orders.filter((order) => {
      // Filter by status
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(order.status)) return false;
      }

      // Filter by delivery type
      if (filters.deliveryType && order.deliveryType !== filters.deliveryType) {
        return false;
      }

      // Filter by date range
      if (filters.dateRange) {
        const orderDate = order.createdAt;
        if (
          orderDate < filters.dateRange.from ||
          orderDate > filters.dateRange.to
        ) {
          return false;
        }
      }

      return true;
    });
  },

  // Clear filters
  clearFilters: () => {
    set((state) => ({ ...state, filters: {} }));
  },

  // Get order summary statistics
  getOrderSummary: (): OrderSummary => {
    const orders = get().orders;

    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      completedOrders: orders.filter((o) => o.status === "delivered").length,
      totalSpent: orders
        .filter((o) => o.status === "delivered")
        .reduce((sum, o) => sum + o.total, 0),
    };
  },

  // Get orders by status
  getOrdersByStatus: (status: OrderStatus) => {
    return get().orders.filter((order) => order.status === status);
  },

  // UI helpers
  setCurrentOrder: (order: Order | undefined) => {
    set({ currentOrder: order });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | undefined) => {
    set({ error });
  },

  // Hydrate from storage
  hydrate: async () => {
    const loaded = await loadOrdersState();
    if (loaded && loaded.orders) {
      set((state) => ({ ...state, ...loaded }));
    }
  },

  // Clear all orders (for testing/reset)
  clearOrders: () => {
    const newState = { ...initialOrdersState };
    saveOrdersState(newState);
    set(newState);
  },
}));

// Auto-hydrate on store creation
const store = useOrdersStoreAPI.getState();
store.hydrate().catch(console.error);
