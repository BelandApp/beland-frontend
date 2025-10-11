import { useState } from "react";
import { Product } from "@services/core";

export const useCatalogModals = () => {
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showProductAddedModal, setShowProductAddedModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const openDeliveryModal = (product: Product) => {
    setSelectedProduct(product);
    setShowDeliveryModal(true);
  };

  const closeDeliveryModal = () => {
    setShowDeliveryModal(false);
    setSelectedProduct(null);
  };

  const openProductAddedModal = (product: Product) => {
    setSelectedProduct(product);
    setShowProductAddedModal(true);
  };

  const closeProductAddedModal = () => {
    setShowProductAddedModal(false);
    setSelectedProduct(null);
  };

  return {
    showDeliveryModal,
    showProductAddedModal,
    selectedProduct,
    openDeliveryModal,
    closeDeliveryModal,
    openProductAddedModal,
    closeProductAddedModal,
  };
};
