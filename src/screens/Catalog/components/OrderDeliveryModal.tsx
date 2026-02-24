import React, { useEffect } from "react";
import { DeliveryStep, useOrderDelivery } from "../hooks";
import {
  CreateAddress,
  SelectAddress,
  ConfirmOrder,
  HeaderSteps,
} from "./orderSteps";
import { LocationNotAvailableModal } from "./LocationNotAvailableModal";
import Toast from "react-native-toast-message";
import { toastConfig } from "src/components/shared/notification/GlobalNotification";
import { Button, WrapperModal } from "src/components";
import { View } from "react-native";

interface OrderDeliveryModalProps {
  visible: boolean;
  onClose: () => void;
  onCancel: () => void;
  onOrderCreated?: (orderId: string) => void;
}

export const OrderDeliveryModal: React.FC<OrderDeliveryModalProps> = ({
  visible,
  onClose,
  onCancel,
  onOrderCreated,
}) => {
  const {
    step,
    loadAddresses,
    setStep,
    addresses,
    setLoading,
    loading,
    preOrder,
    selectAddress,
    createAddress,
    createAndContinue,
    cancelAddressCreation,
    cancelPreOrder,
    submitOrder,
    showLocationModal,
    detectedCountry,
    setShowLocationModal,
    submitStatus,
    setSubmitStatus,
  } = useOrderDelivery(onOrderCreated);

  useEffect(() => {
    if (visible) loadAddresses();
    else setStep("select");
  }, [visible]);

  const handleDismiss = () => {
    onCancel();
    onClose();
  };
  const handleSubmit = async () => {
    setLoading(true);
    await submitOrder();
    setTimeout(() => {
      setSubmitStatus("idle");
      setLoading(false);
      onClose();
    }, 2000);
  };
  const STEP_COMPONENTS: Record<DeliveryStep, React.ReactNode> = {
    select: (
      <SelectAddress
        addresses={addresses}
        loadingAddresses={loading}
        onSubmit={selectAddress}
      />
    ),
    form: (
      <CreateAddress
        onCreateAddress={createAddress}
        onCreateAndSubmit={createAndContinue}
        onCancel={cancelAddressCreation}
      />
    ),
    processing: (
      <ConfirmOrder
        onSubmit={handleSubmit}
        submitStatus={submitStatus}
        preOrder={preOrder}
        onCancel={cancelPreOrder}
      />
    ),
  };
  const STEP_BUTTONS: Record<DeliveryStep, React.ReactNode> = {
    select: (
      <Button
        title=" Agregar nueva dirección"
        onPress={() => setStep("form")}
        variant="secondary"
        disabled={loading}
      />
    ),
    form: <></>,
    processing: (
      <Button
        onPress={handleSubmit}
        title="Confirmar pedido"
        disabled={loading}
      />
    ),
  };
  return (
    <>
      <WrapperModal
        isOpen={visible}
        onClose={onClose}
        header={
          <HeaderSteps
            step={step}
            setStep={setStep}
            onBack={() =>
              step === "form" ? setStep("select") : handleDismiss()
            }
          />
        }
        content={STEP_COMPONENTS[step]}
        actions={STEP_BUTTONS[step]}
      />

      <LocationNotAvailableModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        country={detectedCountry}
      />
    </>
  );
};
