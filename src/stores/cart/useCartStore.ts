import { create } from "zustand";
import { CartService } from "@services/core";
import { storage } from "../storeEngine";
import { getBackendErrorMessage } from "src/services";
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
  addProduct: (product) => {
    const { items } = get();
    const exists = items.find((i) => i.id === product.id);
    let updatedItems = exists
      ? items.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      : [...items, { ...product, quantity: 1 }];

    set({ items: updatedItems });
    storage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
    get().syncCart();
  },

  // Remover producto
  removeProduct: (productId) => {
    const itemToDelete = get().items.find((i) => i.id === productId) 
    if(!itemToDelete || !itemToDelete.item_id_for_delete) return
    const updated = get().items.filter((i) => i.id !== productId);
    set({ items: updated });
    storage.setItem(STORAGE_KEY, JSON.stringify(updated));
    CartService.removeFromCart(itemToDelete?.item_id_for_delete);
    console.log("Se elimino correcto")
  },

  // Actualizar cantidad (mínimo 1)
  updateQuantity: (productId, quantity) => {
    if (quantity < 1) return;
    const updated = get().items.map((i) =>
      i.id === productId ? { ...i, quantity } : i
    );
    set({ items: updated });
    storage.setItem(STORAGE_KEY, JSON.stringify(updated));
    CartService.addToCart({ product_id:productId, quantity });
  },

  // Limpiar carrito
  clearCart: () => {
    set({ items: [] });
    storage.removeItem(STORAGE_KEY);
    CartService.clearCart();
  },
  setDeliveryType: (
    type: "group" | "home",
    groupId?: string,
    address?: string
  ) => { },
  // Sincronizar con el back, agregar y actualizar
  syncCart: async () => {
    const { items, hasInitialized } = get();
    try {
      set({ loading: true });
      const serverCart = await CartService.getCart();
      const serverItems = serverCart.items.map((item: any) => ({
        id: item.product_id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image_url,
        item_id_for_delete: item.id,
      }));

      if (!hasInitialized) {
        set({
          items: serverItems,
          hasInitialized: true,
        });

        await storage.setItem(STORAGE_KEY, JSON.stringify(serverItems));
        return true;
      }

      const serverItemsMap = new Map(serverItems.map((i) => [i.id, i]));

      for (const local of items) {
        const match = serverItemsMap.get(local.id);

        if (!match) {
          await CartService.addToCart({
            product_id: local.id,
            quantity: local.quantity,
          });
        } else if (match.quantity !== local.quantity) {
          await CartService.updateCartItem(match.id, {
            quantity: local.quantity,
          });
        }

        serverItemsMap.delete(local.id);
      }

      const updatedCart = await CartService.getCart();

      const finalItems = updatedCart.items.map((item: any) => ({
        id: item.product_id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image_url,
        item_id_for_delete: item.id,
      }));

      set({
        items: finalItems,
        hasInitialized: true,
      });

      await storage.setItem(STORAGE_KEY, JSON.stringify(finalItems));

      return true;
    } catch (err) {
      notify.error({ message: getBackendErrorMessage(err) });
      return false;
    } finally {
      set({ loading: false });
    }
  },
}));
