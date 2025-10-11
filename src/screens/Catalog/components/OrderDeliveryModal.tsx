import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../../styles/colors";
import { modalStyles } from "../styles";
import { AddressForm } from "./AddressForm";
import {
  addressService,
  CreateAddressRequest,
} from "../../../services/addressService";
import { CartService } from "@services/core";
import { apiRequest } from "../../../services/api";
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
  const [userAddresses, setUserAddresses] = React.useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = React.useState(false);
  const [addingNewAddress, setAddingNewAddress] = React.useState(false);
  const { showAlert, alertConfig, showCustomAlert, hideAlert } =
    useCustomAlert();
  const { requireAuth } = useAuth();

  // Cargar direcciones de usuario cuando el modal se abre
  React.useEffect(() => {
    if (!visible) return;
    (async () => {
      setLoadingAddresses(true);
      try {
        const list = await addressService.getUserAddresses();
        setUserAddresses(list || []);
      } catch (e) {
        // failed to load user addresses
        setUserAddresses([]);
        setUserAddresses([]);
      } finally {
        setLoadingAddresses(false);
      }
    })();
  }, [visible]);

  React.useEffect(() => {
    if (!visible) {
      setCurrentStep("address_form");
    }
  }, [visible]);

  const convertCartToOrderItems = (
    cartProducts: CartProduct[]
  ): OrderItem[] => {
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

      return orderItem;
    });

    return orderItems;
  };

  const handleAddressSubmit = (address: DeliveryAddress) => {
    if (addingNewAddress) {
      (async () => {
        try {
          const payload: CreateAddressRequest = {
            addressLine1: address.street,
            addressLine2: address.additionalInfo || undefined,
            city: address.city,
            state: address.state || undefined,
            country: address.country,
            postalCode: address.zipCode || undefined,
            latitude: address.latitude,
            longitude: address.longitude,
            isDefault: true,
          };

          const created = await addressService.createAddress(payload);

          setUserAddresses((prev) => [created, ...prev]);

          const toOrderAddress: DeliveryAddress = {
            street: created.addressLine1,
            city: created.city,
            state: created.state || "",
            zipCode: created.postalCode || "",
            country: created.country,
            additionalInfo: created.addressLine2 || "",
            latitude: created.latitude,
            longitude: created.longitude,
          };

          // Si el formulario incluía phone, preservarlo
          if ((address as any).phone)
            (toOrderAddress as any).phone = (address as any).phone;

          setAddingNewAddress(false);
          // Pasar el id de la dirección creada para actualizar el carrito antes de crear la orden
          handleCreateOrder(toOrderAddress, created.id);
        } catch (e: any) {
          console.error("Error creando dirección de usuario:", e);
          Alert.alert(
            "Error",
            "No se pudo guardar la dirección. Intenta de nuevo."
          );
        }
      })();
      return;
    }

    // Si no estamos en modo 'agregar nueva', crear la orden directamente
    handleCreateOrder(address);
  };

  const handleCreateOrder = async (
    deliveryAddress: DeliveryAddress,
    addressId?: string
  ) => {
    try {
      setCurrentStep("processing");

      if (cartProducts.length === 0) {
        Alert.alert(
          "Carrito vacío",
          "No hay productos en el carrito para procesar."
        );
        setCurrentStep("address_form");
        onClose();
        return;
      }

      const orderItems = convertCartToOrderItems(cartProducts);

      const orderRequest: CreateOrderRequest = {
        items: orderItems,
        deliveryType: "home",
        deliveryAddress,
        paymentMethod: "becoins",
        notes: "Orden para envío a domicilio",
      };

      if (addressId) {
        try {
          const cart = await CartService.getCart();
          const cartId = cart.id;

          await apiRequest(`/carts/address/${cartId}?address_id=${addressId}`, {
            method: "PUT",
          });
        } catch (e) {
          console.error("❌ Failed to update cart with address:", e);
          Alert.alert(
            "Error",
            "No se pudo actualizar el carrito con la dirección seleccionada. Intenta de nuevo."
          );
          setCurrentStep("address_form");
          return;
        }
      }

      // Usar requireAuth para proteger la creación de la orden
      await requireAuth(async () => {
        let newOrder = await createOrder(orderRequest);

        try {
          const hasDelivery =
            newOrder &&
            ((newOrder as any).deliveryAddress ||
              (newOrder as any).delivery_address);

          const shouldForceAttach =
            !!(newOrder as any).__get_failed || !hasDelivery;

          if (shouldForceAttach) {
            let fallbackAddress: any = undefined;
            if (addressId) {
              fallbackAddress = userAddresses.find((a) => a.id === addressId);
            }

            if (!fallbackAddress && deliveryAddress) {
              fallbackAddress = {
                addressLine1: deliveryAddress.street,
                addressLine2: deliveryAddress.additionalInfo || "",
                city: deliveryAddress.city,
                state: (deliveryAddress as any).state || "",
                postalCode: (deliveryAddress as any).zipCode || "",
                country: deliveryAddress.country,
                latitude: (deliveryAddress as any).latitude,
                longitude: (deliveryAddress as any).longitude,
                phone: (deliveryAddress as any).phone || undefined,
              };
            }

            if (!fallbackAddress && (orderRequest as any).deliveryAddress) {
              const od = (orderRequest as any).deliveryAddress;
              fallbackAddress = {
                addressLine1: od.street,
                addressLine2: od.additionalInfo || "",
                city: od.city,
                state: od.state || "",
                postalCode: od.zipCode || "",
                country: od.country,
                latitude: od.latitude,
                longitude: od.longitude,
                phone: od.phone || undefined,
              };
            }

            if (fallbackAddress) {
              const normalized = {
                street:
                  fallbackAddress.addressLine1 ||
                  fallbackAddress.address_line_1 ||
                  fallbackAddress.street ||
                  "",
                additionalInfo:
                  fallbackAddress.addressLine2 ||
                  fallbackAddress.address_line_2 ||
                  fallbackAddress.additionalInfo ||
                  "",
                city: fallbackAddress.city || fallbackAddress.town || "",
                state: fallbackAddress.state || fallbackAddress.province || "",
                zipCode:
                  fallbackAddress.postalCode ||
                  fallbackAddress.postal_code ||
                  fallbackAddress.zip ||
                  "",
                country: fallbackAddress.country || "",
                latitude: fallbackAddress.latitude,
                longitude: fallbackAddress.longitude,
                phone: fallbackAddress.phone,
              };

              const patched: any = { ...(newOrder as any) };
              patched.deliveryAddress = normalized;
              patched.delivery_address = normalized;
              try {
                patched.__attached_fallback = true;
              } catch (e) {}
              newOrder = patched as any;
            }
          }
        } catch (attachErr) {
          console.error(
            "[OrderDeliveryModal] Failed to attach fallback deliveryAddress:",
            attachErr
          );
        }

        clearCart();

        onClose();

        setTimeout(() => {
          showCustomAlert(
            "¡Orden creada exitosamente!",
            `Tu orden ${newOrder.id.slice(
              -8
            )} ha sido creada exitosamente.\n\n💰 Total: $${newOrder.total.toFixed(
              2
            )}`,
            "success"
          );
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
  };

  const renderAddressForm = () => (
    <AddressForm
      onSubmit={handleAddressSubmit}
      onCancel={() => {
        setAddingNewAddress(false);
      }}
      isLoading={currentStep === "processing"}
    />
  );

  const renderAddressCards = () => {
    if (loadingAddresses) {
      return (
        <View style={{ padding: 20 }}>
          <ActivityIndicator color={colors.belandOrange} />
        </View>
      );
    }

    return (
      <View>
        <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#333" }}>
            Selecciona una dirección
          </Text>
        </View>

        {userAddresses.length === 0 ? (
          <View style={{ padding: 20 }}>
            <Text style={{ color: "#666" }}>
              No tienes direcciones guardadas. Puedes agregar una nueva.
            </Text>
          </View>
        ) : (
          userAddresses.map((a, idx) => {
            const primary =
              a.addressLine1 || a.address_line_1 || a.street || a.address || "";
            const secondary =
              a.addressLine2 || a.address_line_2 || a.additionalInfo || "";
            const alias = a.alias || a.label || a.name || "";
            const city = a.city || a.town || "";
            const state = a.state || a.province || "";
            const postal = a.postalCode || a.postal_code || a.zip || "";

            let line1 = "";
            if (alias) line1 = alias;
            else if (primary) line1 = primary;
            else {
              const parts = [secondary, city, state, postal].filter(Boolean);
              line1 = parts.join(", ");
            }

            if (!line1) {
              const compact = [a.id, a.user_id, a.address, a.alias]
                .filter(Boolean)
                .join(" • ");
              line1 = compact || "(sin dirección)";
            }

            return (
              <View
                key={a.id || `${a.user_id || "addr"}-${idx}`}
                style={{
                  backgroundColor: "white",
                  marginHorizontal: 12,
                  marginBottom: 12,
                  borderRadius: 10,
                  padding: 12,
                  elevation: 2,
                }}
              >
                <Text style={{ fontWeight: "700" }}>{line1}</Text>
                {secondary ? (
                  <Text style={{ color: "#666" }}>{secondary}</Text>
                ) : null}
                <Text style={{ color: "#666", marginTop: 6 }}>
                  {city}
                  {state ? `, ${state}` : ""}
                  {postal ? ` • ${postal}` : ""}
                </Text>

                <View style={{ flexDirection: "row", marginTop: 8, gap: 8 }}>
                  <TouchableOpacity
                    style={[modalStyles.cancelButton, { flex: 1 }]}
                    onPress={() => {
                      const toOrderAddress: DeliveryAddress = {
                        street: a.addressLine1,
                        city: a.city,
                        state: a.state || "",
                        zipCode: a.postalCode || "",
                        country: a.country,
                        additionalInfo: a.addressLine2 || "",
                        latitude: a.latitude,
                        longitude: a.longitude,
                      };
                      // Pasar el id de la dirección para que se actualice el carrito antes de crear la orden
                      handleCreateOrder(toOrderAddress, a.id);
                    }}
                  >
                    <Text style={modalStyles.cancelButtonText}>Usar esta</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        <View style={{ padding: 12 }}>
          <TouchableOpacity
            style={modalStyles.continueGroupButton}
            onPress={() => setAddingNewAddress(true)}
          >
            <Text style={modalStyles.continueGroupButtonText}>
              Agregar nueva dirección
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderProcessing = () => (
    <View style={modalStyles.processingContainer}>
      <View style={modalStyles.processingCard}>
        <View style={modalStyles.processingIcon}>
          <MaterialCommunityIcons
            name="truck-check"
            size={36}
            color={colors.belandOrange}
          />
        </View>
        <ActivityIndicator
          size="large"
          color={colors.belandOrange}
          style={{ marginVertical: 12 }}
        />
        <Text style={modalStyles.processingTitle}>Creando tu orden...</Text>
        <Text style={modalStyles.processingSubtitle}>
          Por favor espera un momento
        </Text>

        <Text style={modalStyles.processingDetailText}>
          {cartProducts.length} artículo{cartProducts.length !== 1 ? "s" : ""} •
          Total: $
          {cartProducts
            .reduce((s, p) => s + p.price * p.quantity, 0)
            .toFixed(2)}
        </Text>

        <TouchableOpacity
          style={[modalStyles.cancelButton, modalStyles.processingCancelButton]}
          onPress={handleCancel}
        >
          <Text
            style={[
              modalStyles.cancelButtonText,
              modalStyles.processingCancelButtonText,
            ]}
          >
            Cancelar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      {Platform.OS === "web" ? (
        <>
          {visible &&
            (currentStep === "address_form" ? (
              addingNewAddress ? (
                renderAddressForm()
              ) : (
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.45)",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000,
                  }}
                >
                  <View
                    style={[
                      modalStyles.modalContent,
                      modalStyles.modalContentLarge,
                      { maxWidth: 900, width: "80%" },
                    ]}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                      }}
                    >
                      <TouchableOpacity
                        onPress={handleCancel}
                        style={{ padding: 6 }}
                      >
                        <Text
                          style={{ fontSize: 18, color: colors.textSecondary }}
                        >
                          ×
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {renderAddressCards()}
                  </View>
                </View>
              )
            ) : (
              // Simple processing overlay for web
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.45)",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 1000,
                }}
              >
                <View
                  style={[
                    modalStyles.modalContent,
                    modalStyles.modalContentLarge,
                    { maxWidth: 720 },
                  ]}
                >
                  {renderProcessing()}
                </View>
              </View>
            ))}
        </>
      ) : (
        // Native: keep using Modal
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
              {currentStep === "address_form" &&
                (addingNewAddress ? renderAddressForm() : renderAddressCards())}
              {currentStep === "processing" && renderProcessing()}
            </View>
          </View>
        </Modal>
      )}

      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={handleAlertClose}
        primaryButton={{
          text: "Ver mis órdenes",
          onPress: () => {
            hideAlert();
            // Use setTimeout to ensure alert closes before opening orders modal
            setTimeout(() => {
              if (onOrderCreated) {
                onOrderCreated("latest-order");
              }
            }, 100);
          },
        }}
        secondaryButton={{
          text: "Seguir comprando",
          onPress: () => {
            hideAlert();
          },
        }}
      />
    </>
  );
};
