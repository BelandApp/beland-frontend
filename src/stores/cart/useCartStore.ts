import { create } from "zustand";
import { CartService } from "@services/core";
import { storage } from "../storeEngine";
import { getBackendErrorMessage, TokenService } from "src/services";
import { notify } from "src/hooks/notification/notify.external";
import { convertUSDToBeCoins } from "src/constants";

const STORAGE_KEY = "@cart_intent";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  item_id_for_delete?: string;
};

export type CartStore = {
  cartId?: string; // ID único del carrito para API
  loading: boolean;
  hasInitialized: boolean;
  totalUSD: () => number;
  totalBecoins: () => number;
  items: CartItem[];
  deliveryType?: "group" | "home";
  groupId?: string;
  address?: string;
  // --actions--//
  getCartId: () => Promise<string>;
  addProduct: (CartItem: CartItem) => void;
  removeProduct: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  logOutCart: () => void;
  syncCart: () => Promise<boolean>;
  setDeliveryType: (
    type: "group" | "home",
    groupId?: string,
    address?: string
  ) => void;
};

export const useCartStore = create<CartStore>((set, get) => ({
  cartId: undefined,
  items: [],
  loading: false,
  hasInitialized: false,
  totalUSD: () => {
    const { items } = get();
    return items.reduce((sum, p) => sum + p.price * p.quantity, 0);
  },
  totalBecoins: () => {
    const { items } = get();
    const total = items.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const requiredBeCoins = convertUSDToBeCoins(total);
    return requiredBeCoins;
  },
  // --actions--//
  getCartId: async () => {
    const cart = await CartService.getCart();
    set(() => ({ cartId: cart.id }));
    return cart.id;
  },
  //  Agregar producto o sumar cantidad
  addProduct: async (product) => {
    const { items } = get();
    const exists = items.find((i) => i.id === product.id);
    const newQuantity = exists ? exists.quantity + 1 : 1;
    let updatedItems = exists
      ? items.map((i) =>
          i.id === product.id ? { ...i, quantity: newQuantity } : i
        )
      : [...items, { ...product, quantity: 1 }];

    set({ items: updatedItems });
    storage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
    const authToken = await TokenService.getToken();
    if (!authToken) return false;
    // El backend suma cantidades automáticamente, siempre enviar +1
    CartService.addToCart({ product_id: product.id, quantity: 1 });
  },

  // Remover producto
  removeProduct: async (productId) => {
    const itemToDelete = get().items.find((i) => i.id === productId);
    if (!itemToDelete || !itemToDelete.item_id_for_delete) return;
    const updated = get().items.filter((i) => i.id !== productId);
    set({ items: updated });
    storage.setItem(STORAGE_KEY, JSON.stringify(updated));
    const authToken = await TokenService.getToken();
    if (!authToken) return false;
    CartService.removeFromCart(itemToDelete?.item_id_for_delete);
  },

  // Actualizar cantidad (mínimo 1)
  updateQuantity: async (productId, quantity) => {
    if (quantity < 1) return;

    const item = get().items.find((i) => i.id === productId);
    if (!item) return;

    const updated = get().items.map((i) =>
      i.id === productId ? { ...i, quantity } : i
    );
    set({ items: updated });
    storage.setItem(STORAGE_KEY, JSON.stringify(updated));

    const authToken = await TokenService.getToken();
    if (!authToken) return false;

    // Usar updateCartItem para reemplazar la cantidad exacta
    if (item.item_id_for_delete) {
      CartService.updateCartItem(item.item_id_for_delete, { quantity });
    }
  },

  // Limpiar carrito
  clearCart: () => {
    set({ items: [] });
    storage.removeItem(STORAGE_KEY);
    CartService.clearCart();
  },
  logOutCart: () => {
    set({ items: [] });
    storage.removeItem(STORAGE_KEY);
    set({ hasInitialized: false });
  },
  setDeliveryType: (
    type: "group" | "home",
    groupId?: string,
    address?: string
  ) => {},
  // Sincronizar con el backend - El backend es la fuente de verdad
  syncCart: async () => {
    const authToken = await TokenService.getToken();
    if (!authToken) return false;

    const localItems = get().items;

    try {
      set({ loading: true });

      const serverCart = await CartService.getCart();
      let serverItems = serverCart.items.map((item: any) => ({
        id: item.product_id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image_url,
        item_id_for_delete: item.id,
      }));

      // 1) Si el backend tiene items → usar backend como fuente de verdad
      if (serverItems.length > 0) {
        // Solo agregar items locales que NO existan en backend
        const serverIds = new Set(serverItems.map((i) => i.id));
        const toSync = localItems.filter((i) => !serverIds.has(i.id));

        // IMPORTANTE: Solo agregar items nuevos con quantity: 1 porque addToCart SUMA
        for (const item of toSync) {
          // Enviar el producto múltiples veces con quantity: 1 para que el backend sume correctamente
          for (let i = 0; i < item.quantity; i++) {
            await CartService.addToCart({
              product_id: item.id,
              quantity: 1,
            });
          }
        }

        // Refrescar carrito después de sincronizar
        const updated = await CartService.getCart();
        const finalItems = updated.items.map((item: any) => ({
          id: item.product_id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image_url,
          item_id_for_delete: item.id,
        }));

        set({ items: finalItems, hasInitialized: true });
        await storage.removeItem(STORAGE_KEY);
        return true;
      }

      // 2) Si no hay carrito en backend → subir carrito local
      // Usar quantity: 1 y hacer múltiples llamadas para que el backend sume correctamente
      for (const item of localItems) {
        for (let i = 0; i < item.quantity; i++) {
          await CartService.addToCart({
            product_id: item.id,
            quantity: 1,
          });
        }
      }

      const final = await CartService.getCart();
      set({
        items: final.items.map((item: any) => ({
          id: item.product_id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image_url,
          item_id_for_delete: item.id,
        })),
        hasInitialized: true,
      });

      await storage.removeItem(STORAGE_KEY);

      return true;
    } catch (err) {
      notify.error({ message: getBackendErrorMessage(err) });
      return false;
    } finally {
      set({ loading: false });
    }
  },
}));
