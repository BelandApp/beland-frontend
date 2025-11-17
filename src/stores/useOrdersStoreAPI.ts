import { create } from "zustand";
import {
  Order,
  OrderStatus,
  CreateOrderRequest,
  OrderFilters,
  OrderSummary,
} from "../types/Order";
import { OrderService, CartService, CreateOrderDto } from "@services/core";
import { useCartStore } from "./useCartStore";
import { useAuthTokenStore } from "./useAuthTokenStore";

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
  // API-backed cancel: call backend and update local state
  cancelOrderApi: (orderId: string, reason?: string) => Promise<boolean>;
  loadUserOrders: () => Promise<void>;
  loadPendingOrders: () => Promise<void>;
  confirmDelivery: (orderId: string, notes?: string) => Promise<boolean>;
  confirmReception: (orderId: string) => Promise<boolean>;
  updateOrderFromApi: (apiOrder: any) => void;

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

      console.log(
        "[OrdersStoreAPI] Local cart has items:",
        cartState.products.length
      );
      console.log("[OrdersStoreAPI] Local cart products:", cartState.products);

      // processing checkout with cart items (verbose logs removed)

      // Step 1: Get current cart from backend
      const cart = await CartService.getCart();
      console.log("[OrdersStoreAPI] Backend cart ID:", cart.id);
      console.log("[OrdersStoreAPI] Backend cart items:", cart.items);
      console.log(
        "[OrdersStoreAPI] Backend cart total_items:",
        cart.total_items
      );

      // Step 1.5: If backend cart is empty but local cart has items, sync them
      if (
        (!cart.items || cart.items.length === 0) &&
        cartState.products.length > 0
      ) {
        console.log(
          "[OrdersStoreAPI] Backend cart is empty, syncing local items to server..."
        );

        try {
          // Sync each local item to the server
          for (const localProduct of cartState.products) {
            console.log(
              "[OrdersStoreAPI] Syncing product to server:",
              localProduct
            );
            await CartService.addToCart({
              product_id: localProduct.id,
              quantity: localProduct.quantity,
            });
          }

          // Get updated cart after sync
          const updatedCart = await CartService.getCart();
          console.log(
            "[OrdersStoreAPI] Cart after sync - items:",
            updatedCart.items?.length || 0
          );

          if (!updatedCart.items || updatedCart.items.length === 0) {
            throw new Error("Failed to sync cart items to server");
          }

          // Use the updated cart
          Object.assign(cart, updatedCart);
        } catch (syncError) {
          console.error(
            "[OrdersStoreAPI] Failed to sync cart items:",
            syncError
          );
          throw new Error(
            "No se pudieron sincronizar los items del carrito con el servidor"
          );
        }
      }

      // Validate backend cart has items after potential sync
      if (!cart.items || cart.items.length === 0) {
        throw new Error(
          "El carrito del servidor está vacío. Agregue productos antes de crear la orden."
        );
      }

      // Step 2: Create order directly from the user's existing cart
      console.log(
        "[OrdersStoreAPI] Calling OrderService.createOrder with cartId:",
        cart.id
      );

      // Get current user ID from auth store (for validation only, backend gets it from JWT)
      const { user } = useAuthTokenStore.getState();
      console.log("[OrdersStoreAPI] Auth store user:", user);
      console.log("[OrdersStoreAPI] User ID:", user?.id);

      if (!user?.id) {
        console.error(
          "[OrdersStoreAPI] User not authenticated - user object:",
          user
        );
        throw new Error("Usuario no autenticado");
      }

      const orderData: CreateOrderDto = {
        cart_id: cart.id,
      };

      const newOrder = await OrderService.createOrder(orderData);
      // Use a mutable variable for potential patching before saving/returning
      let orderToSave: any = newOrder.order;

      // Convert date strings to Date objects
      if (orderToSave) {
        orderToSave.createdAt = orderToSave.created_at
          ? new Date(orderToSave.created_at)
          : new Date();
        orderToSave.updatedAt = orderToSave.updated_at
          ? new Date(orderToSave.updated_at)
          : new Date();
        if (orderToSave.delivered_at) {
          orderToSave.deliveredAt = new Date(orderToSave.delivered_at);
        }
        if (orderToSave.estimated_delivery) {
          orderToSave.estimatedDelivery = new Date(
            orderToSave.estimated_delivery
          );
        }

        // Convert numeric string fields to numbers
        orderToSave.discount = parseFloat(orderToSave.discount_amount) || 0;
        orderToSave.deliveryFee = parseFloat(orderToSave.price_delivery) || 0;
        orderToSave.total = parseFloat(orderToSave.total_amount) || 0;
        orderToSave.subtotal = parseFloat(orderToSave.subtotal_amount) || 0;
        orderToSave.becoinsUsed = parseFloat(orderToSave.total_becoin) || 0;

        // Map status if it's an object
        if (orderToSave.status && typeof orderToSave.status === "object") {
          orderToSave.status =
            orderToSave.status.code?.toLowerCase() || "pending";
        }

        // Map address if present
        if (orderToSave.address) {
          orderToSave.deliveryAddress = {
            street: orderToSave.address.addressLine1,
            additionalInfo: orderToSave.address.addressLine2,
            city: orderToSave.address.city,
            state: orderToSave.address.state,
            zipCode: orderToSave.address.postalCode,
            country: orderToSave.address.country,
            latitude: orderToSave.address.latitude,
            longitude: orderToSave.address.longitude,
          };
        }

        // Map items
        if (orderToSave.items) {
          orderToSave.items = orderToSave.items.map((item: any) => ({
            ...item,
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity || item.ordered_quantity || 1,
            price: parseFloat(item.unit_price) || 0,
            subtotal: parseFloat(item.total_price) || 0,
            priceBecoin: parseFloat(item.unit_becoin) || 0,
            totalBecoin: parseFloat(item.total_becoin) || 0,
            name:
              item.name ||
              `Producto ${item.product_id?.slice(-8) || "desconocido"}`,
            image: item.image || undefined,
          }));
        }
      }

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
      const response = await OrderService.getUserOrders();
      // TODO: Map API response to store types - temporary conversion
      const orders = (response.data || []).map((apiOrder: any) => ({
        ...apiOrder,
        userId: apiOrder.user_id || "",
        discount: parseFloat(apiOrder.discount_amount) || 0,
        deliveryFee: parseFloat(apiOrder.price_delivery) || 0,
        total: parseFloat(apiOrder.total_amount) || 0,
        items: (apiOrder.items || []).map((item: any) => ({
          ...item,
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity || item.ordered_quantity || 1,
          price: parseFloat(item.unit_price) || 0,
          subtotal: parseFloat(item.total_price) || 0,
          priceBecoin: parseFloat(item.unit_becoin) || 0,
          totalBecoin: parseFloat(item.total_becoin) || 0,
          name:
            item.name ||
            `Producto ${item.product_id?.slice(-8) || "desconocido"}`,
          image: item.image || undefined,
        })),
        deliveryType: "home" as const,
        deliveryAddress: apiOrder.address
          ? {
              street: apiOrder.address.addressLine1,
              additionalInfo: apiOrder.address.addressLine2,
              city: apiOrder.address.city,
              state: apiOrder.address.state,
              zipCode: apiOrder.address.postalCode,
              country: apiOrder.address.country,
              latitude: apiOrder.address.latitude,
              longitude: apiOrder.address.longitude,
            }
          : undefined,
        subtotal: parseFloat(apiOrder.subtotal_amount) || 0,
        status: apiOrder.status?.code?.toLowerCase() || apiOrder.status,
        createdAt: apiOrder.created_at
          ? new Date(apiOrder.created_at)
          : new Date(),
        updatedAt: apiOrder.updated_at
          ? new Date(apiOrder.updated_at)
          : new Date(),
        paymentMethod: apiOrder.payment_type?.code,
        notes: apiOrder.observation,
        becoinsUsed: parseFloat(apiOrder.total_becoin) || 0,
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
        discount: parseFloat(apiOrder.discount_amount) || 0,
        deliveryFee: parseFloat(apiOrder.price_delivery) || 0,
        total: parseFloat(apiOrder.total_amount) || 0,
        items: (apiOrder.items || []).map((item: any) => ({
          ...item,
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity || item.ordered_quantity || 1,
          price: parseFloat(item.unit_price) || 0,
          subtotal: parseFloat(item.total_price) || 0,
          priceBecoin: parseFloat(item.unit_becoin) || 0,
          totalBecoin: parseFloat(item.total_becoin) || 0,
          name:
            item.name ||
            `Producto ${item.product_id?.slice(-8) || "desconocido"}`,
          image: item.image || undefined,
        })),
        deliveryType: "home" as const,
        deliveryAddress: apiOrder.address
          ? {
              street: apiOrder.address.addressLine1,
              additionalInfo: apiOrder.address.addressLine2,
              city: apiOrder.address.city,
              state: apiOrder.address.state,
              zipCode: apiOrder.address.postalCode,
              country: apiOrder.address.country,
              latitude: apiOrder.address.latitude,
              longitude: apiOrder.address.longitude,
            }
          : undefined,
        subtotal: parseFloat(apiOrder.subtotal_amount) || 0,
        status: apiOrder.status?.code?.toLowerCase() || apiOrder.status,
        createdAt: apiOrder.created_at
          ? new Date(apiOrder.created_at)
          : new Date(),
        updatedAt: apiOrder.updated_at
          ? new Date(apiOrder.updated_at)
          : new Date(),
        paymentMethod: apiOrder.payment_type?.code,
        notes: apiOrder.observation,
        becoinsUsed: parseFloat(apiOrder.total_becoin) || 0,
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
        // Update local state with the updated order from backend
        get().updateOrderFromApi(updatedOrder);
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

  // Cancel order via API (admin or user depending on permissions)
  cancelOrderApi: async (
    orderId: string,
    reason?: string
  ): Promise<boolean> => {
    set({ isLoading: true, error: undefined });

    try {
      console.log("🌐 Store API: Cancelling order via API:", orderId);
      // OrderService.cancelOrder returns the updated order directly
      const updatedOrder = await OrderService.cancelOrder(orderId, reason);

      if (updatedOrder) {
        // Update local state with the updated order from backend
        get().updateOrderFromApi(updatedOrder);
        console.log("✅ Store API: Order cancelled via API");
        set({ isLoading: false });
        return true;
      }

      set({ isLoading: false });
      return false;
    } catch (error) {
      console.error("❌ Store API: Error cancelling order:", error);
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Error cancelling order",
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

  // Update order from API response
  updateOrderFromApi: (apiOrder: any) => {
    set((state) => {
      // Map API response to frontend format
      const mappedOrder = {
        ...apiOrder,
        // Map status from object to string
        status: apiOrder.status?.code?.toLowerCase() || apiOrder.status,
        // Map address to deliveryAddress
        deliveryAddress: apiOrder.address
          ? {
              street: apiOrder.address.addressLine1,
              additionalInfo: apiOrder.address.addressLine2,
              city: apiOrder.address.city,
              state: apiOrder.address.state,
              zipCode: apiOrder.address.postalCode,
              country: apiOrder.address.country,
              latitude: apiOrder.address.latitude,
              longitude: apiOrder.address.longitude,
            }
          : undefined,
        // Map dates
        createdAt: apiOrder.created_at
          ? new Date(apiOrder.created_at)
          : new Date(),
        updatedAt: apiOrder.updated_at
          ? new Date(apiOrder.updated_at)
          : new Date(),
        deliveredAt: apiOrder.delivered_at
          ? new Date(apiOrder.delivered_at)
          : undefined,
        estimatedDelivery: apiOrder.delivery_at
          ? new Date(apiOrder.delivery_at)
          : undefined,
        // Map numeric fields
        subtotal: parseFloat(apiOrder.subtotal_amount) || 0,
        total: parseFloat(apiOrder.total_amount) || 0,
        deliveryFee: parseFloat(apiOrder.price_delivery) || 0,
        discount: 0, // Not provided in API response
        // Map items
        items: (apiOrder.items || []).map((item: any) => ({
          ...item,
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity || item.ordered_quantity || 1,
          price: parseFloat(item.unit_price) || 0,
          subtotal: parseFloat(item.total_price) || 0,
          priceBecoin: parseFloat(item.unit_becoin) || 0,
          totalBecoin: parseFloat(item.total_becoin) || 0,
          // These will be enriched later with product info
          name:
            item.name ||
            `Producto ${item.product_id?.slice(-8) || "desconocido"}`,
          image: item.image || undefined,
        })),
        // Map other fields
        deliveryType: "home" as const,
        groupId: apiOrder.group_id,
        notes: apiOrder.observation,
        paymentMethod: apiOrder.payment_type?.code,
        becoinsUsed: parseFloat(apiOrder.total_becoin) || 0,
      };

      const updatedOrders = state.orders.map((order) =>
        order.id === mappedOrder.id ? mappedOrder : order
      );

      // If order doesn't exist in local state, add it
      if (!updatedOrders.find((o) => o.id === mappedOrder.id)) {
        updatedOrders.push(mappedOrder);
      }

      const newState = {
        ...state,
        orders: updatedOrders,
        currentOrder:
          state.currentOrder?.id === mappedOrder.id
            ? mappedOrder
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
        .reduce(
          (sum, o) =>
            sum +
            (typeof o.total === "number" ? o.total : parseFloat(o.total) || 0),
          0
        ),
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
