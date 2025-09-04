import { useState, useEffect, useCallback } from "react";
import { cartService, Cart, CartItem } from "../services/cartService";
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

      // Intentar obtener carrito existente del usuario
      // Si no existe, el backend puede crear uno automáticamente
      // o podemos crear uno nuevo aquí
      const userCart = await cartService.createCart();
      setCart(userCart);
    } catch (err: any) {
      console.error("Error initializing cart:", err);
      setError(err.message || "Error al inicializar carrito");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Obtener carrito por ID
  const getCart = useCallback(async (cartId: string) => {
    try {
      setLoading(true);
      setError(null);

      const cartData = await cartService.getCart(cartId);
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

  // Agregar producto al carrito
  const addProduct = useCallback(
    async (productId: string, quantity: number, unitPrice: number) => {
      if (!cart) {
        setError("No hay carrito inicializado");
        return false;
      }

      try {
        setLoading(true);
        setError(null);

        await cartService.addCartItem(productId, quantity, unitPrice);

        // Recargar carrito después de agregar item
        await getCart(cart.id);
        return true;
      } catch (err: any) {
        console.error("Error adding product to cart:", err);
        setError(err.message || "Error al agregar producto");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [cart, getCart]
  );

  // Actualizar cantidad de producto
  const updateQuantity = useCallback(
    async (itemId: string, newQuantity: number) => {
      if (!cart) {
        setError("No hay carrito inicializado");
        return false;
      }

      try {
        setLoading(true);
        setError(null);

        await cartService.updateCartItem(itemId, { quantity: newQuantity });

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

  // Eliminar producto del carrito
  const removeProduct = useCallback(
    async (itemId: string) => {
      if (!cart) {
        setError("No hay carrito inicializado");
        return false;
      }

      try {
        setLoading(true);
        setError(null);

        await cartService.removeCartItem(itemId);

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

  // Limpiar carrito
  const clearCart = useCallback(async () => {
    if (!cart) {
      setError("No hay carrito inicializado");
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      await cartService.clearCart(cart.id);

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
  };
};
