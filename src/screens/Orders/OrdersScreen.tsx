import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Dimensions,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useOrdersStore } from "../../stores/useOrdersStore";
import { Order, OrderStatus } from "../../types/Order";
import { OrdersStackParamList } from "../../types/navigation";
import { colors } from "../../styles/colors";
import { ordersStyles } from "./styles";

type OrdersScreenNavigationProp = StackNavigationProp<
  OrdersStackParamList,
  "OrdersList"
>;

const { width } = Dimensions.get("window");

const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<OrdersScreenNavigationProp>();
  const { orders, isLoading, getOrderSummary } = useOrdersStore();
  const [selectedFilter, setSelectedFilter] = useState<OrderStatus | "all">(
    "all"
  );

  const orderSummary = getOrderSummary();

  const handleRefresh = async () => {
    // Since we don't have refreshOrders method, we can just log for now
    console.log("Refreshing orders...");
  };

  const filteredOrders = useMemo(() => {
    const sorted = [...orders].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (selectedFilter === "all") return sorted;
    return sorted.filter((order) => order.status === selectedFilter);
  }, [orders, selectedFilter]);

  const filterOptions = [
    { label: "Todas", value: "all" as const, count: orders.length },
    {
      label: "Pendientes",
      value: "pending" as const,
      count: orders.filter((o) => o.status === "pending").length,
    },
    {
      label: "Entregadas",
      value: "delivered" as const,
      count: orders.filter((o) => o.status === "delivered").length,
    },
    {
      label: "Canceladas",
      value: "cancelled" as const,
      count: orders.filter((o) => o.status === "cancelled").length,
    },
  ];

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
        return "clock-outline" as const;
      case "confirmed":
        return "check-circle-outline" as const;
      case "preparing":
        return "package-variant" as const;
      case "shipped":
        return "truck-delivery-outline" as const;
      case "delivered":
        return "check-circle" as const;
      case "cancelled":
        return "close-circle-outline" as const;
      default:
        return "help-circle-outline" as const;
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
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  const handleOrderPress = (order: Order) => {
    navigation.navigate("OrderDetail", { orderId: order.id });
  };

  const renderSummaryCard = () => (
    <View style={ordersStyles.summaryCard}>
      <View style={ordersStyles.summaryHeader}>
        <MaterialCommunityIcons
          name="chart-line"
          size={24}
          color={colors.belandOrange}
        />
        <Text style={ordersStyles.summaryTitle}>Resumen de órdenes</Text>
      </View>
      <View style={ordersStyles.summaryGrid}>
        <View style={ordersStyles.summaryItem}>
          <Text style={ordersStyles.summaryNumber}>
            {orderSummary.totalOrders}
          </Text>
          <Text style={ordersStyles.summaryLabel}>Total</Text>
        </View>
        <View style={ordersStyles.summaryDivider} />
        <View style={ordersStyles.summaryItem}>
          <Text style={ordersStyles.summaryNumber}>
            {orderSummary.pendingOrders}
          </Text>
          <Text style={ordersStyles.summaryLabel}>Pendientes</Text>
        </View>
        <View style={ordersStyles.summaryDivider} />
        <View style={ordersStyles.summaryItem}>
          <Text style={ordersStyles.summaryNumber}>
            {formatCurrency(orderSummary.totalSpent)}
          </Text>
          <Text style={ordersStyles.summaryLabel}>Gastado</Text>
        </View>
      </View>
    </View>
  );

  const renderFilterTabs = () => (
    <View style={ordersStyles.filterContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={ordersStyles.filterScrollContent}
      >
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              ordersStyles.filterTab,
              selectedFilter === option.value && ordersStyles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter(option.value)}
          >
            <Text
              style={[
                ordersStyles.filterTabText,
                selectedFilter === option.value &&
                  ordersStyles.filterTabTextActive,
              ]}
            >
              {option.label}
            </Text>
            {option.count > 0 && (
              <View
                style={[
                  ordersStyles.filterBadge,
                  selectedFilter === option.value &&
                    ordersStyles.filterBadgeActive,
                ]}
              >
                <Text
                  style={[
                    ordersStyles.filterBadgeText,
                    selectedFilter === option.value &&
                      ordersStyles.filterBadgeTextActive,
                  ]}
                >
                  {option.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderOrderCard = (order: Order) => (
    <TouchableOpacity
      key={order.id}
      style={ordersStyles.orderCard}
      onPress={() => handleOrderPress(order)}
    >
      <View style={ordersStyles.orderCardHeader}>
        <View style={ordersStyles.orderMainInfo}>
          <View style={ordersStyles.orderIdRow}>
            <Text style={ordersStyles.orderId}>#{order.id.slice(-8)}</Text>
            <View
              style={[
                ordersStyles.statusIndicator,
                { backgroundColor: getStatusColor(order.status) },
              ]}
            >
              <MaterialCommunityIcons
                name={getStatusIcon(order.status)}
                size={12}
                color="white"
              />
            </View>
          </View>
          <Text style={ordersStyles.orderDate}>
            {formatDate(order.createdAt)}
          </Text>
        </View>
        <View style={ordersStyles.orderPrice}>
          <Text style={ordersStyles.orderAmount}>
            {formatCurrency(order.total)}
          </Text>
          <Text style={ordersStyles.orderItemCount}>
            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      <View style={ordersStyles.orderDetails}>
        <View style={ordersStyles.orderDetailRow}>
          <MaterialCommunityIcons
            name={
              order.deliveryType === "home"
                ? "home-outline"
                : "account-group-outline"
            }
            size={16}
            color={colors.textSecondary}
          />
          <Text style={ordersStyles.orderDetailText}>
            {order.deliveryType === "home"
              ? "Envío a domicilio"
              : "Juntada circular"}
          </Text>
        </View>
        <View
          style={[
            ordersStyles.statusBadge,
            { backgroundColor: getStatusColor(order.status) + "20" },
          ]}
        >
          <Text
            style={[
              ordersStyles.statusBadgeText,
              { color: getStatusColor(order.status) },
            ]}
          >
            {getStatusText(order.status)}
          </Text>
        </View>
      </View>

      <View style={ordersStyles.orderFooter}>
        <View style={ordersStyles.orderProgress}>
          <View
            style={[
              ordersStyles.progressBar,
              {
                width:
                  order.status === "delivered"
                    ? "100%"
                    : order.status === "shipped"
                    ? "75%"
                    : order.status === "preparing"
                    ? "50%"
                    : order.status === "confirmed"
                    ? "25%"
                    : "10%",
              },
            ]}
          />
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={colors.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={ordersStyles.container}>
      <View style={ordersStyles.headerContainer}>
        <View style={ordersStyles.headerRow}>
          <View style={ordersStyles.headerTitles}>
            <Text style={ordersStyles.headerMainTitle}>Mis Órdenes</Text>
            <Text style={ordersStyles.headerSubtitle}>
              Gestiona y revisa tus compras
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={ordersStyles.scrollView}
        contentContainerStyle={ordersStyles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[colors.belandOrange]}
            tintColor={colors.belandOrange}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {orders.length > 0 && renderSummaryCard()}

        {orders.length > 0 && renderFilterTabs()}

        {filteredOrders.length === 0 ? (
          <View style={ordersStyles.emptyState}>
            <MaterialCommunityIcons
              name="package-variant-closed"
              size={80}
              color={colors.textSecondary}
            />
            <Text style={ordersStyles.emptyTitle}>
              {selectedFilter === "all"
                ? "No tienes órdenes aún"
                : `No hay órdenes ${filterOptions
                    .find((f) => f.value === selectedFilter)
                    ?.label.toLowerCase()}`}
            </Text>
            <Text style={ordersStyles.emptySubtitle}>
              {selectedFilter === "all"
                ? "Cuando realices tu primera compra, aparecerá aquí"
                : "Prueba cambiando el filtro o realiza una nueva compra"}
            </Text>
            {selectedFilter === "all" && (
              <TouchableOpacity
                style={ordersStyles.shopButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={ordersStyles.shopButtonText}>Ir al catálogo</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={ordersStyles.ordersList}>
            {filteredOrders.map(renderOrderCard)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrdersScreen;
