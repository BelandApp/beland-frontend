import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { useNotify } from "src/hooks";
import { Order as ApiOrder } from "@services/OrderApiService";
import { Product } from "@services/ProductApiService";
import { OrderService, ProductService } from "@services/core";
import { ThemedHeader } from "src/components/shared/headers/Header";
import { colors } from "src/styles/colors";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "src/components/layout/RootStackNavigator";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { VerificationCodeModal } from "src/components/shared/modals/VerificationCodeModal";

type RouteProps = RouteProp<Record<string, object | undefined>, string> & {
  params: { orderId: string };
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  content: { padding: 16 },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: "500",
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 6,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#f5f5f5",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.belandOrange,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: colors.belandOrange,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.belandOrange,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.belandOrange,
  },
  actionBtnSecondary: {
    backgroundColor: "#6c757d",
  },
  actionBtnDanger: {
    backgroundColor: "#dc3545",
  },
  actionBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export const OrderAdminDetailScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const { orderId } = route.params || { orderId: undefined };
  const { goBack, navigate } = useCustomNavigation();

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [verificationModalVisible, setVerificationModalVisible] =
    useState(false);
  const notify = useNotify();

  useEffect(() => {
    let mounted = true;
    const fetchOrder = async () => {
      if (!orderId) return;
      setLoading(true);
      try {
        const res = await OrderService.getOrder(orderId);
        if (mounted) {
          setOrder(res as ApiOrder);

          // Cargar detalles de productos
          const items = (res as any)?.items || [];
          if (items.length > 0) {
            const productPromises = items.map(async (item: any) => {
              try {
                const product = await ProductService.getProduct(
                  item.product_id
                );
                return { id: item.product_id, product };
              } catch (err) {
                console.error(
                  `Failed to load product ${item.product_id}:`,
                  err
                );
                return { id: item.product_id, product: null };
              }
            });

            const productsData = await Promise.all(productPromises);
            const productsMap: Record<string, Product> = {};
            productsData.forEach(({ id, product }) => {
              if (product) productsMap[id] = product;
            });

            if (mounted) setProducts(productsMap);
          }
        }
      } catch (err) {
        console.error("OrderAdminDetail: could not fetch order", err);
        notify.error({ message: "No se pudo obtener la orden" });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchOrder();
    return () => {
      mounted = false;
    };
  }, [orderId]);

  const changeStatus = async (status: string) => {
    if (!orderId) return;
    setLoading(true);
    try {
      await OrderService.updateOrderStatus(
        orderId,
        status as ApiOrder["status"]
      );
      const refreshed = await OrderService.getOrder(orderId);
      setOrder(refreshed as ApiOrder);
      notify.success({
        message: `Estado actualizado a ${getStatusDisplayName(status)}`,
      });
    } catch (err) {
      console.error("OrderAdminDetail: change status failed", err);
      notify.error({ message: "No se pudo cambiar el estado" });
    } finally {
      setLoading(false);
    }
  };

  const cancel = async () => {
    if (!orderId) return;
    notify.confirm({
      message: "¿Confirmar cancelar esta orden?",
      onConfirm: async () => {
        setLoading(true);
        try {
          await OrderService.cancelOrder(orderId);
          const refreshed = await OrderService.getOrder(orderId);
          setOrder(refreshed as ApiOrder);
          notify.success({ message: "Orden cancelada" });
        } catch (err) {
          console.error("OrderAdminDetail: cancel failed", err);
          notify.error({ message: "No se pudo cancelar la orden" });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleDeliverOrder = () => {
    setVerificationModalVisible(true);
  };

  const handleConfirmDelivery = async (code: number) => {
    if (!orderId) return;

    setLoading(true);
    try {
      await OrderService.deliverOrder(orderId, code);
      const refreshed = await OrderService.getOrder(orderId);
      setOrder(refreshed as ApiOrder);
      notify.success({ message: "Orden marcada como entregada" });
    } catch (err) {
      console.error("OrderAdminDetail: delivery error", err);
      setLoading(false);
      throw err; // Re-throw para que el modal muestre el error
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplayName = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Pendiente",
      confirmed: "Confirmada",
      processing: "Preparando",
      shipped: "Enviada",
      delivered: "Entregada",
      cancelled: "Cancelada",
      collected: "Recolectada",
      recycled: "Reciclada",
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const getStatusInfo = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "pending":
        return { color: "#FF9500", icon: "clock-outline" };
      case "confirmed":
        return { color: "#007AFF", icon: "check-circle-outline" };
      case "processing":
        return { color: "#34C759", icon: "package-variant" };
      case "shipped":
        return { color: "#5856D6", icon: "truck-delivery-outline" };
      case "delivered":
        return { color: "#30B0C7", icon: "check-circle" };
      case "cancelled":
        return { color: "#FF3B30", icon: "close-circle-outline" };
      case "collected":
        return { color: "#34C759", icon: "recycle" };
      case "recycled":
        return { color: "#4CAF50", icon: "leaf" };
      default:
        return { color: "#8E8E93", icon: "help-circle-outline" };
    }
  };

  if (loading && !order) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.belandOrange} />
      </View>
    );
  }

  // Normalizar status - mapear códigos del backend a frontend
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

  const rawStatus = order?.status;
  let status = "unknown";
  if (typeof rawStatus === "object" && rawStatus !== null) {
    const code = (rawStatus as any)?.code;
    if (code) {
      status = mapBackendStatusToFrontend(code);
    }
  } else if (typeof rawStatus === "string") {
    status = mapBackendStatusToFrontend(rawStatus);
  }

  const statusInfo = getStatusInfo(status);
  const statusDisplayName = getStatusDisplayName(status);

  // Mapeo de datos de la orden usando la estructura real del backend
  // NOTA: code es el código de confirmación de 4 dígitos, NO el ID de la orden
  const orderNumber = orderId
    ? `#${String(orderId).substring(0, 8).toUpperCase()}`
    : "---";
  const createdAt = order?.created_at ? new Date(order.created_at) : null;

  // Usuario - mapear desde order.user
  const user = (order as any)?.user;
  const userName =
    user?.full_name ||
    user?.username ||
    user?.email ||
    `Usuario ${(order as any)?.user_id || "desconocido"}`;
  const userEmail = user?.email || "";
  const userPhone = user?.phone || "";

  // Dirección - mapear desde order.address (no shipping_address)
  const address = (order as any)?.address;
  const fullAddress = address
    ? `${address.addressLine1 || ""}${
        address.addressLine2 ? `\n${address.addressLine2}` : ""
      }${address.city ? `\n${address.city}` : ""}${
        address.state ? `, ${address.state}` : ""
      }${address.postalCode ? ` ${address.postalCode}` : ""}${
        address.country ? `\n${address.country}` : ""
      }`
    : "Dirección no especificada";

  // Productos - mapear desde order.items
  const items = (order as any)?.items || [];

  // Resumen financiero - usar los campos reales del backend
  const subtotal = Number((order as any)?.subtotal_amount || 0);
  const taxAmount = 0; // El backend no devuelve tax_amount
  const discountAmount = 0; // El backend no devuelve discount_amount
  const shippingAmount = Number((order as any)?.price_delivery || 0);
  const totalAmount = Number((order as any)?.total_amount || 0);

  // Método de pago - mapear desde payment_type
  const paymentType = (order as any)?.payment_type;
  const paymentMethod =
    paymentType?.description || paymentType?.code || "No especificado";

  return (
    <View style={styles.container}>
      <ThemedHeader
        title={`Orden ${orderNumber}`}
        canGoBack
        onBackPress={() => navigate("OrdersManagement")}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Estado y fecha */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color={colors.belandOrange}
              style={styles.sectionIcon}
            />
            <Text style={styles.sectionTitle}>Información General</Text>
          </View>

          <View
            style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}
          >
            <MaterialCommunityIcons
              name={statusInfo.icon as any}
              size={18}
              color="white"
            />
            <Text style={styles.statusText}>{statusDisplayName}</Text>
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={styles.label}>Fecha de creación</Text>
            <Text style={styles.value}>
              {createdAt
                ? createdAt.toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Fecha desconocida"}
            </Text>
          </View>

          {order?.tracking_number && (
            <View>
              <Text style={styles.label}>Número de seguimiento</Text>
              <Text style={styles.value}>{order.tracking_number}</Text>
            </View>
          )}

          {order?.estimated_delivery && (
            <View>
              <Text style={styles.label}>Entrega estimada</Text>
              <Text style={styles.value}>
                {new Date(order.estimated_delivery).toLocaleDateString(
                  "es-ES",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </Text>
            </View>
          )}
        </View>

        {/* Cliente */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="account"
              size={20}
              color={colors.belandOrange}
              style={styles.sectionIcon}
            />
            <Text style={styles.sectionTitle}>Cliente</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="account-circle"
              size={20}
              color={colors.textSecondary}
              style={styles.infoIcon}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>{userName}</Text>
              {userEmail ? (
                <Text style={styles.infoText}>{userEmail}</Text>
              ) : null}
              {userPhone ? (
                <Text style={styles.infoText}>{userPhone}</Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Dirección de envío */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="map-marker"
              size={20}
              color={colors.belandOrange}
              style={styles.sectionIcon}
            />
            <Text style={styles.sectionTitle}>Dirección de Envío</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={20}
              color={colors.textSecondary}
              style={styles.infoIcon}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoText}>{fullAddress}</Text>
            </View>
          </View>
        </View>

        {/* Productos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="package-variant"
              size={20}
              color={colors.belandOrange}
              style={styles.sectionIcon}
            />
            <Text style={styles.sectionTitle}>Productos ({items.length})</Text>
          </View>

          {items.map((item: any, index: number) => {
            // Obtener detalles del producto desde el estado
            const product = products[item.product_id];
            const itemName =
              product?.name ||
              `Producto ${String(item.product_id || "").slice(0, 8)}`;
            const itemImage = product?.image_url || null;
            const quantity = item.quantity || item.ordered_quantity || 1;
            const unitPrice = Number(item.unit_price || 0);
            const totalPrice = Number(item.total_price || 0);

            return (
              <View
                key={item.id || `item-${index}`}
                style={[
                  styles.itemRow,
                  index === items.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                {itemImage ? (
                  <Image source={{ uri: itemImage }} style={styles.itemImage} />
                ) : (
                  <View style={styles.itemImage}>
                    <MaterialCommunityIcons
                      name="package-variant"
                      size={32}
                      color={colors.textSecondary}
                      style={{ alignSelf: "center", marginTop: 20 }}
                    />
                  </View>
                )}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{itemName}</Text>
                  <Text style={styles.itemDetails}>
                    Cantidad: {quantity} × ${unitPrice.toFixed(2)}
                  </Text>
                  <Text style={styles.itemPrice}>${totalPrice.toFixed(2)}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Resumen de pago */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="cash-multiple"
              size={20}
              color={colors.belandOrange}
              style={styles.sectionIcon}
            />
            <Text style={styles.sectionTitle}>Resumen de Pago</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>

          {shippingAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Envío</Text>
              <Text style={styles.summaryValue}>
                ${shippingAmount.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
          </View>

          <View style={{ marginTop: 16 }}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Método de pago</Text>
              <Text style={styles.summaryValue}>{paymentMethod}</Text>
            </View>
          </View>
        </View>

        {(order as any)?.observation && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="note-text"
                size={20}
                color={colors.belandOrange}
                style={styles.sectionIcon}
              />
              <Text style={styles.sectionTitle}>Observaciones</Text>
            </View>
            <Text style={styles.infoText}>{(order as any).observation}</Text>
          </View>
        )}

        {/* Acciones */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="cog"
              size={20}
              color={colors.belandOrange}
              style={styles.sectionIcon}
            />
            <Text style={styles.sectionTitle}>Acciones</Text>
          </View>

          <View style={styles.actions}>
            {(() => {
              const getNext = (s: string) => {
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
                return null;
              };

              const action = getNext(status);

              return (
                <>
                  {action ? (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => changeStatus(action.next)}
                      disabled={loading || !order}
                    >
                      <MaterialCommunityIcons
                        name={action.icon as any}
                        size={18}
                        color="white"
                      />
                      <Text style={styles.actionBtnText}>{action.label}</Text>
                    </TouchableOpacity>
                  ) : null}

                  {/* Delivered button: opens verification modal */}
                  {status === "shipped" ? (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: "#30B0C7" }]}
                      onPress={handleDeliverOrder}
                      disabled={loading || !order}
                    >
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={18}
                        color="white"
                      />
                      <Text style={styles.actionBtnText}>Entregar</Text>
                    </TouchableOpacity>
                  ) : null}

                  {/* Cancel allowed until delivered/cancelled */}
                  {status !== "delivered" && status !== "cancelled" ? (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnDanger]}
                      onPress={cancel}
                      disabled={loading || !order}
                    >
                      <MaterialCommunityIcons
                        name="close-circle"
                        size={18}
                        color="white"
                      />
                      <Text style={styles.actionBtnText}>Cancelar</Text>
                    </TouchableOpacity>
                  ) : null}
                </>
              );
            })()}
          </View>
        </View>
      </ScrollView>

      {/* Verification Code Modal */}
      <VerificationCodeModal
        visible={verificationModalVisible}
        onClose={() => setVerificationModalVisible(false)}
        onConfirm={handleConfirmDelivery}
        orderNumber={orderNumber}
      />
    </View>
  );
};

export default OrderAdminDetailScreen;
