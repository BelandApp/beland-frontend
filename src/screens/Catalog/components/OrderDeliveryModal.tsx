import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Alert } from "react-native";
import { modalStyles } from "../styles";
import { AddressForm } from "./AddressForm";
import { useOrdersStoreAPI } from "../../../stores/useOrdersStoreAPI";
import { useCartStore, CartProduct } from "../../../stores/useCartStore";
import { useCustomAlert } from "../../../hooks/useCustomAlert";
import { CustomAlert } from "../../../components/ui/CustomAlert";
import { useAuth } from "../../../hooks/AuthContext";
import {
  DeliveryAddress,
  OrderItem,
  CreateOrderRequest,
} from "../../../types/Order";

interface OrderDeliveryModalProps {
  visible: boolean;
  onClose: () => void;
  onOrderCreated?: (orderId: string) => void;
}

type ModalStep = "address_form" | "processing";

export const OrderDeliveryModal: React.FC<OrderDeliveryModalProps> = ({
  visible,
  onClose,
  onOrderCreated,
}) => {
  const [currentStep, setCurrentStep] = useState<ModalStep>("address_form");

  const { createOrder, isLoading } = useOrdersStoreAPI();
  const { products: cartProducts, clearCart } = useCartStore();
  const { showAlert, alertConfig, showCustomAlert, hideAlert } =
    useCustomAlert();
  const { requireAuth } = useAuth();

  // Reset state when modal closes
  React.useEffect(() => {
    if (!visible) {
      setCurrentStep("address_form");
    }
  }, [visible]);

  // Convert cart products to order items
  const convertCartToOrderItems = (
    cartProducts: CartProduct[]
  ): OrderItem[] => {
    console.log("🔄 Converting cart products to order items:", cartProducts);

    const orderItems = cartProducts.map((product) => {
      const orderItem: OrderItem = {
        id: `${product.id}-${Date.now()}-${Math.random()}`, // Unique ID for order item
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        image: product.image,
        subtotal: product.price * product.quantity,
      };

      console.log(
        `📦 Converted product: ${product.name} to order item:`,
        orderItem
      );
      return orderItem;
    });

    console.log("✅ Final order items:", orderItems);
    return orderItems;
  };

  const handleAddressSubmit = (address: DeliveryAddress) => {
    handleCreateOrder(address);
  };

  const handleCreateOrder = async (deliveryAddress: DeliveryAddress) => {
    try {
      console.log("🔵 Starting order creation process...");
      setCurrentStep("processing");

      if (cartProducts.length === 0) {
        console.log("❌ Cart is empty");
        Alert.alert(
          "Carrito vacío",
          "No hay productos en el carrito para procesar."
        );
        setCurrentStep("address_form");
        onClose();
        return;
      }

      console.log("📦 Cart products:", cartProducts);
      const orderItems = convertCartToOrderItems(cartProducts);
      console.log("📝 Order items:", orderItems);

      const orderRequest: CreateOrderRequest = {
        items: orderItems,
        deliveryType: "home",
        deliveryAddress,
        paymentMethod: "becoins",
        notes: "Orden para envío a domicilio",
      };

      console.log("📋 Order request:", orderRequest);
      console.log("🔄 Calling createOrder...");

      // Usar requireAuth para proteger la creación de la orden
      await requireAuth(async () => {
        const newOrder = await createOrder(orderRequest);
        console.log("✅ Order created successfully:", newOrder);

        // Clear the cart after successful order creation
        clearCart();
        console.log("🧹 Cart cleared");

        // Close modal first, then show success alert
        onClose();

        // Show success message using CustomAlert after modal closes
        setTimeout(() => {
          console.log("🚀 About to show success CustomAlert...");
          showCustomAlert(
            "¡Orden creada exitosamente!",
            `Tu orden ${newOrder.id.slice(
              -8
            )} ha sido creada exitosamente.\n\n💰 Total: $${newOrder.total.toFixed(
              2
            )}`,
            "success"
          );
          console.log("✅ CustomAlert shown successfully");
        }, 300); // Small delay to ensure modal is fully closed
      });
    } catch (error) {
      console.error("❌ Error creating order:", error);

      setCurrentStep("address_form");
      Alert.alert(
        "Error",
        `No se pudo crear la orden: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
        [{ text: "OK" }]
      );
    }
  };

  const handleCancel = () => {
    setCurrentStep("address_form");
    onClose();
  };

  const handleAlertClose = () => {
    hideAlert();
    // Don't close modal here since it's already closed
  };

  const renderAddressForm = () => (
    <AddressForm
      onSubmit={handleAddressSubmit}
      onCancel={handleCancel}
      isLoading={currentStep === "processing"}
    />
  );

  const renderProcessing = () => (
    <View style={modalStyles.processingContainer}>
      <Text style={modalStyles.processingTitle}>Creando tu orden...</Text>
      <Text style={modalStyles.processingSubtitle}>
        Por favor espera un momento
      </Text>
      <TouchableOpacity style={modalStyles.cancelButton} onPress={handleCancel}>
        <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={modalStyles.modalOverlay}>
          <View
            style={[
              modalStyles.modalContent,
              currentStep === "address_form" && modalStyles.modalContentLarge,
            ]}
          >
            {currentStep === "address_form" && renderAddressForm()}
            {currentStep === "processing" && renderProcessing()}
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={handleAlertClose}
        primaryButton={{
          text: "Ver mis órdenes",
          onPress: () => {
            console.log("🎯 Ver mis órdenes pressed");
            hideAlert();
            // Use setTimeout to ensure alert closes before opening orders modal
            setTimeout(() => {
              if (onOrderCreated) {
                console.log("🔄 Calling onOrderCreated");
                onOrderCreated("latest-order");
              }
            }, 100);
          },
        }}
        secondaryButton={{
          text: "Seguir comprando",
          onPress: () => {
            console.log("🛒 Seguir comprando pressed");
            hideAlert();
          },
        }}
      />
    </>
  );
};
