import { useState, useEffect, useCallback } from "react";
import { CartService } from "@services/core";
import type { Cart, CartItem } from "@services/core";
import { useAuth } from "./AuthContext";

// Hook para manejar carrito con API
export const useCart = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Crear o obtener carrito del usuario
  const initializeCart = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Intentar obtener carrito existente del usuario primero para evitar
      // condiciones de carrera que resulten en errores 500 por duplicados.
      try {
        const existing = await CartService.getCart();
        if (existing) {
          setCart(existing);
        } else {
          const created = await CartService.getCart();
          setCart(created);
        }
      } catch (getErr) {
        // Si GET falla (p. ej. 404/no cart), intentar crear uno nuevo
        try {
          const created = await CartService.getCart();
          setCart(created);
        } catch (createErr) {
          throw createErr;
        }
      }
    } catch (err: any) {
      console.error("Error initializing cart:", err);
      setError(err.message || "Error al inicializar carrito");
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

      console.log("🔄 useCart: Syncing cart with server...");
      const syncResult = await CartService.syncCart([]);

      if (syncResult) {
        console.log("✅ useCart: Cart sync successful:", syncResult);
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

  // Obtener carrito por ID
  const getCart = useCallback(async (cartId: string) => {
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
  }, []);

  // Agregar producto al carrito (solo local, sin API hasta checkout)
  const addProduct = useCallback(
    async (productId: string, quantity: number, unitPrice: number) => {
      // Nota: Esta función ya no interactúa con la API
      // Solo se usa para mantener compatibilidad con componentes existentes
      // La lógica real de carrito se maneja con useCartStore
      console.log(
        "useCart.addProduct called but cart logic is now handled by useCartStore"
      );
      return true;
    },
    []
  );

  // Actualizar cantidad de producto (solo usado después de checkout)
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
        await getCart(cart.id);
        return true;
      } catch (err: any) {
        console.error("Error updating cart item:", err);
        setError(err.message || "Error al actualizar cantidad");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [cart, getCart]
  );

  // Eliminar producto del carrito (solo usado después de checkout)
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
        await getCart(cart.id);
        return true;
      } catch (err: any) {
        console.error("Error removing cart item:", err);
        setError(err.message || "Error al eliminar producto");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [cart, getCart]
  );

  // Limpiar carrito (eliminando items uno por uno)
  const clearCart = useCallback(async () => {
    if (!cart) {
      setError("No hay carrito inicializado");
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      // Eliminar items uno por uno ya que no existe endpoint para limpiar todo el carrito
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
      await getCart(cart.id);
      return true;
    } catch (err: any) {
      console.error("Error clearing cart:", err);
      setError(err.message || "Error al limpiar carrito");
      return false;
    } finally {
      setLoading(false);
    }
  }, [cart, getCart]);

  // Procesar carrito para checkout (deprecated - ahora se hace directo en store)
  const processCheckout = useCallback(async (cartProducts: any[]) => {
    console.log(
      "⚠️ useCart: processCheckout is deprecated. Use store createOrder instead."
    );
    throw new Error(
      "processCheckout is deprecated. Use store createOrder instead."
    );
  }, []);

  // Calcular totales
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

  // Inicializar carrito cuando el usuario esté disponible
  useEffect(() => {
    if (user && !cart) {
      initializeCart();
    }
  }, [user, cart, initializeCart]);

  return {
    cart,
    loading,
    error,
    totals,
    initializeCart,
    getCart,
    addProduct,
    updateQuantity,
    removeProduct,
    clearCart,
    processCheckout,
    syncCartWithServer,
  };
};
