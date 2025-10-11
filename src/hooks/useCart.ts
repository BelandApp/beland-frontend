import { useState, useEffect, useCallback } from "react";
import { CartService } from "@services/core";
import type { Cart } from "@services/core";
import { useAuth } from "./AuthContext";

export const useCart = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Obtener carrito del usuario
  const getCart = useCallback(async () => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);

      const cartData = await CartService.getCart();
      setCart(cartData);
      return cartData;
    } catch (err: any) {
      console.error("Error getting cart:", err);
      setError(err.message || "Error al obtener carrito");
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Sincronizar carrito local con el servidor
  const syncCartWithServer = useCallback(async () => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);

      const syncResult = await CartService.syncCart([]);

      if (syncResult) {
        return syncResult;
      }

      return null;
    } catch (err: any) {
      console.error("❌ useCart: Error syncing cart:", err);
      setError(err.message || "Error al sincronizar carrito");
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Actualizar cantidad de producto en carrito del servidor
  const updateQuantity = useCallback(
    async (itemId: string, newQuantity: number) => {
      if (!cart) {
        setError("No hay carrito inicializado");
        return false;
      }

      try {
        setLoading(true);
        setError(null);

        await CartService.updateCartItem(itemId, { quantity: newQuantity });

        // Recargar carrito después de actualizar
        await getCart();
        return true;
      } catch (err: any) {
        setError(err.message || "Error al actualizar cantidad");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [cart, getCart]
  );

  // Eliminar producto del carrito del servidor
  const removeProduct = useCallback(
    async (itemId: string) => {
      if (!cart) {
        setError("No hay carrito inicializado");
        return false;
      }

      try {
        setLoading(true);
        setError(null);

        await CartService.removeFromCart(itemId);

        // Recargar carrito después de eliminar
        await getCart();
        return true;
      } catch (err: any) {
        setError(err.message || "Error al eliminar producto");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [cart, getCart]
  );

  // Limpiar carrito del servidor
  const clearCart = useCallback(async () => {
    if (!cart) {
      setError("No hay carrito inicializado");
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      // Eliminar items uno por uno ya que no existe endpoint para limpiar todo
      if (cart.items && cart.items.length > 0) {
        for (const item of cart.items) {
          try {
            await CartService.removeFromCart(item.id);
          } catch (error) {
            console.warn(`Could not remove item ${item.id}:`, error);
          }
        }
      }

      // Recargar carrito después de limpiar
      await getCart();
      return true;
    } catch (err: any) {
      setError(err.message || "Error al limpiar carrito");
      return false;
    } finally {
      setLoading(false);
    }
  }, [cart, getCart]);

  // Calcular totales del carrito
  const totals = cart
    ? {
        totalItems: cart.total_items,
        totalAmount: cart.total_amount,
        itemCount: cart.items.length,
      }
    : {
        totalItems: 0,
        totalAmount: 0,
        itemCount: 0,
      };

  // Cargar carrito cuando el usuario esté disponible
  useEffect(() => {
    if (user) {
      getCart();
    }
  }, [user, getCart]);

  return {
    cart,
    loading,
    error,
    totals,
    getCart,
    updateQuantity,
    removeProduct,
    clearCart,
    syncCartWithServer,
  };
};
