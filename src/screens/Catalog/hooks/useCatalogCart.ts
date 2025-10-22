import { useState, useCallback, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { useCartStore } from "../../../stores/useCartStore";
import { useCartSync } from "../../../hooks/useCartSync";
import { useAuth } from "@/context/AuthContext";
import { ProductCardType } from "../components/ProductCard";

export const useCatalogCart = () => {
  const { canPerformAction, loginWithAuth0 } = useAuth();
  const [showCart, setShowCart] = useState(false);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [showAuthAlert, setShowAuthAlert] = useState(false);

  const {
    addProduct: addProductToCart,
    addProductToServer,
    products: cartProducts,
  } = useCartStore();

  const { isSyncing, syncError, performCartSync } = useCartSync();

  // Sincronizar carrito al montar el componente
  const syncCart = useCallback(async () => {
    try {
      await performCartSync("merge");
    } catch (error) {
      console.warn("Error al sincronizar carrito:", error);
    }
  }, [performCartSync]);

  useEffect(() => {
    syncCart();
  }, [syncCart]);

  // Manejar agregar producto al carrito
  const handleAddProduct = useCallback(
    async (product: ProductCardType) => {
      if (!canPerformAction) {
        setShowAuthAlert(true);
        return;
      }

      // Normalizar campo de imagen
      const imageField =
        (product as any).image_url || (product as any).image || "";

      try {
        setAddingProductId(product.id);

        const success = await addProductToServer({
          id: product.id,
          name: product.name,
          price: Number((product as any).price || 0),
          quantity: 1,
          image: imageField,
        });

        if (success) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          // Fallback local add
          addProductToCart({
            id: product.id,
            name: product.name,
            price: Number((product as any).price || 0),
            quantity: 1,
            image: imageField,
          });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      } catch (error) {
        console.error("❌ CatalogScreen: Error adding product:", error);
        // Fallback to local add
        addProductToCart({
          id: product.id,
          name: product.name,
          price: Number((product as any).price || 0),
          quantity: 1,
          image: imageField,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setAddingProductId(null);
      }
    },
    [canPerformAction, addProductToServer, addProductToCart]
  );

  // Abrir/cerrar carrito
  const openCart = useCallback(() => setShowCart(true), []);
  const closeCart = useCallback(() => setShowCart(false), []);

  // Cerrar alerta de autenticación
  const closeAuthAlert = useCallback(() => setShowAuthAlert(false), []);

  return {
    // State
    showCart,
    addingProductId,
    showAuthAlert,
    cartProducts,
    isSyncing,
    syncError,

    // Actions
    handleAddProduct,
    openCart,
    closeCart,
    closeAuthAlert,
    syncCart,
    loginWithAuth0,
  };
};
