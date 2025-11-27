import { useCallback, useEffect, useState } from "react";
import { useCart } from "./useCart";
import { useCartStore } from "../stores/useCartStore";
import { useAuth } from "@/context/AuthContext";

export const useCartSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const { syncCartWithServer } = useCart();
  const { syncWithServerCart, mergeWithServerCart } = useCartStore();
  const { user } = useAuth();

  const performCartSync = useCallback(
    async (strategy: "replace" | "merge" = "merge") => {
      if (!user) {
        return;
      }

      setIsSyncing(true);
      setSyncError(null);

      try {
        const syncResult = await syncCartWithServer();

        if (syncResult) {
          const serverItems = syncResult.items || [];
          const cartId = syncResult.id;

          if (serverItems.length > 0) {
            const processedItems = serverItems.map((item: any) => ({
              id: item.product_id,
              name: item.product?.name || "Unknown Product",
              price: item.unit_price,
              quantity: item.quantity,
              image: item.product?.image_url,
              cart_item_id: item.id,
            }));

            if (strategy === "replace") {
              syncWithServerCart(processedItems, cartId);
            } else {
              mergeWithServerCart(processedItems, cartId);
            }
          } else {
            useCartStore.setState({ cartId });
          }
        }
      } catch (error: any) {
        setSyncError(error.message || "Error al sincronizar carrito");
      } finally {
        setIsSyncing(false);
      }
    },
    [user]
  );

  return {
    isSyncing,
    syncError,
    performCartSync,
  };
};
