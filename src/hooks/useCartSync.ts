import { useEffect, useState } from "react";
import { useCart } from "./useCart";
import { useCartStore } from "../stores/useCartStore";
import { useAuth } from "./AuthContext";
import { cartService } from "../services/cartService";

export const useCartSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const { syncCartWithServer } = useCart();
  const { syncWithServerCart, mergeWithServerCart } = useCartStore();
  const { user } = useAuth();

  const performCartSync = async (strategy: "replace" | "merge" = "merge") => {
    if (!user) {
      console.log("🚫 CartSync: No user authenticated, skipping sync");
      return;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      console.log(`🔄 CartSync: Starting cart sync with strategy: ${strategy}`);

      const syncResult = await syncCartWithServer();

      if (syncResult) {
        const { serverItems, cartId } = syncResult;

        if (serverItems.length > 0) {
          console.log(
            `📦 CartSync: Found ${serverItems.length} items in server cart`
          );

          // Procesar items del carrito usando directamente los datos del endpoint /cart-items
          const processedItems = cartService.processCartItems(serverItems);

          if (strategy === "replace") {
            syncWithServerCart(processedItems, cartId);
          } else {
            mergeWithServerCart(processedItems, cartId);
          }
        } else {
          console.log("📭 CartSync: No items found in server cart");
          // Solo actualizar el cartId sin modificar productos locales
          useCartStore.setState({ cartId });
        }

        console.log("✅ CartSync: Cart synchronization completed");
      } else {
        console.log("⚠️ CartSync: Could not sync with server");
      }
    } catch (error: any) {
      console.error("❌ CartSync: Error during cart synchronization:", error);
      setSyncError(error.message || "Error al sincronizar carrito");
    } finally {
      setIsSyncing(false);
    }
  };

  // Sincronización automática al inicializar la app o cambiar de usuario
  useEffect(() => {
    if (user) {
      console.log("👤 CartSync: User authenticated, performing initial sync");
      performCartSync("merge"); // Usar 'merge' por defecto para no perder datos locales
    }
  }, [user]);

  return {
    isSyncing,
    syncError,
    performCartSync,
  };
};
