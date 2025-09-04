import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useOrdersStoreAPI } from "../../stores/useOrdersStoreAPI";
import { OrderStatus } from "../../types/Order";
import { OrdersStackParamList } from "../../types/navigation";
import { colors } from "../../styles/colors";
import { orderDetailStyles } from "./styles";
import { FeedbackModal } from "./components/FeedbackModal";

type OrderDetailScreenNavigationProp = StackNavigationProp<
  OrdersStackParamList,
  "OrderDetail"
>;

type OrderDetailScreenRouteProp = RouteProp<
  OrdersStackParamList,
  "OrderDetail"
>;

const OrderDetailScreen: React.FC = () => {
  const navigation = useNavigation<OrderDetailScreenNavigationProp>();
  const route = useRoute<OrderDetailScreenRouteProp>();
  const { orderId } = route.params;
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const { getOrderById, updateOrderStatus, confirmReception } =
    useOrdersStoreAPI();
  const order = getOrderById(orderId);

  if (!order) {
    return (
      <SafeAreaView style={orderDetailStyles.container}>
        <View style={orderDetailStyles.errorContainer}>
          <View style={orderDetailStyles.errorIcon}>
            <MaterialCommunityIcons
              name="package-variant-closed"
              size={48}
              color={colors.textSecondary}
            />
          </View>
          <Text style={orderDetailStyles.errorTitle}>Orden no encontrada</Text>
          <Text style={orderDetailStyles.errorSubtitle}>
            La orden que buscas no existe o ha sido eliminada.
          </Text>
          <TouchableOpacity
            style={orderDetailStyles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color="white" />
            <Text style={orderDetailStyles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case "pending":
        return "#FF9500";
      case "confirmed":
        return "#007AFF";
      case "preparing":
        return "#34C759";
      case "shipped":
        return "#5856D6";
      case "delivered":
        return "#30B0C7";
      case "cancelled":
        return "#FF3B30";
      default:
        return "#8E8E93";
    }
  };

  const getStatusText = (status: OrderStatus): string => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "confirmed":
        return "Confirmada";
      case "preparing":
        return "Preparando";
      case "shipped":
        return "Enviada";
      case "delivered":
        return "Entregada";
      case "cancelled":
        return "Cancelada";
      default:
        return "Desconocido";
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "clock-outline";
      case "confirmed":
        return "check-circle-outline";
      case "preparing":
        return "package-variant";
      case "shipped":
        return "truck-delivery-outline";
      case "delivered":
        return "check-circle";
      case "cancelled":
        return "close-circle-outline";
      default:
        return "help-circle-outline";
    }
  };

  const getProgressPercentage = (status: OrderStatus): number => {
    switch (status) {
      case "pending":
        return 20;
      case "confirmed":
        return 40;
      case "preparing":
        return 60;
      case "shipped":
        return 80;
      case "delivered":
        return 100;
      case "cancelled":
        return 0;
      default:
        return 0;
    }
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Hoy";
    if (diffDays === 2) return "Ayer";
    if (diffDays <= 7) return `Hace ${diffDays - 1} días`;

    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  const handleCancelOrder = () => {
    if (order.status === "pending" || order.status === "confirmed") {
      Alert.alert(
        "Cancelar orden",
        "¿Estás seguro de que quieres cancelar esta orden? Esta acción no se puede deshacer.",
        [
          { text: "No", style: "cancel" },
          {
            text: "Sí, cancelar",
            style: "destructive",
            onPress: async () => {
              try {
                await updateOrderStatus(orderId, "cancelled");
                Alert.alert(
                  "Orden cancelada",
                  "Tu orden ha sido cancelada exitosamente."
                );
              } catch (error) {
                Alert.alert(
                  "Error",
                  "No se pudo cancelar la orden. Inténtalo de nuevo."
                );
              }
            },
          },
        ]
      );
    }
  };

  const handleConfirmReception = () => {
    Alert.alert(
      "Confirmar recepción",
      "¿Confirmas que has recibido tu orden correctamente?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, recibido",
          onPress: async () => {
            try {
              await updateOrderStatus(orderId, "delivered");
              Alert.alert(
                "¡Perfecto!",
                "Tu orden ha sido marcada como recibida. ¿Te gustaría calificar tu experiencia?",
                [
                  { text: "Ahora no", style: "cancel" },
                  {
                    text: "Calificar",
                    onPress: () => setShowFeedbackModal(true),
                  },
                ]
              );
            } catch (error) {
              Alert.alert(
                "Error",
                "No se pudo confirmar la recepción. Inténtalo de nuevo."
              );
            }
          },
        },
      ]
    );
  };

  const handleFeedbackSubmit = async (rating: number, feedback: string) => {
    try {
      // Aquí puedes agregar la lógica para enviar el feedback al backend
      // Por ahora solo mostramos un mensaje de éxito
      console.log("Feedback enviado:", { orderId, rating, feedback });

      // TODO: Implementar API call para enviar feedback
      // await orderService.submitFeedback(orderId, rating, feedback);

      return Promise.resolve();
    } catch (error) {
      throw new Error("No se pudo enviar el feedback");
    }
  };

  const canCancelOrder =
    order.status === "pending" || order.status === "confirmed";

  const canConfirmReception = order.status === "shipped";
  const canLeaveFeedback = order.status === "delivered";

  return (
    <SafeAreaView style={orderDetailStyles.container}>
      {/* Header naranja */}
      <View style={orderDetailStyles.headerContainer}>
        <View style={orderDetailStyles.headerRow}>
          <TouchableOpacity
            style={orderDetailStyles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <View style={orderDetailStyles.headerTitles}>
            <Text style={orderDetailStyles.headerTitle}>
              Detalle de la orden
            </Text>
            <Text style={orderDetailStyles.headerSubtitle}>
              Orden #{order.id.slice(-8)}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={orderDetailStyles.scrollView}
        contentContainerStyle={orderDetailStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Status Card */}
        <View style={orderDetailStyles.heroCard}>
          <View style={orderDetailStyles.heroHeader}>
            <View style={orderDetailStyles.heroInfo}>
              <Text style={orderDetailStyles.orderId}>
                #{order.id.slice(-8)}
              </Text>
              <Text style={orderDetailStyles.orderDate}>
                {formatDate(order.createdAt)}
              </Text>
            </View>
            <View style={orderDetailStyles.statusContainer}>
              <View
                style={[
                  orderDetailStyles.statusBadge,
                  { backgroundColor: getStatusColor(order.status) },
                ]}
              >
                <MaterialCommunityIcons
                  name={getStatusIcon(order.status)}
                  size={16}
                  color="white"
                />
                <Text style={orderDetailStyles.statusText}>
                  {getStatusText(order.status)}
                </Text>
              </View>
            </View>
          </View>

          {order.status !== "cancelled" && (
            <View style={orderDetailStyles.progressContainer}>
              <Text style={orderDetailStyles.progressLabel}>
                Progreso del pedido
              </Text>
              <View style={orderDetailStyles.progressTrack}>
                <View
                  style={[
                    orderDetailStyles.progressFill,
                    { width: `${getProgressPercentage(order.status)}%` },
                  ]}
                />
              </View>
            </View>
          )}
        </View>

        {/* Delivery Information */}
        <View style={orderDetailStyles.card}>
          <View style={orderDetailStyles.cardHeader}>
            <View style={orderDetailStyles.cardIcon}>
              <MaterialCommunityIcons
                name={
                  order.deliveryType === "home"
                    ? "truck-delivery"
                    : "account-group"
                }
                size={20}
                color={colors.belandOrange}
              />
            </View>
            <Text style={orderDetailStyles.cardTitle}>
              Información de entrega
            </Text>
          </View>

          <View style={orderDetailStyles.deliveryInfo}>
            <View style={orderDetailStyles.infoRow}>
              <MaterialCommunityIcons
                name={
                  order.deliveryType === "home"
                    ? "home-outline"
                    : "account-group-outline"
                }
                size={20}
                color={colors.textSecondary}
              />
              <Text style={orderDetailStyles.infoText}>
                {order.deliveryType === "home"
                  ? "Envío a domicilio"
                  : "Juntada circular"}
              </Text>
            </View>

            {order.deliveryAddress && (
              <View style={orderDetailStyles.addressContainer}>
                <Text style={orderDetailStyles.addressTitle}>
                  📍 Dirección de entrega
                </Text>
                <Text style={orderDetailStyles.addressText}>
                  {order.deliveryAddress.street}
                </Text>
                <Text style={orderDetailStyles.addressText}>
                  {order.deliveryAddress.city}, {order.deliveryAddress.state}
                </Text>
                <Text style={orderDetailStyles.addressText}>
                  CP: {order.deliveryAddress.zipCode}
                </Text>
                {order.deliveryAddress.additionalInfo && (
                  <Text style={orderDetailStyles.addressText}>
                    {order.deliveryAddress.additionalInfo}
                  </Text>
                )}
              </View>
            )}

            {order.groupId && (
              <View style={orderDetailStyles.infoRow}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={20}
                  color={colors.textSecondary}
                />
                <Text style={orderDetailStyles.infoText}>
                  Grupo: {order.groupId}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Order Items */}
        <View style={orderDetailStyles.card}>
          <View style={orderDetailStyles.cardHeader}>
            <View style={orderDetailStyles.cardIcon}>
              <MaterialCommunityIcons
                name="package-variant"
                size={20}
                color={colors.belandOrange}
              />
            </View>
            <Text style={orderDetailStyles.cardTitle}>
              Productos ({order.items.length})
            </Text>
          </View>

          <View style={orderDetailStyles.itemsList}>
            {order.items.map((item) => (
              <View key={item.id} style={orderDetailStyles.itemCard}>
                <Image
                  source={{ uri: item.image }}
                  style={orderDetailStyles.itemImage}
                  defaultSource={require("../../../assets/icon.png")}
                />
                <View style={orderDetailStyles.itemInfo}>
                  <Text style={orderDetailStyles.itemName}>{item.name}</Text>
                  <Text style={orderDetailStyles.itemPrice}>
                    {formatCurrency(item.price)} c/u
                  </Text>
                </View>
                <View style={orderDetailStyles.itemQuantity}>
                  <View style={orderDetailStyles.quantityBadge}>
                    <Text style={orderDetailStyles.quantityText}>
                      x{item.quantity}
                    </Text>
                  </View>
                  <Text style={orderDetailStyles.subtotalText}>
                    {formatCurrency(item.subtotal)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Order Summary */}
        <View style={orderDetailStyles.card}>
          <View style={orderDetailStyles.cardHeader}>
            <View style={orderDetailStyles.cardIcon}>
              <MaterialCommunityIcons
                name="calculator"
                size={20}
                color={colors.belandOrange}
              />
            </View>
            <Text style={orderDetailStyles.cardTitle}>Resumen del pedido</Text>
          </View>

          <View style={orderDetailStyles.summary}>
            <View style={orderDetailStyles.summaryRow}>
              <Text style={orderDetailStyles.summaryLabel}>Subtotal:</Text>
              <Text style={orderDetailStyles.summaryValue}>
                {formatCurrency(order.subtotal)}
              </Text>
            </View>
            {order.deliveryFee > 0 && (
              <View style={orderDetailStyles.summaryRow}>
                <Text style={orderDetailStyles.summaryLabel}>Envío:</Text>
                <Text style={orderDetailStyles.summaryValue}>
                  {formatCurrency(order.deliveryFee)}
                </Text>
              </View>
            )}
            {order.discount > 0 && (
              <View style={orderDetailStyles.summaryRow}>
                <Text style={orderDetailStyles.summaryLabel}>Descuento:</Text>
                <Text
                  style={[
                    orderDetailStyles.summaryValue,
                    orderDetailStyles.discountText,
                  ]}
                >
                  -{formatCurrency(order.discount)}
                </Text>
              </View>
            )}
            <View style={orderDetailStyles.totalRow}>
              <View style={orderDetailStyles.summaryRow}>
                <Text style={orderDetailStyles.totalLabel}>Total:</Text>
                <Text style={orderDetailStyles.totalValue}>
                  {formatCurrency(order.total)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notes */}
        {order.notes && (
          <View style={orderDetailStyles.card}>
            <View style={orderDetailStyles.cardHeader}>
              <View style={orderDetailStyles.cardIcon}>
                <MaterialCommunityIcons
                  name="note-text"
                  size={20}
                  color={colors.belandOrange}
                />
              </View>
              <Text style={orderDetailStyles.cardTitle}>Notas especiales</Text>
            </View>
            <View style={orderDetailStyles.notesContainer}>
              <Text style={orderDetailStyles.notesText}>{order.notes}</Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={orderDetailStyles.actions}>
          {canCancelOrder && (
            <TouchableOpacity
              style={orderDetailStyles.cancelButton}
              onPress={handleCancelOrder}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={20}
                color="white"
              />
              <Text style={orderDetailStyles.cancelButtonText}>
                Cancelar orden
              </Text>
            </TouchableOpacity>
          )}

          {canConfirmReception && (
            <TouchableOpacity
              style={orderDetailStyles.confirmButton}
              onPress={handleConfirmReception}
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color="white"
              />
              <Text style={orderDetailStyles.confirmButtonText}>
                Confirmar recepción
              </Text>
            </TouchableOpacity>
          )}

          {canLeaveFeedback && (
            <TouchableOpacity
              style={orderDetailStyles.feedbackButton}
              onPress={() => setShowFeedbackModal(true)}
            >
              <MaterialCommunityIcons
                name="star"
                size={20}
                color={colors.belandOrange}
              />
              <Text style={orderDetailStyles.feedbackButtonText}>
                Calificar experiencia
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Feedback Modal */}
      <FeedbackModal
        visible={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleFeedbackSubmit}
        orderId={orderId}
      />
    </SafeAreaView>
  );
};

export default OrderDetailScreen;
