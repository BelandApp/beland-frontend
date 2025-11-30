import { useState } from "react";
import { Product } from "@services/core";

export const useCatalogModals = () => {
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showProductAddedModal, setShowProductAddedModal] = useState(false);

  const openDeliveryModal = () => {
    setShowDeliveryModal(true);
  };

  const closeDeliveryModal = () => {
    setShowDeliveryModal(false);
  };

  const openProductAddedModal = () => {
    setShowProductAddedModal(true);
  };

  const closeProductAddedModal = () => {
    setShowProductAddedModal(false);
  };

  return {
    showDeliveryModal,
    showProductAddedModal,
    openDeliveryModal,
    closeDeliveryModal,
    openProductAddedModal,
    closeProductAddedModal,
  };
};
