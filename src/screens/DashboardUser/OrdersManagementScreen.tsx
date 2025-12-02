import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  ScrollView,
  TextInput,
} from "react-native";
import { useNotify } from "src/hooks";
import { useOrderSocket } from "src/hooks/useOrderSocket";
import { OrderService, DeliveryStatus } from "@services/core";
import { Order as ApiOrder } from "@services/OrderApiService";
import { ThemedHeader } from "src/components/shared/headers/Header";
import { useAuth } from "src/context";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { colors } from "src/styles/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { VerificationCodeModal } from "src/components/shared/modals/VerificationCodeModal";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  list: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusAndAmount: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.belandOrange,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  cardBody: {
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  userIcon: {
    marginRight: 8,
  },
  userText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  addressInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  addressIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  addressText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  itemsInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  itemsIcon: {
    marginRight: 8,
  },
  itemsText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  actionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
  },
  actionButton: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.belandOrange,
    minWidth: 80,
    alignItems: "center",
  },
  actionButtonSecondary: {
    backgroundColor: "#6c757d",
  },
  actionButtonDanger: {
    backgroundColor: "#dc3545",
  },
  actionText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  viewDetailButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#e9ecef",
    alignItems: "center",
  },
  viewDetailText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  filtersContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.belandOrange,
  },
  filterButtonText: {
    marginLeft: 6,
    color: colors.belandOrange,
    fontWeight: "600",
    fontSize: 14,
  },
  filterBadge: {
    marginLeft: 6,
    backgroundColor: colors.belandOrange,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  clearFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  clearFilterText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginRight: 4,
  },
  filtersPanel: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabelWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  statusFilters: {
    flexDirection: "row",
  },
  sortButtons: {
    flexDirection: "row",
    gap: 8,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
    backgroundColor: "#f8f9fa",
    gap: 6,
  },
  sortButtonActive: {
    backgroundColor: colors.belandOrange,
    borderColor: colors.belandOrange,
  },
  sortButtonText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  sortButtonTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  priceRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priceInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    padding: 0,
  },
  dateRangeContainer: {
    flexDirection: "column",
    gap: 12,
  },
  dateInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    padding: 0,
  },
  statusFilterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  statusFilterChipActive: {
    backgroundColor: colors.belandOrange,
    borderColor: colors.belandOrange,
  },
  statusFilterText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  statusFilterTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  paginationContainer: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    alignItems: "center",
  },
  paginationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 8,
  },
  paginationButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.belandOrange,
    marginHorizontal: 8,
  },
  paginationButtonDisabled: {
    borderColor: "#ccc",
    opacity: 0.5,
  },
  paginationNumbers: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  paginationNumberButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
    minWidth: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  paginationNumberButtonActive: {
    backgroundColor: colors.belandOrange,
    borderColor: colors.belandOrange,
  },
  paginationNumberText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  paginationNumberTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  paginationInfo: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
});

// Tipo para los estados de delivery ya está en OrderApiService

