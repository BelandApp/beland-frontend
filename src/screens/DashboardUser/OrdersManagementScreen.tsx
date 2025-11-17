import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import { OrderService } from "@services/core";
import { Order as ApiOrder } from "@services/OrderApiService";
import { ThemedHeader } from "src/components/shared/headers/Header";
import { useAuth } from "src/context";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { colors } from "src/styles/colors";
import { SocketService } from "src/services/SocketService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
  const { user } = useAuth();
  const { navigate } = useCustomNavigation();

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      // Traer órdenes (sin filtro para admin)
      const res = await OrderService.getOrders({ page: 1, limit: 50 });

      // Diagnostic - show raw response shape (helps track backend variants)
      console.log("OrdersManagement: raw getOrders response:", res);

      // Map several possible response shapes into an array of orders:
      // 1) PaginatedResponse: { data: Order[], total, page, limit }
      // 2) Wrapped: { data: { data: Order[], total } }
      // 3) Tuple: [Order[], total]
      // 4) Direct array: Order[]
      let data: any[] = [];

      if (Array.isArray(res)) {
        // Could be [orders, total] or directly an array of orders
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
          // Fallback: try to find the first array-valued property
          const found = Object.values(res).find((v) => Array.isArray(v));
          if (found) data = found as any[];
        }
      }

      console.log(
        "OrdersManagement: mapped orders count:",
        (data || []).length
      );
      setOrders((data || []) as ApiOrder[]);
    } catch (err) {
      console.error("OrdersManagement: error loading orders", err);
      Alert.alert("Error", "No se pudieron cargar las órdenes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Real-time updates: subscribe to socket events if backend emits them
  useEffect(() => {
    let socket: SocketService | null = null;
    let mounted = true;

    const initSocket = async () => {
      try {
        let token: string | null = null;
        if (typeof window !== "undefined") {
          token = window.localStorage.getItem("access_token");
        } else {
          token = await AsyncStorage.getItem("access_token");
        }

        if (!token) return;

        socket = new SocketService();
        socket.connect(token);

        socket.onOrderCreated((data: any) => {
          console.log("Socket orderCreated received:", data);
          if (!mounted) return;
          // Reload list when a new order arrives
          loadOrders();
        });

        socket.onOrderUpdated((data: any) => {
          console.log("Socket orderUpdated received:", data);
          if (!mounted) return;
          // Reload list on updates
          loadOrders();
        });
      } catch (err) {
        console.warn("OrdersManagement: socket init failed", err);
      }
    };

    initSocket();

    return () => {
      mounted = false;
      try {
        socket?.disconnect();
      } catch {}
      socket = null;
    };
  }, [loadOrders]);

  const handleChangeStatus = async (
    orderId: string,
    status: ApiOrder["status"]
  ) => {
    setLoading(true);
    try {
      await OrderService.updateOrderStatus(orderId, status);
      await loadOrders();
      Alert.alert("OK", `Estado actualizado a ${status}`);
    } catch (err) {
      console.error("OrdersManagement: could not update status", err);
      Alert.alert("Error", "No se pudo actualizar el estado");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (orderId: string) => {
    Alert.alert("Cancelar orden", "¿Confirma cancelar esta orden?", [
      { text: "No", style: "cancel" },
      {
        text: "Sí",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await OrderService.cancelOrder(orderId);
            await loadOrders();
            Alert.alert("OK", "Orden cancelada");
          } catch (err) {
            console.error("OrdersManagement: cancel error", err);
            Alert.alert("Error", "No se pudo cancelar la orden");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: ApiOrder }) => {
    // Defensive guards: some API items may be partial; avoid calling slice on undefined
    const shortId = item && item.id ? String(item.id).slice(-8) : undefined;
    const displayId =
      item && (item.order_number ?? shortId)
        ? item.order_number ?? shortId
        : "---";
    const createdAt =
      item && item.created_at ? new Date(item.created_at) : undefined;

    // Normalize status: handle both object and string cases
    const status =
      typeof item?.status === "object"
        ? (item?.status as any)?.code
        : item?.status;

    // Get status color and display info
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
        default:
          return {
            color: "#8E8E93",
            text: "Desconocido",
            icon: "help-circle-outline",
          };
      }
    };

    const statusInfo = getStatusInfo(status || "");

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigate("OrderAdminDetail", { orderId: item?.id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>#{displayId}</Text>
            <Text style={styles.orderDate}>
              {createdAt
                ? createdAt.toLocaleDateString("es-ES", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </Text>
          </View>
          <View style={styles.statusAndAmount}>
            <Text style={styles.amountText}>{`$${Number(
              item?.total_amount || 0
            ).toFixed(2)}`}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusInfo.color },
              ]}
            >
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
            <Text style={styles.userText}>
              {(item as any)?.user?.full_name ??
                (item as any)?.user_id ??
                "Usuario desconocido"}
            </Text>
          </View>

          <View style={styles.addressInfo}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color={colors.textSecondary}
              style={styles.addressIcon}
            />
            <Text style={styles.addressText} numberOfLines={2}>
              {item?.shipping_address?.street ?? "Dirección no especificada"}
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
              {item?.items?.reduce(
                (total, orderItem) => total + (orderItem.quantity || 0),
                0
              ) || 0}{" "}
              producto
              {(item?.items?.reduce(
                (total, orderItem) => total + (orderItem.quantity || 0),
                0
              ) || 0) !== 1
                ? "s"
                : ""}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <View style={styles.actionButtons}>
            {/* Only allow incremental status transition: next step depends on current status */}
            {(() => {
              const hasId = !!item?.id;

              const getNextStatus = (
                s?: string
              ): { next?: string; label?: string; icon?: string } => {
                if (!s) return {};
                // Define incremental flow: pending/confirmed -> processing -> shipped -> delivered
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
                if (s === "shipped")
                  return {
                    next: "delivered",
                    label: "Entregar",
                    icon: "check-circle",
                  };
                // delivered or cancelled -> no next action
                return {};
              };

              const next = getNextStatus(status);

              return (
                <>
                  {next.next ? (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        hasId && handleChangeStatus(item.id, next.next as any)
                      }
                      disabled={!hasId}
                    >
                      <MaterialCommunityIcons
                        name={next.icon as any}
                        size={14}
                        color="white"
                      />
                      <Text style={styles.actionText}> {next.label}</Text>
                    </TouchableOpacity>
                  ) : null}

                  {/* Cancel button: allow canceling unless already delivered or cancelled */}
                  {status !== "delivered" && status !== "cancelled" ? (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonDanger]}
                      onPress={() => hasId && handleCancel(item.id)}
                      disabled={!hasId}
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
            onPress={() => navigate("OrderAdminDetail", { orderId: item?.id })}
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
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o, idx) =>
            o?.id ?? `${o?.order_number ?? "order"}-${idx}`
          }
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

export default OrdersManagementScreen;
