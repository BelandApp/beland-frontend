import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useNotify } from "src/hooks";
import { useOrderSocket } from "src/hooks/useOrderSocket";
import { OrderService } from "@services/core";
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
});

export const OrdersManagementScreen: React.FC = () => {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
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

  const loadOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Traer órdenes (sin filtro para admin)
      const res = await OrderService.getOrders({ page: 1, limit: 50 });

      // Map several possible response shapes into an array of orders:
      let data: any[] = [];

      if (Array.isArray(res)) {
        if (res.length > 0 && Array.isArray(res[0])) {
          data = res[0];
        } else {
          data = res as any[];
        }
      } else if (res && typeof res === "object") {
        if (Array.isArray((res as any).data)) {
          data = (res as any).data;
        } else if (
          (res as any).data &&
          (res as any).data.data &&
          Array.isArray((res as any).data.data)
        ) {
          data = (res as any).data.data;
        } else if (Array.isArray((res as any).orders)) {
          data = (res as any).orders;
        } else {
          const found = Object.values(res).find((v) => Array.isArray(v));
          if (found) data = found as any[];
        }
      }

      // Cargar detalles completos de cada orden para obtener user y address
      // Esto es necesario porque el endpoint de lista no incluye estas relaciones
      if (data && data.length > 0) {
        const ordersWithDetails = await Promise.all(
          data.map(async (order) => {
            try {
              const fullOrder = await OrderService.getOrder(order.id);
              return fullOrder;
            } catch (err) {
              console.error(
                `Failed to load details for order ${order.id}:`,
                err
              );
              return order;
            }
          })
        );
        // Forzar creación de nuevo array para que React detecte el cambio
        setOrders([...ordersWithDetails] as ApiOrder[]);
      } else {
        setOrders([...(data || [])] as ApiOrder[]);
      }
    } catch (err) {
      console.error("OrdersManagement: error loading orders", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

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
    const shortId = orderId
      ? String(orderId).substring(0, 8).toUpperCase()
      : "---";

    // Usar los primeros 8 caracteres del UUID como identificador
    // NOTA: code es el código de confirmación de 4 dígitos, NO el ID de la orden
    const orderNumber = `#${shortId}`;

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
              onRefresh={() => loadOrders(true)}
              colors={[colors.belandOrange]}
              tintColor={colors.belandOrange}
            />
          }
        />
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
