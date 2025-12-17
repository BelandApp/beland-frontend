import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useOrdersStoreAPI } from "../../stores/useOrdersStoreAPI";
import { Order, OrderStatus } from "../../types/Order";
import { colors } from "../../styles/colors";
import { ordersStyles } from "./styles";
import { useAuth } from "src/context";
import { ThemedHeader } from "src/components/shared/headers/Header";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { useOrderStatusSocket } from "src/hooks/useOrderStatusSocket";

const OrdersScreen: React.FC = () => {
  const { navigate, goBack } = useCustomNavigation();

  const {
    orders,
    isLoading,
    getOrderSummary,
    loadUserOrders,
    totalOrders,
    orderCounts,
  } = useOrdersStoreAPI();
  const [selectedFilter, setSelectedFilter] = useState<OrderStatus | "all">(
    "all"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ordersPerPage = 5;
  const { canPerformAction, requireAuth } = useAuth();

  // Escuchar actualizaciones de estado en tiempo real
  useOrderStatusSocket();

  // Resetear a la página 1 cuando cambia el filtro
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [selectedFilter]);

  // Load orders when component mounts, page changes, or filter changes
  useEffect(() => {
    const loadOrders = async () => {
      try {
        await requireAuth(async () => {
          // Si hay un filtro activo (no "all"), cargar todas las órdenes para filtrar correctamente
          // Si no hay filtro, usar paginación normal
          const limit = selectedFilter === "all" ? ordersPerPage : 1000;
          const page = selectedFilter === "all" ? currentPage : 1;

          const result = await loadUserOrders(page, limit);
          // Si recibimos menos órdenes de las solicitadas, no hay más páginas
          setHasMore(result && result.length === limit);
        });
      } catch (error) {
        // Error ya manejado por requireAuth
        console.log("Authentication required for loading orders");
      }
    };

    loadOrders();
  }, [currentPage, selectedFilter, loadUserOrders, requireAuth]);

  const orderSummary = getOrderSummary();

  const handleRefresh = async () => {
    // Usar requireAuth para proteger la carga de órdenes
    try {
      setCurrentPage(1);
      await requireAuth(async () => {
        // Use real API to refresh orders
        const result = await loadUserOrders(1, ordersPerPage);
        setHasMore(result && result.length === ordersPerPage);
      });
    } catch (error) {
      // Error ya manejado por requireAuth
      console.log("Authentication required for loading orders");
    }
  };

  // Mostrar las órdenes de la página actual filtradas y ordenadas por fecha
  const displayedOrders = useMemo(() => {
    const sorted = [...orders].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Aplicar filtro local
    let filtered =
      selectedFilter === "all"
        ? sorted
        : sorted.filter((order) => order.status === selectedFilter);

    // Si hay filtro activo, aplicar paginación local
    if (selectedFilter !== "all") {
      const startIndex = (currentPage - 1) * ordersPerPage;
      const endIndex = startIndex + ordersPerPage;
      return filtered.slice(startIndex, endIndex);
    }

    return filtered;
  }, [orders, selectedFilter, currentPage]);

  // Calcular si hay más páginas para filtros activos
  const totalFilteredOrders = useMemo(() => {
    if (selectedFilter === "all") return totalOrders;
    return orders.filter((order) => order.status === selectedFilter).length;
  }, [selectedFilter, orders, totalOrders]);

  const actualHasMore = useMemo(() => {
    if (selectedFilter === "all") return hasMore;
    return currentPage * ordersPerPage < totalFilteredOrders;
  }, [selectedFilter, hasMore, currentPage, totalFilteredOrders]);

  const filterOptions = [
    { label: "Todas", value: "all" as const, count: totalOrders },
    {
      label: "Pendientes",
      value: "pending" as const,
      count: orderCounts.pending,
    },
    {
      label: "Entregadas",
      value: "delivered" as const,
      count: orderCounts.delivered,
    },
    {
      label: "Canceladas",
      value: "cancelled" as const,
      count: orderCounts.cancelled,
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
      case "collected":
        return "#32ADE6";
      case "recycled":
        return "#4CAF50";
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
        return "En camino";
      case "delivered":
        return "Entregada";
      case "collected":
        return "Recolectada";
      case "recycled":
        return "Reciclada";
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
      case "collected":
        return "package-check" as const;
      case "recycled":
        return "recycle" as const;
      case "cancelled":
        return "close-circle-outline" as const;
      default:
        return "help-circle-outline" as const;
    }
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return "Fecha no disponible";

    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(dateObj.getTime())) return "Fecha inválida";

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - dateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Hoy";
    if (diffDays === 2) return "Ayer";
    if (diffDays <= 7) return `Hace ${diffDays - 1} días`;

    return dateObj.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number | string): string => {
    const numericAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;

    if (isNaN(numericAmount)) {
      console.warn("formatCurrency: Invalid amount received:", amount);
      return "$0.00";
    }

    return `$${numericAmount.toFixed(2)}`;
  };

  const handleOrderPress = (order: Order) => {
    navigate("Orders", {
      screen: "OrderDetail",
      params: { orderId: order.id },
    });
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
        showsHorizontalScrollIndicator={Platform.OS === "web"}
        contentContainerStyle={ordersStyles.filterScrollContent}
        bounces={false}
        decelerationRate="fast"
        style={{ flexGrow: 0 }}
        nestedScrollEnabled={true}
        persistentScrollbar={Platform.OS === "web"}
      >
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              ordersStyles.filterTab,
              selectedFilter === option.value && ordersStyles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter(option.value)}
            activeOpacity={0.7}
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

  const renderOrderCard = (order: Order) => {
    // Validación de seguridad para el ID
    if (!order || !order.id) {
      return null;
    }

    // Formatear order_number como BL-XXXXXX
    const orderNumber = order.order_number
      ? `BL-${String(order.order_number).padStart(6, "0")}`
      : `#${order.id.substring(0, 8).toUpperCase()}`;

    return (
      <TouchableOpacity
        key={order.id}
        style={ordersStyles.orderCard}
        onPress={() => handleOrderPress(order)}
      >
        <View style={ordersStyles.orderCardHeader}>
          <View style={ordersStyles.orderMainInfo}>
            <View style={ordersStyles.orderIdRow}>
              <Text style={ordersStyles.orderId}>{orderNumber}</Text>
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
              {(order as any).total_items || order.items?.length || 0} item
              {((order as any).total_items || order.items?.length || 0) !== 1
                ? "s"
                : ""}
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
                    order.status === "delivered" ||
                    order.status === "collected" ||
                    order.status === "recycled"
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
  };

  return (
    <>
      <ThemedHeader title="Mis Ordenes" canGoBack />
      <ScrollView
        // style={ordersStyles.scrollView}
        contentContainerStyle={ordersStyles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[colors.belandOrange]}
            tintColor={colors.belandOrange}
          />
        }
        showsVerticalScrollIndicator={true}
      >
        {orders.length > 0 && renderSummaryCard()}

        {orders.length > 0 && renderFilterTabs()}

        {displayedOrders.length === 0 ? (
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
                onPress={() => goBack()}
              >
                <Text style={ordersStyles.shopButtonText}>Ir al catálogo</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            <View style={ordersStyles.ordersList}>
              {displayedOrders.map(renderOrderCard).filter(Boolean)}
            </View>

            {/* Paginación */}
            <View style={ordersStyles.paginationContainer}>
              <TouchableOpacity
                style={[
                  ordersStyles.paginationButton,
                  currentPage === 1 && ordersStyles.paginationButtonDisabled,
                ]}
                onPress={() => {
                  if (currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                  }
                }}
                disabled={currentPage === 1}
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={24}
                  color={
                    currentPage === 1
                      ? colors.textSecondary
                      : colors.belandOrange
                  }
                />
                <Text
                  style={[
                    ordersStyles.paginationButtonText,
                    currentPage === 1 &&
                      ordersStyles.paginationButtonTextDisabled,
                  ]}
                >
                  Anterior
                </Text>
              </TouchableOpacity>

              <Text style={ordersStyles.paginationText}>
                Página {currentPage}
              </Text>

              <TouchableOpacity
                style={[
                  ordersStyles.paginationButton,
                  !actualHasMore && ordersStyles.paginationButtonDisabled,
                ]}
                onPress={() => {
                  if (actualHasMore) {
                    setCurrentPage(currentPage + 1);
                  }
                }}
                disabled={!actualHasMore}
              >
                <Text
                  style={[
                    ordersStyles.paginationButtonText,
                    !actualHasMore && ordersStyles.paginationButtonTextDisabled,
                  ]}
                >
                  Siguiente
                </Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color={
                    !actualHasMore ? colors.textSecondary : colors.belandOrange
                  }
                />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </>
  );
};

export default OrdersScreen;
