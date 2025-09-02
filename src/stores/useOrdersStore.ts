import { create } from "zustand";
import {
  Order,
  OrderStatus,
  CreateOrderRequest,
  OrderFilters,
  OrderSummary,
} from "../types/Order";

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

const STORAGE_KEY = "orders-store";

function saveOrdersState(state: Partial<OrdersState>) {
  const data = JSON.stringify({
    ...state,
    // Convertir fechas a strings para serialización
    orders: state.orders?.map((order) => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      estimatedDelivery: order.estimatedDelivery?.toISOString(),
      deliveredAt: order.deliveredAt?.toISOString(),
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

// Helper function to generate unique order ID
const generateOrderId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `ORD-${timestamp}-${random}`;
};

// Helper function to calculate order totals
const calculateOrderTotals = (items: any[], deliveryFee = 0, discount = 0) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal + deliveryFee - discount;
  return { subtotal, total };
};

const initialOrdersState: OrdersState = {
  orders: [],
  currentOrder: undefined,
  filters: {},
  isLoading: false,
  error: undefined,
};

export const useOrdersStore = create<OrdersStore>((set, get) => ({
  ...initialOrdersState,

  // Create a new order (simulated - no backend)
  createOrder: async (orderRequest: CreateOrderRequest): Promise<Order> => {
    console.log("🏪 Store: Starting createOrder with request:", orderRequest);
    set({ isLoading: true, error: undefined });

    try {
      // Validate request
      if (!orderRequest.items || orderRequest.items.length === 0) {
        throw new Error("No items in order request");
      }

      // Simulate API delay
      console.log("⏳ Store: Simulating API delay...");
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Reduced to 2 seconds

      const orderId = generateOrderId();
      const now = new Date();
      console.log("🆔 Store: Generated order ID:", orderId);

      // Calculate delivery fee based on type (simulado)
      const deliveryFee = orderRequest.deliveryType === "home" ? 5 : 0;
      const discount = 0; // TODO: Calculate discounts

      // Calculate totals
      const { subtotal, total } = calculateOrderTotals(
        orderRequest.items,
        deliveryFee,
        discount
      );

      console.log(
        "💰 Store: Calculated totals - subtotal:",
        subtotal,
        "total:",
        total
      );

      // Create order object
      const newOrder: Order = {
        id: orderId,
        userId: "current-user", // TODO: Get from auth context
        items: orderRequest.items,
        subtotal,
        discount,
        deliveryFee,
        total,
        deliveryType: orderRequest.deliveryType,
        deliveryAddress: orderRequest.deliveryAddress,
        groupId: orderRequest.groupId,
        status: "pending",
        createdAt: now,
        updatedAt: now,
        estimatedDelivery: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days
        paymentMethod: orderRequest.paymentMethod,
        paymentStatus: "pending",
        notes: orderRequest.notes,
        becoinsUsed:
          orderRequest.paymentMethod === "becoins" ? total : undefined,
      };

      console.log("📦 Store: Created order object:", newOrder);

      // Add to store
      set((state) => {
        const newState = {
          ...state,
          orders: [newOrder, ...state.orders],
          currentOrder: newOrder,
          isLoading: false,
        };

        console.log("💾 Store: Saving to storage...");
        try {
          saveOrdersState(newState);
          console.log("✅ Store: Saved successfully");
        } catch (saveError) {
          console.error("❌ Store: Error saving to storage:", saveError);
        }

        return newState;
      });

      console.log("🎉 Store: Order creation completed successfully");
      return newOrder;
    } catch (error) {
      console.error("❌ Store: Error in createOrder:", error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Error creating order",
      });
      throw error;
    }
  },

  // Update order status
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

  // Get order by ID
  getOrderById: (orderId: string) => {
    return get().orders.find((order) => order.id === orderId);
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
const store = useOrdersStore.getState();
store.hydrate().catch(console.error);
