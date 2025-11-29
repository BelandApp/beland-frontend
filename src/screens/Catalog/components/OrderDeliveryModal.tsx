import React, { useEffect } from "react";
import { View } from "react-native";
import { OrderDeliveryModalStyles as styles } from "./orderSteps/styles";
import { useOrderDelivery } from "../hooks";
import Modal from "react-native-modal";
import { CreateAddress, SelectAddress, ConfirmOrder,HeaderSteps } from "./orderSteps";
import Toast from "react-native-toast-message";
import { toastConfig } from "src/components/shared/notification/GlobalNotification";

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
    loadingAddresses,
    preOrder,
    selectAddress,
    createAddress,
    createAndContinue,
    cancelAddressCreation,
    submitOrder,
  } = useOrderDelivery(onOrderCreated);

  useEffect(() => {
    if (visible) loadAddresses();
    else setStep("select");
  }, [visible]);

  const handleDismiss = () => { 
    onCancel();
    onClose();
  }
  return (
    <Modal
      style={styles.overlay}
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      propagateSwipe
    >
      <View style={styles.container}>
        {/* HEADER */}
        <HeaderSteps
          step={step}
          setStep={setStep}
          onBack={() => (step === "form" ? setStep("select") : handleDismiss())}
        />

        {/* BODY */}
        {step === "select" && (
          <SelectAddress
            addresses={addresses}
            loadingAddresses={loadingAddresses}
            onSubmit={selectAddress}
            onCancel={handleDismiss}
            onAddNew={() => setStep("form")}
          />
        )}

        {step === "form" && (
          <CreateAddress
            onCreateAddress={createAddress}
            onCreateAndSubmit={createAndContinue}
            onCancel={cancelAddressCreation}
          />
        )}

        {step === "processing" && (
          <ConfirmOrder
            onSubmit={submitOrder}
            preOrder={preOrder}
            onCancel={() => setStep("select")}
          />
        )}
      </View>
      <Toast config={toastConfig} />
    </Modal>
  );
};
