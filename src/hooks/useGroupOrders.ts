/**
 * useGroupOrders - Custom hook for managing group orders
 * Handles creation, tracking, and management of shared orders with payment division
 */

import { useState, useCallback } from "react";
import type { Order } from "../services/OrderApiService";
import { OrderService } from "../services/OrderApiService";
import { CartService } from "../services/cart/CartApiService";
import { useErrorHandler } from "./useErrorHandler";
import { useLoadingState } from "./useLoadingState";

export interface GroupOrderConfig {
  groupId: string;
  paymentType: "FULL" | "EQUAL_SPLIT";
  addressId?: string;
  deliveryDetails?: {
    delivery_cost: number;
    distance_km: number;
    duration_min: number;
  };
}

export interface GroupOrderState {
  order: Order | null;
  isLoading: boolean;
  error: string | null;
  memberSplit?: number; // Calculated split amount per member
}

export const useGroupOrders = () => {
  const [groupOrderState, setGroupOrderState] = useState<GroupOrderState>({
    order: null,
    isLoading: false,
    error: null,
    memberSplit: undefined,
  });

  const { handleError } = useErrorHandler();
  const { setLoading, isLoading } = useLoadingState();

  /**
   * Create a group order with specified payment configuration
   */
  const createGroupOrder = useCallback(
    async (config: GroupOrderConfig): Promise<Order | null> => {
      try {
        setLoading("groupOrder", true);
        setGroupOrderState((prev) => ({ ...prev, error: null }));

        // 1. Get current cart
        const cart = await CartService.getCart();

        if (!cart.items || cart.items.length === 0) {
          throw new Error("El carrito está vacío. Agrega productos primero.");
        }

        // 2. Set group - esto establece automáticamente el payment_type_id del grupo
        await CartService.setCartGroup(config.groupId);

        // 3. Set address if provided
        if (config.addressId) {
          await CartService.setCartAddress(config.addressId);
        }

        // 4. Set delivery details if provided
        if (config.deliveryDetails) {
          await CartService.setDeliveryDetails(config.deliveryDetails);
        }

        // 5. Create order directamente - el carrito ya tiene el payment_type_id del grupo
        const orderResult = await OrderService.createOrder({
          cart_id: cart.id,
        });

        setGroupOrderState((prev) => ({
          ...prev,
          order: orderResult.order,
        }));

        return orderResult.order;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        handleError(errorMessage);
        setGroupOrderState((prev) => ({
          ...prev,
          error: errorMessage,
        }));
        return null;
      } finally {
        setLoading("groupOrder", false);
      }
    },
    [setLoading, handleError]
  );

  /**
   * Get order details for a group order
   */
  const getGroupOrder = useCallback(
    async (orderId: string): Promise<Order | null> => {
      try {
        setLoading("getOrder", true);
        const order = await OrderService.getOrder(orderId);
        setGroupOrderState((prev) => ({
          ...prev,
          order,
        }));
        return order;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        handleError(errorMessage);
        setGroupOrderState((prev) => ({
          ...prev,
          error: errorMessage,
        }));
        return null;
      } finally {
        setLoading("getOrder", false);
      }
    },
    [setLoading, handleError]
  );

  /**
   * Calculate how much each member should pay (for EQUAL_SPLIT)
   */
  const calculateMemberSplit = useCallback(
    async (groupId: string) => {
      try {
        const cart = await CartService.getCart();
        const totalCost = cart.total_amount || 0;

        // This would need group member count from backend
        // For now, just store the total
        setGroupOrderState((prev) => ({
          ...prev,
          memberSplit: totalCost,
        }));

        return totalCost;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        handleError(errorMessage);
        return null;
      }
    },
    [handleError]
  );

  /**
   * Clear group order state
   */
  const clearGroupOrder = useCallback(() => {
    setGroupOrderState({
      order: null,
      isLoading: false,
      error: null,
      memberSplit: undefined,
    });
  }, []);

  return {
    order: groupOrderState.order,
    isLoading: isLoading("groupOrder"),
    error: groupOrderState.error,
    memberSplit: groupOrderState.memberSplit,
    createGroupOrder,
    getGroupOrder,
    calculateMemberSplit,
    clearGroupOrder,
  };
};