export const OrdersManagementScreen: React.FC = () => {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [deliveryStatuses, setDeliveryStatuses] = useState<DeliveryStatus[]>(
    []
  );
  const [statusCodeToIdMap, setStatusCodeToIdMap] = useState<
    Record<string, string>
  >({});
  const [verificationModalVisible, setVerificationModalVisible] =
    useState(false);
  const [pendingDeliveryOrderId, setPendingDeliveryOrderId] = useState<
    string | null
  >(null);
  const [pendingDeliveryOrderNumber, setPendingDeliveryOrderNumber] =
    useState<string>("");
  const { user } = useAuth();
  const { navigate } = useCustomNavigation();
  const notify = useNotify();
  const loadOrders = useCallback(
    async (
      isRefresh = false,
      pageNum = 1,
      statusId = "",
      minTotal = "",
      maxTotal = "",
      fechaDesde = "",
      fechaHasta = ""
    ) => {
      if (isRefresh) {
        setRefreshing(true);
        setPage(1);
      } else {
        setLoading(true);
      }

      try {
        // Construir parámetros según el backend espera
        const queryParams: any = { page: pageNum, limit: 5 };

        if (statusId) {
          queryParams.status_id = statusId;
        }
        if (minTotal) {
          queryParams.min_total = parseFloat(minTotal);
        }
        if (maxTotal) {
          queryParams.max_total = parseFloat(maxTotal);
        }
        if (fechaDesde) {
          queryParams.fecha_desde = new Date(fechaDesde).toISOString();
        }
        if (fechaHasta) {
          queryParams.fecha_hasta = new Date(fechaHasta).toISOString();
        }

        console.log(
          "📋 Cargando órdenes - Página:",
          pageNum,
          "Filtros:",
          queryParams
        );
        const res = await OrderService.getOrders(queryParams);

        // Map several possible response shapes into an array of orders:
        let data: any[] = [];
        let total = 0;

        if (Array.isArray(res)) {
          if (res.length > 0 && Array.isArray(res[0])) {
            data = res[0];
            total = res[1] || data.length;
          } else {
            data = res as any[];
            total = data.length;
          }
        } else if (res && typeof res === "object") {
          if (Array.isArray((res as any).data)) {
            data = (res as any).data;
            total = (res as any).total || data.length;
          } else if (
            (res as any).data &&
            (res as any).data.data &&
            Array.isArray((res as any).data.data)
          ) {
            data = (res as any).data.data;
            total = (res as any).data.total || data.length;
          } else if (Array.isArray((res as any).orders)) {
            data = (res as any).orders;
            total = (res as any).total || data.length;
          } else {
            const found = Object.values(res).find((v) => Array.isArray(v));
            if (found) {
              data = found as any[];
              total = data.length;
            }
          }
        }

        // Calcular total de páginas
        const calculatedTotalPages = Math.ceil(total / 5) || 1;
        setTotalPages(calculatedTotalPages);
        setTotalOrders(total);

        // Log para verificar si las órdenes incluyen las relaciones necesarias
        console.log(
          "📦 Órdenes recibidas:",
          data.length,
          "- Total:",
          total,
          "- Páginas:",
          calculatedTotalPages
        );
        console.log("🔍 Primera orden tiene user?", !!data[0]?.user);
        console.log("🔍 Primera orden tiene address?", !!data[0]?.address);
        console.log("🔍 Primera orden tiene items?", !!data[0]?.items);

        setOrders([...data] as ApiOrder[]);
      } catch (err) {
        console.error("OrdersManagement: error loading orders", err);
        setOrders([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
        setPage(newPage);
        loadOrders(false, newPage, statusFilter);
      }
    },
    [totalPages, page, loadOrders, statusFilter]
  );

  // Cargar estados de delivery al montar el componente
  useEffect(() => {
    const loadDeliveryStatuses = async () => {
      try {
        const statuses = await OrderService.getDeliveryStatuses();
        setDeliveryStatuses(statuses);

        // Crear mapa de código -> ID para filtrar
        const codeToIdMap: Record<string, string> = {};
        statuses.forEach((status) => {
          codeToIdMap[status.code] = status.id;
        });
        setStatusCodeToIdMap(codeToIdMap);

        console.log("📊 Estados de delivery cargados:", statuses);
        console.log("🗺️ Mapa código->ID:", codeToIdMap);
      } catch (error) {
        console.error("Error cargando estados de delivery:", error);
      }
    };

    loadDeliveryStatuses();
  }, []);

  useEffect(() => {
    // Convertir código de estado a ID antes de filtrar
    const statusId = statusFilter ? statusCodeToIdMap[statusFilter] || "" : "";
    loadOrders(false, page, statusId, minPrice, maxPrice, dateFrom, dateTo);
  }, [
    statusFilter,
    minPrice,
    maxPrice,
    dateFrom,
    dateTo,
    page,
    statusCodeToIdMap,
  ]); // Recargar cuando cambie cualquier filtro o la página

  // Recargar órdenes cuando se cree o actualice una orden (el socket global maneja las notificaciones)
  useOrderSocket(() => {
    loadOrders();
  });

  const handleChangeStatus = async (
    orderId: string,
    status: ApiOrder["status"]
  ) => {
    setLoading(true);
    try {
      await OrderService.updateOrderStatus(orderId, status);
      await loadOrders();
      notify.success({
        message: `Estado actualizado a ${
          typeof status === "object" ? (status as any)?.code : status
        }`,
      });
    } catch (err) {
      console.error("OrdersManagement: could not update status", err);

      const errorMessage =
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el estado de la orden";

      notify.error({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (orderId: string) => {
    notify.confirm({
      message: "¿Confirma cancelar esta orden?",
      onConfirm: async () => {
        setLoading(true);
        try {
          await OrderService.cancelOrder(orderId);
          await loadOrders();
          notify.success({ message: "Orden cancelada" });
        } catch (err) {
          console.error("OrdersManagement: cancel error", err);
          notify.error({ message: "No se pudo cancelar la orden" });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleDeliverOrder = (orderId: string, orderNumber: string) => {
    setPendingDeliveryOrderId(orderId);
    setPendingDeliveryOrderNumber(orderNumber);
    setVerificationModalVisible(true);
  };

  const handleConfirmDelivery = async (code: number) => {
    if (!pendingDeliveryOrderId) return;

    try {
      await OrderService.deliverOrder(pendingDeliveryOrderId, code);
      await loadOrders();
      notify.success({ message: "Orden marcada como entregada" });
    } catch (err) {
      console.error("OrdersManagement: delivery error", err);
      throw err; // Re-throw para que el modal muestre el error
    }
  };

  const renderItem = ({ item }: { item: ApiOrder }) => {
    // Mapeo defensivo de datos según la estructura real del backend
    const orderId = item?.id || "";

    // Usar order_number con formato profesional
    const orderNumber = item?.order_number
      ? `BL-${String(item.order_number).padStart(6, "0")}`
      : `#${String(orderId).substring(0, 8).toUpperCase()}`;

    const createdAt = item?.created_at ? new Date(item.created_at) : null;

    // Normalizar status: el backend devuelve un objeto status con código
    const rawStatus = item?.status;

    // Mapear códigos del backend a códigos del frontend
    const mapBackendStatusToFrontend = (backendStatus: string): string => {
      const statusMap: Record<string, string> = {
        PENDING: "pending",
        PREPARING: "processing",
        ON_ROUTE: "shipped",
        DELIVERED: "delivered",
        CANCELLED: "cancelled",
        COLLECTED: "collected",
        RECYCLED: "recycled",
      };
      return (
        statusMap[backendStatus.toUpperCase()] || backendStatus.toLowerCase()
      );
    };

    let status = "unknown";
    if (typeof rawStatus === "object" && rawStatus !== null) {
      const code = (rawStatus as any)?.code;
      if (code) {
        status = mapBackendStatusToFrontend(code);
      }
    } else if (typeof rawStatus === "string") {
      status = mapBackendStatusToFrontend(rawStatus);
    }

    // Debug temporal para ver el status
    if (orderId === "b170fbb2-d308-43f4-9900-9f6c7a0841fb") {
      console.log("🔍 DEBUG Order Status:", {
        orderId,
        rawStatus,
        rawStatusType: typeof rawStatus,
        rawStatusCode: (rawStatus as any)?.code,
        rawStatusId: (rawStatus as any)?.id,
        mappedStatus: status,
        fullItemStatus: item?.status,
      });
    }

    // Usuario: ahora sí tenemos el objeto user completo
    const user = (item as any)?.user;
    const userName =
      user?.full_name ||
      user?.username ||
      user?.email ||
      `Usuario ${String((item as any)?.user_id || "").slice(0, 8)}`;

    // Dirección: ahora sí tenemos el objeto address completo
    const address = (item as any)?.address;
    const addressDisplay = address
      ? `${address.addressLine1 || ""}${
          address.city ? `, ${address.city}` : ""
        }`
      : "Sin dirección especificada";

    // Productos: el backend devuelve total_items
    const totalItems = (item as any)?.total_items || 0;

    // Monto total
    const totalAmount = Number((item as any)?.total_amount || 0).toFixed(2); // Get status color and display info
    const getStatusInfo = (status: string) => {
      switch (status) {
        case "pending":
          return { color: "#FF9500", text: "Pendiente", icon: "clock-outline" };
        case "confirmed":
          return {
            color: "#007AFF",
            text: "Confirmada",
            icon: "check-circle-outline",
          };
        case "processing":
          return {
            color: "#34C759",
            text: "Preparando",
            icon: "package-variant",
          };
        case "shipped":
          return {
            color: "#5856D6",
            text: "Enviada",
            icon: "truck-delivery-outline",
          };
        case "delivered":
          return { color: "#30B0C7", text: "Entregada", icon: "check-circle" };
        case "cancelled":
          return {
            color: "#FF3B30",
            text: "Cancelada",
            icon: "close-circle-outline",
          };
        case "collected":
          return {
            color: "#34C759",
            text: "Recolectada",
            icon: "recycle",
          };
        case "recycled":
          return {
            color: "#4CAF50",
            text: "Reciclada",
            icon: "leaf",
          };
        default:
          return {
            color: "#8E8E93",
            text: "Desconocido",
            icon: "help-circle-outline",
          };
      }
    };

    const statusInfo = getStatusInfo(status);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigate("OrderAdminDetail", { orderId: orderId })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>{orderNumber}</Text>
            <Text style={styles.orderDate}>
              {createdAt
                ? createdAt.toLocaleDateString("es-ES", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Fecha desconocida"}
            </Text>
          </View>
          <View style={styles.statusAndAmount}>
            <Text style={styles.amountText}>${totalAmount}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusInfo.color },
              ]}
            >
              <MaterialCommunityIcons
                name={statusInfo.icon as any}
                size={12}
                color="white"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.statusText}>{statusInfo.text}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.userInfo}>
            <MaterialCommunityIcons
              name="account"
              size={16}
              color={colors.textSecondary}
              style={styles.userIcon}
            />
            <Text style={styles.userText}>{userName}</Text>
          </View>

          <View style={styles.addressInfo}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color={colors.textSecondary}
              style={styles.addressIcon}
            />
            <Text style={styles.addressText} numberOfLines={2}>
              {addressDisplay}
            </Text>
          </View>

          <View style={styles.itemsInfo}>
            <MaterialCommunityIcons
              name="package-variant-closed"
              size={16}
              color={colors.textSecondary}
              style={styles.itemsIcon}
            />
            <Text style={styles.itemsText}>
              {totalItems} producto{totalItems !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <View style={styles.actionButtons}>
            {/* Only allow incremental status transition */}
            {(() => {
              const getNextStatus = (
                s: string
              ): { next?: string; label?: string; icon?: string } => {
                // Define incremental flow
                if (s === "pending" || s === "confirmed")
                  return {
                    next: "processing",
                    label: "Preparar",
                    icon: "package-variant",
                  };
                if (s === "processing")
                  return {
                    next: "shipped",
                    label: "Enviar",
                    icon: "truck-delivery",
                  };
                return {};
              };

              const next = getNextStatus(status);

              return (
                <>
                  {next.next && orderId ? (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        handleChangeStatus(orderId, next.next as any)
                      }
                    >
                      <MaterialCommunityIcons
                        name={next.icon as any}
                        size={14}
                        color="white"
                      />
                      <Text style={styles.actionText}> {next.label}</Text>
                    </TouchableOpacity>
                  ) : null}

                  {/* Delivered button: opens verification modal */}
                  {status === "shipped" && orderId ? (
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        { backgroundColor: "#30B0C7" },
                      ]}
                      onPress={() => handleDeliverOrder(orderId, orderNumber)}
                    >
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={14}
                        color="white"
                      />
                      <Text style={styles.actionText}> Entregar</Text>
                    </TouchableOpacity>
                  ) : null}

                  {/* Cancel button: allow canceling unless already delivered or cancelled */}
                  {status !== "delivered" &&
                  status !== "cancelled" &&
                  orderId ? (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonDanger]}
                      onPress={() => handleCancel(orderId)}
                    >
                      <MaterialCommunityIcons
                        name="close-circle"
                        size={14}
                        color="white"
                      />
                      <Text style={styles.actionText}> Cancelar</Text>
                    </TouchableOpacity>
                  ) : null}
                </>
              );
            })()}
          </View>

          <TouchableOpacity
            style={styles.viewDetailButton}
            onPress={() => navigate("OrderAdminDetail", { orderId: orderId })}
          >
            <MaterialCommunityIcons
              name="eye"
              size={14}
              color={colors.textPrimary}
            />
            <Text style={styles.viewDetailText}> Ver detalle</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ThemedHeader
        title={
          user?.role === "SUPERADMIN"
            ? "Órdenes (Superadmin)"
            : "Órdenes (Admin)"
        }
      />

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <MaterialCommunityIcons
            name="filter-variant"
            size={20}
            color={colors.belandOrange}
          />
          <Text style={styles.filterButtonText}>Filtros</Text>
          {(statusFilter || minPrice || maxPrice || dateFrom || dateTo) && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {
                  [statusFilter, minPrice, maxPrice, dateFrom, dateTo].filter(
                    Boolean
                  ).length
                }
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {(statusFilter || minPrice || maxPrice || dateFrom || dateTo) && (
          <TouchableOpacity
            style={styles.clearFilterButton}
            onPress={() => {
              setStatusFilter("");
              setMinPrice("");
              setMaxPrice("");
              setDateFrom("");
              setDateTo("");
              setPage(1);
            }}
          >
            <Text style={styles.clearFilterText}>Limpiar filtros</Text>
            <MaterialCommunityIcons
              name="close"
              size={16}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {showFilters && (
        <View style={styles.filtersPanel}>
          {/* Filtro de Estado */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Estado:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.statusFilters}
            >
              {[
                { value: "", label: "Todos" },
                { value: "PENDING", label: "Pendiente" },
                { value: "PREPARING", label: "En preparación" },
                { value: "ON_ROUTE", label: "En camino" },
                { value: "DELIVERED", label: "Entregado" },
                { value: "CANCELLED", label: "Cancelada" },
              ].map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.statusFilterChip,
                    statusFilter === item.value &&
                      styles.statusFilterChipActive,
                  ]}
                  onPress={() => {
                    setStatusFilter(item.value);
                    setPage(1);
                  }}
                >
                  <Text
                    style={[
                      styles.statusFilterText,
                      statusFilter === item.value &&
                        styles.statusFilterTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Filtro de Precio - Rango */}
          <View style={styles.filterSection}>
            <View style={styles.filterLabelWithIcon}>
              <MaterialCommunityIcons
                name="currency-usd"
                size={16}
                color={colors.belandOrange}
              />
              <Text style={styles.filterLabel}>Rango de precio (BeCoins)</Text>
            </View>
            <View style={styles.priceRangeContainer}>
              <View style={styles.priceInputWrapper}>
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={14}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.priceInput}
                  keyboardType="numeric"
                  placeholder="Mínimo"
                  placeholderTextColor="#999"
                  value={minPrice}
                  onChangeText={(text) => {
                    setMinPrice(text);
                    setPage(1);
                  }}
                />
              </View>
              <MaterialCommunityIcons
                name="arrow-right"
                size={16}
                color={colors.textSecondary}
              />
              <View style={styles.priceInputWrapper}>
                <MaterialCommunityIcons
                  name="chevron-up"
                  size={14}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.priceInput}
                  keyboardType="numeric"
                  placeholder="Máximo"
                  placeholderTextColor="#999"
                  value={maxPrice}
                  onChangeText={(text) => {
                    setMaxPrice(text);
                    setPage(1);
                  }}
                />
              </View>
            </View>
          </View>

          {/* Filtro de Fecha - Rango */}
          <View style={styles.filterSection}>
            <View style={styles.filterLabelWithIcon}>
              <MaterialCommunityIcons
                name="calendar-range"
                size={16}
                color={colors.belandOrange}
              />
              <Text style={styles.filterLabel}>Rango de fechas</Text>
            </View>
            <View style={styles.dateRangeContainer}>
              <View style={styles.dateInputWrapper}>
                <MaterialCommunityIcons
                  name="calendar-start"
                  size={16}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.dateInput}
                  placeholder="Desde (AAAA-MM-DD)"
                  placeholderTextColor="#999"
                  value={dateFrom}
                  onChangeText={(text) => {
                    setDateFrom(text);
                    setPage(1);
                  }}
                />
              </View>
              <View style={styles.dateInputWrapper}>
                <MaterialCommunityIcons
                  name="calendar-end"
                  size={16}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.dateInput}
                  placeholder="Hasta (AAAA-MM-DD)"
                  placeholderTextColor="#999"
                  value={dateTo}
                  onChangeText={(text) => {
                    setDateTo(text);
                    setPage(1);
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      )}

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.belandOrange} />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="package-variant"
            size={64}
            color={colors.textSecondary}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>No hay órdenes</Text>
          <Text style={styles.emptySubtitle}>
            Las órdenes de los usuarios aparecerán aquí
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={orders}
            extraData={orders}
            keyExtractor={(o, idx) => {
              // Incluir el status en el key para forzar re-render cuando cambie
              const status =
                typeof o?.status === "object"
                  ? (o.status as any)?.code
                  : o?.status;
              return `${o?.id || idx}-${status || "unknown"}`;
            }}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() =>
                  loadOrders(
                    true,
                    1,
                    statusFilter,
                    minPrice,
                    maxPrice,
                    dateFrom,
                    dateTo
                  )
                }
                colors={[colors.belandOrange]}
                tintColor={colors.belandOrange}
              />
            }
          />

          {/* Paginación */}
          {totalPages > 1 && (
            <View style={styles.paginationContainer}>
              <View style={styles.paginationRow}>
                <TouchableOpacity
                  style={[
                    styles.paginationButton,
                    page === 1 && styles.paginationButtonDisabled,
                  ]}
                  onPress={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  <MaterialCommunityIcons
                    name="chevron-left"
                    size={24}
                    color={page === 1 ? "#ccc" : colors.belandOrange}
                  />
                </TouchableOpacity>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.paginationNumbers}
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <TouchableOpacity
                        key={pageNum}
                        style={[
                          styles.paginationNumberButton,
                          page === pageNum &&
                            styles.paginationNumberButtonActive,
                        ]}
                        onPress={() => handlePageChange(pageNum)}
                      >
                        <Text
                          style={[
                            styles.paginationNumberText,
                            page === pageNum &&
                              styles.paginationNumberTextActive,
                          ]}
                        >
                          {pageNum}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </ScrollView>

                <TouchableOpacity
                  style={[
                    styles.paginationButton,
                    page === totalPages && styles.paginationButtonDisabled,
                  ]}
                  onPress={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color={page === totalPages ? "#ccc" : colors.belandOrange}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.paginationInfo}>
                Página {page} de {totalPages} ({totalOrders} órdenes)
              </Text>
            </View>
          )}
        </>
      )}

      {/* Verification Code Modal */}
      <VerificationCodeModal
        visible={verificationModalVisible}
        onClose={() => {
          setVerificationModalVisible(false);
          setPendingDeliveryOrderId(null);
          setPendingDeliveryOrderNumber("");
        }}
        onConfirm={handleConfirmDelivery}
        orderNumber={pendingDeliveryOrderNumber}
      />
    </View>
  );
};

export default OrdersManagementScreen;
