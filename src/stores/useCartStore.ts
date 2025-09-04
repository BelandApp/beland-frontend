import { create } from "zustand";

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

const STORAGE_KEY = "cart-store";

function saveCartState(state: Partial<CartState>) {
  const data = JSON.stringify(state);
  if (isWeb()) {
    window.localStorage.setItem(STORAGE_KEY, data);
  } else if (AsyncStorage) {
    AsyncStorage.setItem(STORAGE_KEY, data);
  }
}

async function loadCartState(): Promise<Partial<CartState> | null> {
  try {
    if (isWeb()) {
      const data = window.localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } else if (AsyncStorage) {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    }
    return null;
  } catch {
    return null;
  }
}

export type CartProduct = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  cart_item_id?: string; // ID del item en el servidor para poder eliminarlo
};

export type CartState = {
  cartId?: string; // ID único del carrito para API
  products: CartProduct[];
  deliveryType?: "group" | "home";
  groupId?: string;
  address?: string;
  addProduct: (product: CartProduct) => void;
  addProductToServer: (product: CartProduct) => Promise<boolean>;
  removeProduct: (productId: string) => void;
  removeProductFromServer: (productId: string) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => void;
  updateQuantityOnServer: (
    productId: string,
    quantity: number
  ) => Promise<boolean>;
  clearCart: () => void;
  setDeliveryType: (
    type: "group" | "home",
    groupId?: string,
    address?: string
  ) => void;
  getOrCreateCartId: () => string;
  hydrate: () => Promise<void>;
  syncWithServerCart: (serverItems: any[], cartId: string) => void;
  mergeWithServerCart: (serverItems: any[], cartId: string) => void;
};

const initialCartState: Omit<
  CartState,
  | "addProduct"
  | "addProductToServer"
  | "removeProduct"
  | "removeProductFromServer"
  | "updateQuantity"
  | "updateQuantityOnServer"
  | "clearCart"
  | "setDeliveryType"
  | "getOrCreateCartId"
  | "hydrate"
  | "syncWithServerCart"
  | "mergeWithServerCart"
> = {
  cartId: undefined,
  products: [],
  deliveryType: undefined,
  groupId: undefined,
  address: undefined,
};

