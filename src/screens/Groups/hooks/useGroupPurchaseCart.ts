/**
 * Hook para manejar el carrito de compra en grupo
 * Mantiene un carrito SEPARADO del carrito personal del usuario
 */

import { useState, useEffect } from "react";
import { useAuth } from "src/context/AuthContext";
import { useNotify } from "src/hooks/notification/useNotify";
import {
  GroupService,
  GroupPurchaseCart,
  GroupPurchaseCartItem,
} from "src/services/GroupApiService";

export const useGroupPurchaseCart = (groupId: string) => {
  const { user } = useAuth();
  const notify = useNotify();

  const [cart, setCart] = useState<GroupPurchaseCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar el carrito del grupo al montar el componente
  useEffect(() => {
    if (groupId) {
      fetchCart();
    }
  }, [groupId]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      // Obtener carrito del usuario autenticado
      const fetchedCart = await GroupService.getMyCart();
      setCart(fetchedCart);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar el carrito";
      setError(errorMessage);
      console.error("Error fetching group purchase cart:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Agregar un producto al carrito del grupo
   */
  const addProductToCart = async (
    product: {
      id: string;
      name: string;
      price: number;
      image_url?: string;
      description?: string;
    },
    quantity: number
  ): Promise<boolean> => {
    try {
      if (!user?.id) {
        notify.error({ message: "Usuario no autenticado" });
        return false;
      }

      const updatedCart = await GroupService.addProductToGroupCart(
        groupId,
        product,
        quantity,
        user.id
      );

      setCart(updatedCart);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al agregar el producto";
      notify.error({ message: errorMessage });
      console.error("Error adding product to cart:", err);
      return false;
    }
  };

  /**
   * Remover un producto del carrito
   */
  const removeProductFromCart = async (
    cartItemId: string
  ): Promise<boolean> => {
    try {
      const updatedCart = await GroupService.removeProductFromGroupCart(
        groupId,
        cartItemId
      );
      setCart(updatedCart);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al remover el producto";
      notify.error({ message: errorMessage });
      console.error("Error removing product from cart:", err);
      return false;
    }
  };

  /**
   * Actualizar la cantidad de un producto en el carrito
   */
  const updateProductQuantity = async (
    cartItemId: string,
    newQuantity: number
  ): Promise<boolean> => {
    try {
      if (newQuantity <= 0) {
        return await removeProductFromCart(cartItemId);
      }

      const updatedCart = await GroupService.updateProductQuantityInGroupCart(
        groupId,
        cartItemId,
        newQuantity
      );
      setCart(updatedCart);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al actualizar la cantidad";
      notify.error({ message: errorMessage });
      console.error("Error updating product quantity:", err);
      return false;
    }
  };

  /**
   * Obtener el precio total del carrito (sin envío)
   */
  const getTotalPrice = (): number => {
    if (!cart) return 0;
    return cart.items.reduce((sum: number, item: GroupPurchaseCartItem) => {
      return sum + item.total_price;
    }, 0);
  };

  /**
   * Obtener la cantidad total de items en el carrito
   */
  const getTotalItems = (): number => {
    if (!cart) return 0;
    return cart.total_items;
  };

  /**
   * Obtener el precio con envío incluido
   */
  const getTotalWithDelivery = (): number => {
    return getTotalPrice() + (cart?.delivery_cost || 0);
  };

  /**
   * Vaciar el carrito
   */
  const clearCart = async (): Promise<boolean> => {
    try {
      const clearedCart = await GroupService.clearGroupCart(groupId);
      setCart(clearedCart);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al vaciar el carrito";
      notify.error({ message: errorMessage });
      console.error("Error clearing cart:", err);
      return false;
    }
  };

  return {
    cart,
    loading,
    error,
    addProductToCart,
    removeProductFromCart,
    updateProductQuantity,
    getTotalPrice,
    getTotalItems,
    getTotalWithDelivery,
    clearCart,
    refetchCart: fetchCart,
  };
};

// Re-export types from GroupApiService (if needed for external consumption)
export type {
  GroupPurchaseCart,
  GroupPurchaseCartItem,
} from "src/services/GroupApiService";
