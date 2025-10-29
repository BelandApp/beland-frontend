import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useUserBalance } from "../../../hooks/useUserBalance";
import { calculateResourcePrice } from "../../../utils/priceHelpers";
import { WalletService } from "@services/core";

export const useCommunityPurchase = () => {
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [insufficientBalanceModalVisible, setInsufficientBalanceModalVisible] =
    useState(false);
  const [selectedCommunityResource, setSelectedCommunityResource] = useState<
    any | null
  >(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  const { balance } = useUserBalance();

  const openPurchaseModal = useCallback((resource: any) => {
    setSelectedCommunityResource(resource);
    setPurchaseModalVisible(true);
  }, []);

  const closePurchaseModal = useCallback(() => {
    setPurchaseModalVisible(false);
    setSelectedCommunityResource(null);
  }, []);

  const closeInsufficientBalanceModal = useCallback(() => {
    setInsufficientBalanceModalVisible(false);
    setSelectedCommunityResource(null);
  }, []);

  const handlePurchaseConfirm = useCallback(
    async (quantity: number) => {
      if (!selectedCommunityResource) return;

      const priceCalc = calculateResourcePrice(selectedCommunityResource);
      const totalCost = priceCalc.finalPrice * quantity;

      if (!balance || balance < totalCost) {
        setPurchaseModalVisible(false);
        setInsufficientBalanceModalVisible(true);
        return;
      }

      setPurchaseLoading(true);
      try {
        // Realizar la compra real usando el WalletService
        await WalletService.purchaseResource(
          selectedCommunityResource.id,
          quantity
        );

        Alert.alert(
          "Compra exitosa",
          `Has adquirido ${quantity}x ${selectedCommunityResource.resource_name}`,
          [{ text: "OK" }]
        );

        setPurchaseModalVisible(false);
        setSelectedCommunityResource(null);
      } catch (error) {
        console.error("Error en compra de recurso:", error);
        Alert.alert(
          "Error en la compra",
          "No se pudo completar la compra. Inténtalo de nuevo.",
          [{ text: "OK" }]
        );
      } finally {
        setPurchaseLoading(false);
      }
    },
    [selectedCommunityResource, balance]
  );

  // Cancelar compra
  const handlePurchaseCancel = useCallback(() => {
    setPurchaseModalVisible(false);
    setSelectedCommunityResource(null);
  }, []);

  // Obtener costo requerido para el recurso seleccionado
  const getRequiredAmount = useCallback(() => {
    if (!selectedCommunityResource) return 0;
    return calculateResourcePrice(selectedCommunityResource).finalPrice;
  }, [selectedCommunityResource]);

  return {
    // Estado
    purchaseModalVisible,
    insufficientBalanceModalVisible,
    selectedCommunityResource,
    purchaseLoading,
    balance,

    // Acciones
    openPurchaseModal,
    closePurchaseModal,
    closeInsufficientBalanceModal,
    handlePurchaseConfirm,
    handlePurchaseCancel,
    getRequiredAmount,
  };
};
