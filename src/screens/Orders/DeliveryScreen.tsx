import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  RefreshControl,
  Modal,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useOrders } from "../../hooks/useOrdersAPI";
import { Order } from "../../types/Order";
import { colors } from "../../styles/colors";
import { deliveryStyles } from "./styles/deliveryStyles";

export const DeliveryScreen = () => {
  const navigation = useNavigation();
  const { orders, loading, loadPendingOrders, confirmDelivery } = useOrders();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState("");

  // Cargar órdenes pendientes al montar
  useEffect(() => {
    loadPendingOrders();
  }, [loadPendingOrders]);

  // Filtrar órdenes por búsqueda
  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(query) ||
      order.deliveryAddress?.street.toLowerCase().includes(query) ||
      order.deliveryAddress?.city.toLowerCase().includes(query)
    );
  });

  // Solo mostrar órdenes listas para entrega
  const deliverableOrders = filteredOrders.filter((order) =>
    ["ready", "shipped"].includes(order.status)
  );

  const handleOrderPress = (order: Order) => {
    setSelectedOrder(order);
    setShowConfirmModal(true);
  };

  const handleConfirmDelivery = async () => {
    if (!selectedOrder) return;

    try {
      await confirmDelivery(selectedOrder.id, deliveryNotes);

      Alert.alert(
        "✅ Entrega confirmada",
        `La orden ${selectedOrder.id.slice(
          -8
        )} ha sido marcada como entregada.`,
        [{ text: "OK" }]
      );

      // Cerrar modal y limpiar
      setShowConfirmModal(false);
      setSelectedOrder(null);
      setDeliveryNotes("");

      // Recargar órdenes
      loadPendingOrders();
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo confirmar la entrega. Inténtalo de nuevo."
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "#34C759";
      case "shipped":
        return "#FF9500";
      default:
        return "#8E8E93";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ready":
        return "Listo para entrega";
      case "shipped":
        return "En camino";
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatAddress = (order: Order) => {
    if (!order.deliveryAddress) return "Sin dirección";

    const { street, city, state } = order.deliveryAddress;
    return `${street}, ${city}${state ? `, ${state}` : ""}`;
  };

  const renderOrderCard = (order: Order) => (
    <TouchableOpacity
      key={order.id}
      style={deliveryStyles.orderCard}
      onPress={() => handleOrderPress(order)}
      activeOpacity={0.7}
    >
      <View style={deliveryStyles.orderHeader}>
        <View style={deliveryStyles.orderInfo}>
          <Text style={deliveryStyles.orderId}>#{order.id.slice(-8)}</Text>
          <Text style={deliveryStyles.orderDate}>
            {new Date(order.createdAt).toLocaleDateString("es-ES")}
          </Text>
        </View>
        <View
          style={[
            deliveryStyles.statusBadge,
            { backgroundColor: getStatusColor(order.status) },
          ]}
        >
          <Text style={deliveryStyles.statusText}>
            {getStatusText(order.status)}
          </Text>
        </View>
      </View>

      <View style={deliveryStyles.orderDetails}>
        <View style={deliveryStyles.detailRow}>
          <MaterialCommunityIcons
            name="map-marker"
            size={16}
            color={colors.textSecondary}
          />
          <Text style={deliveryStyles.detailText} numberOfLines={2}>
            {formatAddress(order)}
          </Text>
        </View>

        <View style={deliveryStyles.detailRow}>
          <MaterialCommunityIcons
            name="package-variant"
            size={16}
            color={colors.textSecondary}
          />
          <Text style={deliveryStyles.detailText}>
            {order.items.length} producto{order.items.length !== 1 ? "s" : ""}
          </Text>
        </View>

        <View style={deliveryStyles.detailRow}>
          <MaterialCommunityIcons
            name="cash"
            size={16}
            color={colors.textSecondary}
          />
          <Text style={deliveryStyles.detailText}>
            {formatCurrency(order.total)}
          </Text>
        </View>
      </View>

      <View style={deliveryStyles.orderFooter}>
        <MaterialCommunityIcons
          name="truck-delivery"
          size={20}
          color={colors.belandOrange}
        />
        <Text style={deliveryStyles.deliverButtonText}>Confirmar entrega</Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={colors.belandOrange}
        />
      </View>
    </TouchableOpacity>
  );

  const renderConfirmModal = () => (
    <Modal
      visible={showConfirmModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowConfirmModal(false)}
    >
      <View style={deliveryStyles.modalOverlay}>
        <View style={deliveryStyles.modalContent}>
          <Text style={deliveryStyles.modalTitle}>Confirmar entrega</Text>

          {selectedOrder && (
            <View style={deliveryStyles.orderSummary}>
              <Text style={deliveryStyles.summaryTitle}>
                Orden #{selectedOrder.id.slice(-8)}
              </Text>

              <View style={deliveryStyles.summaryRow}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={deliveryStyles.summaryText}>
                  {formatAddress(selectedOrder)}
                </Text>
              </View>

              <View style={deliveryStyles.summaryRow}>
                <MaterialCommunityIcons
                  name="cash"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={deliveryStyles.summaryText}>
                  Total: {formatCurrency(selectedOrder.total)}
                </Text>
              </View>
            </View>
          )}

          <Text style={deliveryStyles.inputLabel}>
            Notas de entrega (opcional):
          </Text>
          <TextInput
            style={deliveryStyles.textInput}
            value={deliveryNotes}
            onChangeText={setDeliveryNotes}
            placeholder="Ej: Entregado en portería, recibido por..."
            multiline
            numberOfLines={3}
          />

          <View style={deliveryStyles.modalButtons}>
            <TouchableOpacity
              style={deliveryStyles.cancelButton}
              onPress={() => {
                setShowConfirmModal(false);
                setSelectedOrder(null);
                setDeliveryNotes("");
              }}
            >
              <Text style={deliveryStyles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={deliveryStyles.confirmButton}
              onPress={handleConfirmDelivery}
            >
              <MaterialCommunityIcons name="check" size={20} color="white" />
              <Text style={deliveryStyles.confirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={deliveryStyles.container}>
      {/* Header */}
      <View style={deliveryStyles.header}>
        <View style={deliveryStyles.headerContent}>
          <TouchableOpacity
            style={deliveryStyles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>

          <View style={deliveryStyles.headerTitles}>
            <Text style={deliveryStyles.headerTitle}>Delivery</Text>
            <Text style={deliveryStyles.headerSubtitle}>
              Órdenes listas para entrega
            </Text>
          </View>

          <View style={deliveryStyles.headerStats}>
            <Text style={deliveryStyles.statsNumber}>
              {deliverableOrders.length}
            </Text>
            <Text style={deliveryStyles.statsLabel}>Pendientes</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={deliveryStyles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={colors.textSecondary}
          />
          <TextInput
            style={deliveryStyles.searchInput}
            placeholder="Buscar por ID de orden o dirección..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialCommunityIcons
                name="close"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={deliveryStyles.scrollView}
        contentContainerStyle={deliveryStyles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadPendingOrders}
            colors={[colors.belandOrange]}
            tintColor={colors.belandOrange}
          />
        }
      >
        {deliverableOrders.length === 0 ? (
          <View style={deliveryStyles.emptyState}>
            <MaterialCommunityIcons
              name="truck-delivery-outline"
              size={80}
              color={colors.textSecondary}
            />
            <Text style={deliveryStyles.emptyTitle}>
              {searchQuery
                ? "No se encontraron órdenes"
                : "No hay entregas pendientes"}
            </Text>
            <Text style={deliveryStyles.emptySubtitle}>
              {searchQuery
                ? "Intenta con otra búsqueda"
                : "Las órdenes listas para entrega aparecerán aquí"}
            </Text>
          </View>
        ) : (
          deliverableOrders.map(renderOrderCard)
        )}
      </ScrollView>

      {renderConfirmModal()}
    </SafeAreaView>
  );
};
