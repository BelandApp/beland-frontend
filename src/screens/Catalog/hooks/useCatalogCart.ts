import { useState, useCallback, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { useCartStore } from "../../../stores/cart/useCartStore";
import { useAuth } from "@/context/AuthContext";
import { ProductCardType } from "../components/ProductCard";
import { notify } from "src/hooks/notification/notify.external";

export const useCatalogCart = () => {
  const { handleAuth0Login, isAuthenticated } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const addProduct = useCartStore((state) => state.addProduct);
  const totalUSD = useCartStore((state) => state.totalUSD);
  const cartProducts = useCartStore((state) => state.items);
  const showCart = useCartStore((state) => state.showCart);
  const setShowCart = useCartStore((state) => state.setShowCart);
  const syncCart = useCartStore((state) => state.syncCart);

  // Manejar agregar producto al carrito
  const handleAddProduct = useCallback(async (product: ProductCardType) => {
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
  }, []);
  const openCart = () => {
    console.log("se abrio");
    setIsSyncing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowCart(true);
  };
  useEffect(() => {
    if (showCart) {
      syncCart().then(() => setIsSyncing(false));
    }
  }, [showCart]);
  const closeCart = () => {
    setShowCart(false);
  };
  return {
    // State
    showCart,
    cartProducts,
    isSyncing,
    isAuthenticated,
    addingProductId,
    totalUSD,
    // Actions
    openCart,
    closeCart,
    handleAddProduct,
    handleAuth0Login,
  };
};