export const useCartStore = create<CartState>((set, get) => ({
  ...initialCartState,
  addProduct: (product) =>
    set((state) => {
      const existing = state.products.find((p) => p.id === product.id);
      let newProducts;
      if (existing) {
        newProducts = state.products.map((p) =>
          p.id === product.id
            ? { ...p, quantity: p.quantity + product.quantity }
            : p
        );
      } else {
        newProducts = [...state.products, product];
      }
      const newState = { ...state, products: newProducts };
      saveCartState(newState);
      return newState;
    }),

  addProductToServer: async (product) => {
    try {
      console.log("🛒 CartStore: Adding product to server:", product);

      const state = get();

      // Importar dinámicamente para evitar circular dependency
      const { cartService } = await import("../services/cartService");

      // Agregar al servidor
      const cartItem = await cartService.addCartItem(
        product.id,
        product.quantity,
        product.price
      );

      console.log(
        "✅ CartStore: Product added to server successfully:",
        cartItem
      );

      // Actualizar producto local con cart_item_id del servidor
      const existing = state.products.find((p) => p.id === product.id);
      let newProducts;

      if (existing) {
        // Si ya existe, actualizar cantidad y agregar cart_item_id
        newProducts = state.products.map((p) =>
          p.id === product.id
            ? {
                ...p,
                quantity: p.quantity + product.quantity,
                cart_item_id: cartItem.id,
              }
            : p
        );
      } else {
        // Si es nuevo, agregarlo con cart_item_id
        newProducts = [
          ...state.products,
          {
            ...product,
            cart_item_id: cartItem.id,
          },
        ];
      }

      const newState = { ...state, products: newProducts };
      saveCartState(newState);
      set(newState);

      return true;
    } catch (error) {
      console.error("❌ CartStore: Error adding product to server:", error);

      // En caso de error, agregar solo localmente como fallback
      const state = get();
      const existing = state.products.find((p) => p.id === product.id);
      let newProducts;

      if (existing) {
        newProducts = state.products.map((p) =>
          p.id === product.id
            ? { ...p, quantity: p.quantity + product.quantity }
            : p
        );
      } else {
        newProducts = [
          ...state.products,
          { ...product, cart_item_id: undefined },
        ];
      }

      const newState = { ...state, products: newProducts };
      saveCartState(newState);
      set(newState);

      return false;
    }
  },
  removeProduct: (productId) =>
    set((state) => {
      const newProducts = state.products.filter((p) => p.id !== productId);
      const newState = { ...state, products: newProducts };
      saveCartState(newState);
      return newState;
    }),

  removeProductFromServer: async (productId) => {
    try {
      const state = get();
      const product = state.products.find((p) => p.id === productId);

      if (!product) {
        console.log("🚫 CartStore: Product not found in local cart");
        return false;
      }

      // Si el producto tiene cart_item_id, eliminarlo del servidor
      if (product.cart_item_id) {
        console.log(
          "🗑️ CartStore: Removing product from server with cart_item_id:",
          product.cart_item_id
        );

        // Importar dinámicamente para evitar circular dependency
        const { cartService } = await import("../services/cartService");
        await cartService.removeCartItem(product.cart_item_id);

        console.log("✅ CartStore: Product removed from server successfully");
      } else {
        console.log(
          "ℹ️ CartStore: Product has no cart_item_id, only removing locally"
        );
      }

      // Eliminar del carrito local
      const newProducts = state.products.filter((p) => p.id !== productId);
      const newState = { ...state, products: newProducts };
      saveCartState(newState);
      set(newState);

      return true;
    } catch (error) {
      console.error("❌ CartStore: Error removing product from server:", error);

      // Aún así eliminar localmente en caso de error del servidor
      const state = get();
      const newProducts = state.products.filter((p) => p.id !== productId);
      const newState = { ...state, products: newProducts };
      saveCartState(newState);
      set(newState);

      return false;
    }
  },
  updateQuantity: (productId, quantity) =>
    set((state) => {
      const newProducts = state.products.map((p) =>
        p.id === productId ? { ...p, quantity } : p
      );
      const newState = { ...state, products: newProducts };
      saveCartState(newState);
      return newState;
    }),

  updateQuantityOnServer: async (productId, quantity) => {
    try {
      const state = get();
      const product = state.products.find((p) => p.id === productId);

      if (!product) {
        console.log("🚫 CartStore: Product not found in local cart");
        return false;
      }

      // Si el producto tiene cart_item_id, actualizar en el servidor
      if (product.cart_item_id) {
        console.log(
          "📝 CartStore: Updating product quantity on server with cart_item_id:",
          product.cart_item_id
        );

        // Importar dinámicamente para evitar circular dependency
        const { cartService } = await import("../services/cartService");
        await cartService.updateCartItem(product.cart_item_id, { quantity });

        console.log(
          "✅ CartStore: Product quantity updated on server successfully"
        );
      } else {
        console.log(
          "ℹ️ CartStore: Product has no cart_item_id, only updating locally"
        );
      }

      // Actualizar en el carrito local
      const newProducts = state.products.map((p) =>
        p.id === productId ? { ...p, quantity } : p
      );
      const newState = { ...state, products: newProducts };
      saveCartState(newState);
      set(newState);

      return true;
    } catch (error) {
      console.error(
        "❌ CartStore: Error updating product quantity on server:",
        error
      );

      // Aún así actualizar localmente en caso de error del servidor
      const state = get();
      const newProducts = state.products.map((p) =>
        p.id === productId ? { ...p, quantity } : p
      );
      const newState = { ...state, products: newProducts };
      saveCartState(newState);
      set(newState);

      return false;
    }
  },
  clearCart: () => {
    const newState = { ...initialCartState };
    saveCartState(newState);
    set(newState);
  },
  setDeliveryType: (type, groupId, address) => {
    const newState = { ...get(), deliveryType: type, groupId, address };
    saveCartState(newState);
    set(newState);
  },

  getOrCreateCartId: () => {
    const state = get();
    if (state.cartId) {
      return state.cartId;
    }

    // Generate a new cart ID using crypto UUID (valid UUID format)
    const newCartId = crypto.randomUUID();
    const newState = { ...state, cartId: newCartId };
    saveCartState(newState);
    set(newState);
    return newCartId;
  },

  hydrate: async () => {
    const loaded = await loadCartState();
    if (loaded && loaded.products) {
      set((state) => ({ ...state, ...loaded }));
    }
  },

  syncWithServerCart: (serverItems, cartId) => {
    console.log("🔄 CartStore: Syncing with server cart items:", serverItems);

    // Los items ya vienen enriquecidos con información completa del producto
    const serverProducts: CartProduct[] = serverItems.map((item: any) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      cart_item_id: item.cart_item_id, // Incluir el ID del servidor para poder eliminarlo
    }));

    const newState = {
      cartId,
      products: serverProducts,
      deliveryType: get().deliveryType,
      groupId: get().groupId,
      address: get().address,
    };

    saveCartState(newState);
    set(newState);
    console.log("✅ CartStore: Synced with server cart");
  },

  mergeWithServerCart: (serverItems, cartId) => {
    console.log("🔄 CartStore: Merging local cart with server cart");

    const currentProducts = get().products;

    // Los items ya vienen enriquecidos con información completa del producto
    const serverProducts: CartProduct[] = serverItems.map((item: any) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      cart_item_id: item.cart_item_id, // Incluir el ID del servidor para poder eliminarlo
    }));

    // Crear un mapa de productos del servidor para fácil acceso
    const serverProductMap = new Map(serverProducts.map((p) => [p.id, p]));

    // Fusionar productos: server tiene prioridad en caso de conflicto
    const mergedProducts: CartProduct[] = [...serverProducts];

    // Agregar productos locales que no estén en el servidor
    for (const localProduct of currentProducts) {
      if (!serverProductMap.has(localProduct.id)) {
        // Los productos solo locales no tienen cart_item_id
        mergedProducts.push({ ...localProduct, cart_item_id: undefined });
      }
    }

    const newState = {
      cartId,
      products: mergedProducts,
      deliveryType: get().deliveryType,
      groupId: get().groupId,
      address: get().address,
    };

    saveCartState(newState);
    set(newState);
    console.log("✅ CartStore: Merged local and server cart");
  },
}));
