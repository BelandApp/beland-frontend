import { useState, useCallback, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { useCartStore } from "../../../stores/cart/useCartStore";
import { useAuth } from "@/context/AuthContext";
import { ProductCardType } from "../components/ProductCard";
import { notify } from "src/hooks/notification/notify.external";

export const useCatalogCart = () => {
  const { canPerformAction, handleAuth0Login, isAuthenticated } = useAuth();
  const [showCart, setShowCart] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { syncCart } = useCartStore();
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const { addProduct, items: cartProducts } = useCartStore();

  // Manejar agregar producto al carrito
  const handleAddProduct = useCallback(
    async (product: ProductCardType) => {
      setIsSyncing(true);
      // Normalizar campo de imagen
      const imageField =
        (product as any).image_url || (product as any).image || "";
      setAddingProductId(product.id);
      if (product.stock < 1) {
        notify.error({
          message: "Nos quedamos sin stock",
          message2: "Lo sentimos",
        });
        return;
      }
      addProduct({
        id: product.id,
        name: product.name,
        price: Number((product as any).price),
        quantity: 1,
        image: imageField,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setAddingProductId(null);
      notify.cartItem({
        message: "Producto agregado al carrito",
        message2: "Ir al carrito",
        onConfirm: () => setShowCart(true),
      });
      setIsSyncing(false);
    },
    [canPerformAction],
  );

  // Abrir/cerrar carrito
  const openCart = () => {
    setIsSyncing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowCart(true);
    syncCart().then(() => setIsSyncing(false));
  };
  const closeCart = useCallback(() => setShowCart(false), []);

  return {
    // State
    showCart,
    cartProducts,
    isSyncing,
    isAuthenticated,
    addingProductId,
    // Actions
    handleAddProduct,
    openCart,
    closeCart,
    handleAuth0Login,
  };
};
