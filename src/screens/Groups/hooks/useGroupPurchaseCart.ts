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

// Re-defined useGroupPurchaseCart to use Group's specific cart
export const useGroupPurchaseCart = (
  groupId: string,
  initialGroupData?: any,
) => {
  const { user } = useAuth();
  const notify = useNotify();

  const [cart, setCart] = useState<GroupPurchaseCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupCartId, setGroupCartId] = useState<string | null>(null);

  useEffect(() => {
    const loadGroupCart = async () => {
      try {
        setLoading(true);
        console.log("[useGroupPurchaseCart] Loading cart for group:", groupId);

        const groupData = await GroupService.getGroup(groupId);
        console.log("[useGroupPurchaseCart] Fetched Group Data.");

        if (groupData && groupData.cart) {
          console.log(
            "[useGroupPurchaseCart] Found Group Cart ID:",
            groupData.cart.id,
          );
          setGroupCartId(groupData.cart.id);

          // Fetch FULL cart details with products
          const fullCart = await GroupService.getCartById(groupData.cart.id);
          setCart(fullCart);
        } else {
          console.warn(
            "[useGroupPurchaseCart] No cart found on fetched group object!",
          );
          setCart(null);
          setGroupCartId(null);
        }
      } catch (err) {
        console.error("[useGroupPurchaseCart] Error loading group cart:", err);
        setError(
          err instanceof Error ? err.message : "Error loading group cart",
        );
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      loadGroupCart();
    }
  }, [groupId]);

  const refreshCart = async () => {
    if (!groupCartId) {
      // If we don't have ID, try fetching group first
      if (!groupId) return;
      try {
        const groupData = await GroupService.getGroup(groupId);
        if (groupData?.cart) {
          setGroupCartId(groupData.cart.id);
          const fullCart = await GroupService.getCartById(groupData.cart.id);
          setCart(fullCart);
        }
      } catch (e) {
        console.error(e);
      }
      return;
    }

    try {
      const fullCart = await GroupService.getCartById(groupCartId);
      setCart(fullCart);
    } catch (err) {
      console.error("Error refreshing cart:", err);
    }
  };

  const addProductToCart = async (
    product: {
      id: string;
      name: string;
      price: number;
      image_url?: string;
      description?: string;
    },
    quantity: number,
    is_general?: boolean,
  ): Promise<boolean> => {
    try {
      if (!groupCartId) {
        notify.error({ message: "No se encontró el carrito del grupo" });
        return false;
      }
      // Use helper method to add to specific cart ID
      await GroupService.addItemToSpecificCart(
        groupCartId,
        product,
        quantity,
        is_general,
      );
      await refreshCart();
      return true;
    } catch (err) {
      console.error("Error adding to cart:", err);
      // notify.error({ message: "Error al agregar producto" });
      return false;
    }
  };

  const removeProductFromCart = async (
    cartItemId: string,
  ): Promise<boolean> => {
    try {
      await GroupService.removeItemFromSpecificCart(cartItemId);
      await refreshCart();
      return true;
    } catch (err) {
      console.error("Error removing:", err);
      return false;
    }
  };

  const updateCartItemQuantity = async (
    cartItemId: string,
    newQuantity: number,
  ): Promise<boolean> => {
    try {
      if (newQuantity <= 0) return removeProductFromCart(cartItemId);
      await GroupService.updateItemQuantitySpecificCart(
        cartItemId,
        newQuantity,
      );
      await refreshCart();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const updateProductQuantity = async (
    productId: string,
    newQuantity: number,
    userId?: string,
  ): Promise<boolean> => {
    try {
      // NOTE: backend updateItemQuantityByProduct might not handle "delete if 0" automatically
      // if it logic is different. But CartItemsService.updateQuantityProduct usually does check 0?
      // Actually CartItemsService.update checks 0. updateQuantityProduct uses repo.findByProduct then calls update.
      // So yes, it should handle 0 -> delete.
      await GroupService.updateItemQuantityByProduct(
        productId,
        newQuantity,
        userId,
      );
      await refreshCart();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const clearCart = async (): Promise<boolean> => {
    if (!groupCartId) return false;
    try {
      // Use direct cart clear endpoint if available or loop items
      // Assuming clearGroupCart can take an ID if modified?
      // Actually GroupService.clearGroupCart in frontend was modified to take cartId
      await GroupService.clearGroupCart(groupCartId);
      await refreshCart();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const getTotalPrice = (): number => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce(
      (sum, item) => sum + Number(item.total_price || 0),
      0,
    );
  };

  const getTotalItems = (): number => cart?.total_items || 0;

  const getTotalWithDelivery = (): number => {
    return getTotalPrice() + (cart?.delivery_cost || 0);
  };

  return {
    cart,
    loading,
    error,
    addProductToCart,
    removeProductFromCart,
    updateCartItemQuantity, // For Item Row +/-
    updateProductQuantity, // For Assignment Logic
    getTotalPrice,
    getTotalItems,
    getTotalWithDelivery,
    clearCart,
    refetchCart: refreshCart,
  };
};

// Re-export types from GroupApiService (if needed for external consumption)
export type {
  GroupPurchaseCart,
  GroupPurchaseCartItem,
} from "src/services/GroupApiService";
