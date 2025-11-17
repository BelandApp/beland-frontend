import React, { useState, useEffect, useMemo } from "react";
import { ProductService, OrderService } from "@services/core";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useOrdersStoreAPI } from "../../stores/useOrdersStoreAPI";
import { Order, OrderStatus } from "../../types/Order";
import { OrdersStackParamList } from "../../types/navigation";
import { colors } from "../../styles/colors";
import { orderDetailStyles } from "./styles";
import { FeedbackModal } from "./components/FeedbackModal";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useNotify } from "../../hooks/notification/useNotify";

type OrderDetailScreenRouteProp = RouteProp<
  OrdersStackParamList,
  "OrderDetail"
>;

export const OrderDetailScreen: React.FC = () => {
  const { goBack } = useCustomNavigation();
  const { success, error, confirm } = useNotify();

  const route = useRoute<OrderDetailScreenRouteProp>();
  const { orderId } = route.params;
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Use selectors from the store to avoid recreating objects every render
  const storeOrders = useOrdersStoreAPI((s) => s.orders);
  const getOrderById = useOrdersStoreAPI((s) => s.getOrderById);
  const cancelOrderApi = useOrdersStoreAPI((s) => s.cancelOrderApi);
  const confirmReception = useOrdersStoreAPI((s) => s.confirmReception);

  // Local cached order from store (if any) - memoized so reference is stable
  const localOrder = useMemo(
    () => getOrderById(orderId),
    [storeOrders, getOrderById, orderId]
  );

  // Fresh order fetched from API endpoint /orders/:id
  const [apiOrder, setApiOrder] = useState<Order | undefined>(undefined);
  const [apiLoading, setApiLoading] = useState<boolean>(false);

  // Debug: log completo del order y sus items al montar para inspección
  useEffect(() => {
    const base = apiOrder ?? localOrder;
    try {
      console.log("[OrderDetail] base order payload:", base);
      if (base && Array.isArray(base.items)) {
        base.items.forEach((it, idx) => {
          console.log(`[OrderDetail] item[${idx}]`, {
            id: it.id,
            name: it.name,
            price: it.price,
            subtotal: it.subtotal,
            quantity: it.quantity,
            image: it.image,
          });
        });
      }
    } catch (err) {
      console.warn("[OrderDetail] Error logging order:", err);
    }
  }, [apiOrder, localOrder]);

  // Enrich items with product info (name, image) when backend returns minimal item data
  const [enrichedOrder, setEnrichedOrder] = useState<Order | null>(null);
  // Track product ids already requested to avoid infinite re-fetching
  const requestedProductIdsRef = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    const base = apiOrder ?? localOrder;
    if (!base) return;

    const enrich = async () => {
      try {
        const items = await Promise.all(
          (base.items || []).map(async (it: any) => {
            // If item already has name or image, skip enrichment
            if (
              (it.name &&
                it.name.length > 0 &&
                it.name !== `Producto ${it.product_id?.slice(-8)}`) ||
              (it.image && it.image.length > 0)
            ) {
              return it;
            }

            if (!it.product_id) return it;

            // Avoid re-requesting same product id repeatedly
            if (requestedProductIdsRef.current.has(it.product_id)) {
              return it;
            }

            try {
              const prod = await ProductService.getProduct(it.product_id);
              if (prod) {
                // mark requested (success)
                requestedProductIdsRef.current.add(it.product_id);
                return {
                  ...it,
                  name: it.name ?? prod.name,
                  image: it.image ?? (prod.image_url || ""),
                };
              }
            } catch (err) {
              console.warn(
                "[OrderDetail] failed to fetch product for item",
                it.product_id,
                err
              );
              // mark requested to avoid retry loops
              requestedProductIdsRef.current.add(it.product_id);
            }

            return it;
          })
        );

        if (!cancelled) {
          // Only update if something changed
          const hasChanges = items.some((item, index) => {
            const original = base.items?.[index];
            return (
              item.name !== original?.name || item.image !== original?.image
            );
          });

          if (hasChanges) {
            setEnrichedOrder({ ...base, items } as any);
          } else {
            setEnrichedOrder(base as any);
          }
        }
      } catch (err) {
        console.warn("[OrderDetail] error enriching order items:", err);
        if (!cancelled) {
          setEnrichedOrder(base as any);
        }
      }
    };

    enrich();

    return () => {
      cancelled = true;
    };
  }, [apiOrder, localOrder]);

  // Fetch fresh order detail from API endpoint if not present locally or to refresh
  useEffect(() => {
    let cancelled = false;
    const fetchDetail = async () => {
      if (!orderId) return;
      setApiLoading(true);
      try {
        const fetched = await OrderService.getOrder(orderId);
        if (!cancelled) {
          // Map API response to frontend format
          const apiData = fetched as any;
          const mappedOrder = {
            ...apiData,
            // Map status from object to string
            status: apiData.status?.code?.toLowerCase() || apiData.status,
            // Map address to deliveryAddress
            deliveryAddress: apiData.address
              ? {
                  street: apiData.address.addressLine1,
                  additionalInfo: apiData.address.addressLine2,
                  city: apiData.address.city,
                  state: apiData.address.state,
                  zipCode: apiData.address.postalCode,
                  country: apiData.address.country,
                  latitude: apiData.address.latitude,
                  longitude: apiData.address.longitude,
                }
              : undefined,
            // Map dates
            createdAt: apiData.created_at
              ? new Date(apiData.created_at)
              : new Date(),
            updatedAt: apiData.updated_at
              ? new Date(apiData.updated_at)
              : new Date(),
            deliveredAt: apiData.delivered_at
              ? new Date(apiData.delivered_at)
              : undefined,
            estimatedDelivery: apiData.delivery_at
              ? new Date(apiData.delivery_at)
              : undefined,
            // Map numeric fields
            subtotal: parseFloat(apiData.subtotal_amount) || 0,
            total: parseFloat(apiData.total_amount) || 0,
            deliveryFee: parseFloat(apiData.price_delivery) || 0,
            discount: 0, // Not provided in API response
            // Map items
            items: (apiData.items || []).map((item: any) => ({
              ...item,
              id: item.id,
              product_id: item.product_id,
              quantity: item.quantity || item.ordered_quantity || 1,
              price: parseFloat(item.unit_price) || 0,
              subtotal: parseFloat(item.total_price) || 0,
              priceBecoin: parseFloat(item.unit_becoin) || 0,
              totalBecoin: parseFloat(item.total_becoin) || 0,
              // These will be enriched later with product info
              name:
                item.name ||
                `Producto ${item.product_id?.slice(-8) || "desconocido"}`,
              image: item.image || undefined,
            })),
            // Map other fields
            deliveryType: "home" as const,
            groupId: apiData.group_id,
            notes: apiData.observation,
            paymentMethod: apiData.payment_type?.code,
            becoinsUsed: parseFloat(apiData.total_becoin) || 0,
          };
          setApiOrder(mappedOrder as any);
        }
      } catch (err) {
        console.warn("[OrderDetail] could not fetch order from API:", err);
      } finally {
        if (!cancelled) setApiLoading(false);
      }
    };

    fetchDetail();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const baseOrder = apiOrder ?? localOrder;
  const displayOrder = enrichedOrder ?? baseOrder;

  if (!baseOrder) {
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
            onPress={() => goBack()}
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
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Safe currency formatter: acepta number | string | undefined and evita llamar toFixed sobre undefined
  const formatCurrency = (amount?: number | string | null): string => {
    if (amount === null || amount === undefined || amount === "")
      return "$0.00";
    const n = typeof amount === "string" ? parseFloat(amount) : amount;
    if (Number.isNaN(n) || n === null || n === undefined) return "$0.00";
    return `$${n.toFixed(2)}`;
  };

  const handleCancelOrder = () => {
    if (baseOrder.status === "pending" || baseOrder.status === "confirmed") {
      confirm({
        message:
          "¿Estás seguro de que quieres cancelar esta orden? Esta acción no se puede deshacer.",
        onConfirm: async () => {
          try {
            await cancelOrderApi(orderId);
            success({
              message: "Tu orden ha sido cancelada exitosamente.",
            });
            // Refrescar los datos de la orden desde el backend
            setTimeout(() => {
              // Forzar refetch de la orden
              setApiOrder(undefined);
            }, 500);
          } catch (err) {
            error({
              message: "No se pudo cancelar la orden. Inténtalo de nuevo.",
            });
          }
        },
      });
    }
  };

  const handleConfirmReception = () => {
    confirm({
      message: "¿Confirmas que has recibido tu orden correctamente?",
      onConfirm: async () => {
        try {
          await confirmReception(orderId);
          success({
            message: "¡Perfecto! Tu orden ha sido marcada como recibida.",
          });
          // Refrescar los datos de la orden desde el backend
          setTimeout(() => {
            setApiOrder(undefined);
            setShowFeedbackModal(true);
          }, 1000);
        } catch (err) {
          error({
            message: "No se pudo confirmar la recepción. Inténtalo de nuevo.",
          });
        }
      },
    });
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
    baseOrder.status === "pending" || baseOrder.status === "confirmed";

  const canConfirmReception = baseOrder.status === "shipped";
  const canLeaveFeedback = baseOrder.status === "delivered";

  return (
    <SafeAreaView style={orderDetailStyles.container}>
      {/* Header naranja */}
      <View style={orderDetailStyles.headerContainer}>
        <View style={orderDetailStyles.headerRow}>
          <TouchableOpacity
            style={orderDetailStyles.headerButton}
            onPress={() => goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <View style={orderDetailStyles.headerTitles}>
            <Text style={orderDetailStyles.headerTitle}>
              Detalle de la orden
            </Text>
            <Text style={orderDetailStyles.headerSubtitle}>
              Orden #{baseOrder.id.slice(-8)}
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
                #{baseOrder.id.slice(-8)}
              </Text>
              <Text style={orderDetailStyles.orderDate}>
                {formatDate(baseOrder.createdAt)}
              </Text>
            </View>
            <View style={orderDetailStyles.statusContainer}>
              <View
                style={[
                  orderDetailStyles.statusBadge,
                  { backgroundColor: getStatusColor(baseOrder.status) },
                ]}
              >
                <MaterialCommunityIcons
                  name={getStatusIcon(baseOrder.status)}
                  size={16}
                  color="white"
                />
                <Text style={orderDetailStyles.statusText}>
                  {getStatusText(baseOrder.status)}
                </Text>
              </View>
            </View>
          </View>

          {baseOrder.status !== "cancelled" && (
            <View style={orderDetailStyles.progressContainer}>
              <Text style={orderDetailStyles.progressLabel}>
                Progreso del pedido
              </Text>
              <View style={orderDetailStyles.progressTrack}>
                <View
                  style={[
                    orderDetailStyles.progressFill,
                    { width: `${getProgressPercentage(baseOrder.status)}%` },
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
                  baseOrder.deliveryType === "home"
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
                  baseOrder.deliveryType === "home"
                    ? "home-outline"
                    : "account-group-outline"
                }
                size={20}
                color={colors.textSecondary}
              />
              <Text style={orderDetailStyles.infoText}>
                {baseOrder.deliveryType === "home"
                  ? "Envío a domicilio"
                  : "Juntada circular"}
              </Text>
            </View>

            {baseOrder.deliveryAddress && (
              <View style={orderDetailStyles.addressContainer}>
                <Text style={orderDetailStyles.addressTitle}>
                  📍 Dirección de entrega
                </Text>
                <Text style={orderDetailStyles.addressText}>
                  {baseOrder.deliveryAddress.street}
                </Text>
                <Text style={orderDetailStyles.addressText}>
                  {baseOrder.deliveryAddress.city},{" "}
                  {baseOrder.deliveryAddress.state}
                </Text>
                <Text style={orderDetailStyles.addressText}>
                  CP: {baseOrder.deliveryAddress.zipCode}
                </Text>
                {baseOrder.deliveryAddress.additionalInfo && (
                  <Text style={orderDetailStyles.addressText}>
                    {baseOrder.deliveryAddress.additionalInfo}
                  </Text>
                )}
              </View>
            )}

            {baseOrder.groupId && (
              <View style={orderDetailStyles.infoRow}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={20}
                  color={colors.textSecondary}
                />
                <Text style={orderDetailStyles.infoText}>
                  Grupo: {baseOrder.groupId}
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
              Productos ({(displayOrder?.items || []).length})
            </Text>
          </View>

          <View style={orderDetailStyles.itemsList}>
            {(displayOrder?.items || []).map((item) => (
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
                  {((item as any).priceBecoin ||
                    (item as any).price_becoin) && (
                    <Text
                      style={[
                        orderDetailStyles.itemPrice,
                        {
                          fontSize: 12,
                          color: colors.belandOrange,
                          fontWeight: "700",
                        },
                      ]}
                    >
                      {`${(
                        (item as any).priceBecoin ?? (item as any).price_becoin
                      ).toString()} becoins c/u`}
                    </Text>
                  )}
                </View>
                <View style={orderDetailStyles.itemQuantity}>
                  {item.quantity && item.quantity > 1 ? (
                    <View style={orderDetailStyles.quantityBadge}>
                      <Text style={orderDetailStyles.quantityText}>
                        x{item.quantity}
                      </Text>
                    </View>
                  ) : (
                    <View style={{ width: 40 }} />
                  )}
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
                {formatCurrency(baseOrder.subtotal)}
              </Text>
            </View>
            {/* Mostrar total en becoins si está disponible */}
            {(baseOrder.becoinsUsed || (baseOrder as any).total_becoin) && (
              <View style={orderDetailStyles.summaryRow}>
                <Text style={orderDetailStyles.summaryLabel}>
                  Total (becoins):
                </Text>
                <Text
                  style={[
                    orderDetailStyles.summaryValue,
                    { color: colors.belandOrange, fontWeight: "700" },
                  ]}
                >
                  {`${(
                    (baseOrder as any).becoinsUsed ??
                    (baseOrder as any).total_becoin
                  ).toString()} becoins`}
                </Text>
              </View>
            )}
            {baseOrder.deliveryFee > 0 && (
              <View style={orderDetailStyles.summaryRow}>
                <Text style={orderDetailStyles.summaryLabel}>Envío:</Text>
                <Text style={orderDetailStyles.summaryValue}>
                  {formatCurrency(baseOrder.deliveryFee)}
                </Text>
              </View>
            )}
            {baseOrder.discount > 0 && (
              <View style={orderDetailStyles.summaryRow}>
                <Text style={orderDetailStyles.summaryLabel}>Descuento:</Text>
                <Text
                  style={[
                    orderDetailStyles.summaryValue,
                    orderDetailStyles.discountText,
                  ]}
                >
                  -{formatCurrency(baseOrder.discount)}
                </Text>
              </View>
            )}
            <View style={orderDetailStyles.totalRow}>
              <View style={orderDetailStyles.summaryRow}>
                <Text style={orderDetailStyles.totalLabel}>Total:</Text>
                <Text style={orderDetailStyles.totalValue}>
                  {formatCurrency(baseOrder.total)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notes */}
        {baseOrder.notes && (
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
              <Text style={orderDetailStyles.notesText}>{baseOrder.notes}</Text>
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
