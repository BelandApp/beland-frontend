import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Image,
  Dimensions,
  Modal,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import {
  X,
  Plus,
  Minus,
  Search,
  Heart,
  CheckCircle,
  ShoppingBag,
  ArrowRight,
} from "lucide-react-native";
import { useAuth } from "src/context/AuthContext";
import { GroupService } from "@/services/GroupApiService";
import { ProductService } from "@/services/ProductApiService";
import { OrderService } from "@/services/OrderApiService";
import { Product, Category } from "src/types";

import { useGroupPurchaseCart } from "src/screens/Groups/hooks/useGroupPurchaseCart";
import { useNotify } from "src/hooks/notification/useNotify";
import { CustomLoader } from "@/components/shared/loader/Loader";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 48) / 2;

interface GroupPurchaseScreenProps {
  groupId: string;
}

// --- ORDER HELPER & CONSTANTS ---
const ORDER_STATUSES = {
  pending: { label: "Pendiente", color: "#F88D2A", icon: "clock" },
  confirmed: { label: "Confirmada", color: "#0066CC", icon: "check-circle" },
  processing: { label: "Procesando", color: "#6BA43A", icon: "loader" },
  shipped: { label: "Enviada", color: "#9333EA", icon: "truck" },
  delivered: { label: "Entregada", color: "#22C55E", icon: "package" },
  cancelled: { label: "Cancelada", color: "#DC2626", icon: "x-circle" },
};

const formatCurrency = (amount: any) => {
  const val = Number(amount);
  if (isNaN(val)) return "$0.00";
  return `$${val.toFixed(2)}`;
};

const OrderDetailsModal = ({
  visible,
  order,
  onClose,
}: {
  visible: boolean;
  order: any;
  onClose: () => void;
}) => {
  const [fullOrder, setFullOrder] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (visible && order) {
      setFullOrder(order);
      if (!order.items || order.items.length === 0) {
        fetchFullOrder(order.id);
      }
    }
  }, [visible, order]);

  const fetchFullOrder = async (id: string) => {
    try {
      setLoadingDetails(true);
      const res = await OrderService.getOrder(id);
      setFullOrder(res);
    } catch (err) {
      console.error("Failed to load full order", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  if (!visible || !fullOrder) return null;

  const statusInfo =
    ORDER_STATUSES[fullOrder.status as keyof typeof ORDER_STATUSES] ||
    ORDER_STATUSES.pending;
  const dateStr = new Date(fullOrder.created_at).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 justify-center items-center p-4">
        <View className="bg-white w-full max-w-md rounded-2xl overflow-hidden max-h-[80%]">
          {/* Header */}
          <View className="p-4 flex-row justify-between items-center border-b border-gray-100 bg-gray-50">
            <View>
              <Text className="text-lg font-bold text-gray-900">
                Orden #
                {fullOrder.order_number ||
                  (fullOrder.id && fullOrder.id.slice(0, 6)) ||
                  "---"}
              </Text>
              <Text className="text-gray-500 text-xs">{dateStr}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="p-2 bg-gray-200 rounded-full"
            >
              <X size={16} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-4">
            {/* Status */}
            <View className="flex-row items-center justify-between mb-6 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
              <Text className="text-gray-500 font-medium">Estado</Text>
              <View
                className="px-3 py-1 rounded-full flex-row items-center gap-2"
                style={{ backgroundColor: `${statusInfo.color}15` }}
              >
                <Feather
                  name={statusInfo.icon as any}
                  size={14}
                  color={statusInfo.color}
                />
                <Text
                  className="font-bold text-sm capitalize"
                  style={{ color: statusInfo.color }}
                >
                  {statusInfo.label}
                </Text>
              </View>
            </View>

            {/* Items */}
            <Text className="font-bold text-gray-900 mb-3 text-base">
              Productos ({fullOrder.items?.length || 0})
            </Text>
            {loadingDetails ? (
              <ActivityIndicator color="orange" />
            ) : (
              (fullOrder.items || []).map((item: any) => (
                <View
                  key={item.id}
                  className="flex-row items-center mb-4 border-b border-gray-50 pb-3 last:border-0"
                >
                  <View className="w-12 h-12 bg-gray-100 rounded-lg mr-3 overflow-hidden border border-gray-100">
                    {item.product?.image_url && (
                      <Image
                        source={{ uri: item.product.image_url }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-800 text-sm">
                      {item.product?.name || "Producto"}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {item.quantity} x {formatCurrency(item.unit_price)}
                    </Text>
                  </View>
                  <Text className="font-bold text-gray-900">
                    {formatCurrency(item.total_price)}
                  </Text>
                </View>
              ))
            )}

            {/* Totals */}
            <View className="mt-4 bg-gray-50 p-4 rounded-xl space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Subtotal</Text>
                <Text className="font-semibold text-gray-900">
                  {formatCurrency(fullOrder.subtotal)}
                </Text>
              </View>
              <View className="flex-row justify-between pt-2 border-t border-gray-200">
                <Text className="font-bold text-lg text-gray-900">Total</Text>
                <Text className="font-bold text-lg text-orange-600">
                  {formatCurrency(fullOrder.total_amount)}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export const GroupPurchaseScreen: React.FC<GroupPurchaseScreenProps> = ({
  groupId,
}) => {
  const { user } = useAuth();
  const notify = useNotify();
  const navigation = useNavigation<any>();

  // --- TABS STATE ---
  const [activeTab, setActiveTab] = useState<"catalog" | "history">("catalog");

  // --- DATA STATE ---
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);

  // --- ORDERS STATE ---
  const [orders, setOrders] = useState<any[]>([]); // Using any for Order to avoid strict type issues with backend differences
  const [loadingOrders, setLoadingOrders] = useState(false);

  // --- UI STATE ---
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false); // Prevent double-click

  // Details Modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  // --- HOOKS ---
  const {
    cart,
    addProductToCart,
    updateProductQuantity,
    updateCartItemQuantity,
    getTotalPrice,
    getTotalItems,
    clearCart,
    refetchCart,
  } = useGroupPurchaseCart(groupId);

  // --- INITIAL LOAD ---
  useEffect(() => {
    if (groupId) {
      loadInitialData();
      loadMembers();
    }
  }, [groupId]);

  // --- TAB EFFECT ---
  // Fetch orders when tab switches to 'history'
  useEffect(() => {
    if (activeTab === "history" && groupId) {
      loadOrders();
    }
  }, [activeTab, groupId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [groupData, productsRes, categoriesRes] = await Promise.all([
        GroupService.getGroup(groupId),
        ProductService.getProducts({ limit: 100 }),
        ProductService.getCategories(),
      ]);
      setGroup(groupData);
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      notify.error({ message: "Error al cargar el catálogo" });
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const res = await GroupService.getGroupMembers(groupId);
      setMembers(res);
    } catch (err) {
      console.error("Error loading members", err);
    }
  };

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await OrderService.getGroupOrders(groupId);
      // Sort: Newest first
      const sorted = (response.data || []).sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setOrders(sorted);
    } catch (error) {
      console.error("Error loading orders:", error);
      notify.error({ message: "No se pudieron cargar las órdenes" });
    } finally {
      setLoadingOrders(false);
    }
  };

  // --- FILTERING ---
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || p.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const isLeader = user?.id === group?.user_id;

  // --- ACTIONS ---

  // --- ASSIGNMENT LOGIC (SELF-SERVICE) ---
  const getProductAssignments = useCallback(
    (productId: string) => {
      if (!cart || !cart.items)
        return { count: 0, userIds: [], personalQty: 0, generalQty: 0 };

      const productItems = cart.items.filter((i) => i.product_id === productId);

      // Personal Items (Assigned to me)
      const personalItems = productItems.filter((i) => i.user_id === user?.id);
      const personalQty = personalItems.reduce((sum, i) => sum + i.quantity, 0);

      // General Items (Unassigned)
      const generalItems = productItems.filter((i) => !i.user_id);
      const generalQty = generalItems.reduce((sum, i) => sum + i.quantity, 0);

      // Other users
      const otherUsersAssigned = productItems
        .filter((i) => i.user_id && i.user_id !== user?.id)
        .reduce((acc, i) => acc + i.quantity, 0);

      // SIMPLIFIED LOGIC FOR CONSUMPTION MODE:
      // If in consumption mode, ALL units of this product (General + Personal)
      // are considered assigned to the current user
      const totalQty = personalQty + generalQty;

      // Calculate consumption mode inline to avoid scope issues
      const isConsumption =
        group?.payment_type?.code &&
        group.payment_type.code !== "EQUAL_SPLIT" &&
        group.payment_type.code !== "FULL";

      const userIds: string[] = [];
      if (isConsumption && user?.id) {
        // In consumption mode, all units belong to current user
        for (let i = 0; i < totalQty; i++) {
          userIds.push(user.id);
        }
      } else {
        // In non-consumption mode, only count personal items
        for (let i = 0; i < personalQty; i++) {
          if (user?.id) userIds.push(user.id);
        }
      }

      const totalAssigned = isConsumption
        ? totalQty
        : personalQty + otherUsersAssigned;

      return {
        count: totalAssigned,
        userIds,
        personalQty,
        generalQty,
      };
    },
    [cart, user?.id, group?.payment_type?.code],
  );

  const handleAssignSelf = async (productId: string) => {
    // Move 1 item from General -> Personal
    try {
      const stats = getProductAssignments(productId);

      if (stats.generalQty <= 0) {
        notify.info({ message: "No quedan items libres para asignar." });
        return;
      }

      // 1. Decrease General
      // Find general item ID
      const generalItem = cart?.items.find(
        (i) => i.product_id === productId && !i.user_id,
      );

      if (generalItem) {
        await updateCartItemQuantity(generalItem.id, stats.generalQty - 1);
      } else {
        notify.error({ message: "No se encontró el item general." });
        return;
      }

      // 2. Increase Personal
      // Use addToCart with is_general=false to create/increment personal item
      // We pass 1 because addToCart increments.
      // FIX: Must pass valid price. Find item in cart or product list.
      const itemInCart = cart?.items.find((i) => i.product_id === productId);
      // Fallback to searching in products list if not in cart (though it should be for assignment)
      const productInfo =
        itemInCart?.product || products.find((p) => p.id === productId);
      const price =
        itemInCart?.unit_price ||
        (typeof productInfo?.price === "string"
          ? parseFloat(productInfo.price)
          : productInfo?.price) ||
        0;

      await addProductToCart(
        {
          id: productId,
          price: price, // Ensure price is passed
          name: productInfo?.name || "Product", // Fallback fields
          description: productInfo?.description,
        } as any,
        1,
        false, // is_general = false -> Personal
      );

      notify.success({ message: "Te asignaste 1 unidad." });
      await refetchCart();
    } catch (error) {
      console.error("Error assigning self:", error);
      notify.error({ message: "Error al asignar producto." });
    }
  };

  const handleUnassignSelf = async (productId: string) => {
    try {
      if (!user?.id) return;

      // Find all personal items for this product
      const personalItems = cart?.items.filter(
        (i) => i.product_id === productId && i.user_id === user?.id,
      );

      if (!personalItems || personalItems.length === 0) {
        notify.info({
          message: "No tienes unidades asignadas de este producto.",
        });
        return;
      }

      // In consumption mode, just decrease the personal quantity
      // Don't create General items
      const totalPersonalQty = personalItems.reduce(
        (sum, i) => sum + i.quantity,
        0,
      );

      if (totalPersonalQty <= 0) {
        return;
      }

      // Decrease quantity of the first personal item by 1
      const firstItem = personalItems[0];
      await updateCartItemQuantity(firstItem.id, firstItem.quantity - 1);

      notify.success({ message: "Eliminaste 1 unidad de tu asignación." });
      await refetchCart();
    } catch (error) {
      console.error("Error unassigning self:", error);
      notify.error({ message: "Error al remover asignación." });
    }
  };

  // --- GROUPING LOGIC ---
  const groupedItems = useMemo(() => {
    if (!cart?.items) return [];
    const map = new Map<string, any>();

    cart.items.forEach((item) => {
      const existing = map.get(item.product_id);
      if (existing) {
        existing.quantity += item.quantity;
        // DON'T sum total_price, keep unit_price and calculate display price separately
      } else {
        map.set(item.product_id, {
          ...item,
          quantity: item.quantity,
          unit_price: item.unit_price, // Keep unit price
          total_price: item.total_price, // Keep original for first item
        });
      }
    });
    return Array.from(map.values());
  }, [cart]);

  const handleGroupedQuantityChange = async (
    productId: string,
    delta: number,
  ) => {
    // Delta +1 or -1
    if (delta > 0) {
      // Increase: Always add to General? Or Personal?
      // Let's add to General for quick +/- on main row
      // To add to General, we pass is_general=true
      // But we need price/info.
      const item = groupedItems.find((i) => i.product_id === productId);
      if (!item) return;

      // Find correct price
      const productInfo =
        item.product || products.find((p) => p.id === productId);
      const price =
        (typeof productInfo?.price === "string"
          ? parseFloat(productInfo.price)
          : productInfo?.price) || 0;

      await addProductToCart(
        {
          id: productId,
          price,
          name: productInfo?.name,
          description: productInfo?.description,
        } as any,
        1,
        true, // General
      );
    } else {
      // Decrease
      // 1. Try decrease General
      const generalItem = cart?.items.find(
        (i) => i.product_id === productId && !i.user_id,
      );

      if (generalItem && generalItem.quantity > 0) {
        await updateCartItemQuantity(generalItem.id, generalItem.quantity - 1);
      } else {
        // 2. Try decrease Personal (if General is 0)
        if (!user?.id) return;
        const personalItem = cart?.items.find(
          (i) => i.product_id === productId && i.user_id === user.id,
        );

        if (personalItem && personalItem.quantity > 0) {
          await updateCartItemQuantity(
            personalItem.id,
            personalItem.quantity - 1,
          );
        } else {
          notify.info({
            message: "No puedes eliminar items asignados a otros.",
          });
        }
      }
    }
  };

  // --- CONSUMPTION MODE CHECK ---
  const isConsumptionMode =
    group?.payment_type?.code &&
    group.payment_type.code !== "EQUAL_SPLIT" &&
    group.payment_type.code !== "FULL";

  // --- ACTIONS ---
  const handleQuickAdd = async (product: Product) => {
    console.log("[DEBUG handleQuickAdd] product.id:", product.id);
    console.log("[DEBUG handleQuickAdd] isConsumptionMode:", isConsumptionMode);
    console.log("[DEBUG handleQuickAdd] user?.id:", user?.id);

    // In Consumption Mode, auto-assign to self. Otherwise, add as General.
    const isGeneral = !isConsumptionMode; // If NOT consumption mode, add as general
    console.log("[DEBUG handleQuickAdd] isGeneral:", isGeneral);

    const existingItem = cart?.items.find((item) => {
      const matches = isGeneral
        ? item.product_id === product.id && !item.user_id
        : item.product_id === product.id && item.user_id === user?.id;

      if (matches) {
        console.log("[DEBUG handleQuickAdd] Found existing item:", item);
      }
      return matches;
    });

    console.log("[DEBUG handleQuickAdd] existingItem:", existingItem);

    if (existingItem) {
      // Item exists, increment quantity
      const success = await updateCartItemQuantity(
        existingItem.id,
        existingItem.quantity + 1,
      );
      if (success) {
        const message = isConsumptionMode
          ? "Agregado y asignado a ti"
          : "Agregado al inventario grupal";
        notify.success({ message });
      }
      return;
    }

    // Item doesn't exist, create new one
    const success = await addProductToCart(
      {
        id: product.id,
        name: product.name,
        price:
          typeof product.price === "string"
            ? parseFloat(product.price)
            : product.price,
        image_url: product.image_url,
        description: product.description,
      },
      1,
      isGeneral,
    );
    if (success) {
      const message = isConsumptionMode
        ? "Agregado y asignado a ti"
        : "Agregado al inventario grupal (General)";
      notify.success({ message });
    }
  };

  const isAssignmentComplete = useMemo(() => {
    if (!cart || !isConsumptionMode) return true;
    return cart.items.every((item) => {
      // Check if all items are assigned (i.e., general/unassigned qty is 0)
      const stats = getProductAssignments(item.product_id);
      return stats.generalQty === 0;
    });
  }, [cart, getProductAssignments, isConsumptionMode]);

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) return;

    setProcessingOrder(true);
    try {
      // AUTO-ASSIGN: In consumption mode, convert all General items to Personal
      if (isConsumptionMode && user?.id) {
        const generalItems = cart.items.filter((i) => !i.user_id);

        if (generalItems.length > 0) {
          console.log(
            "[AUTO-ASSIGN] Converting",
            generalItems.length,
            "General items to Personal",
          );

          // For each General item, delete it and recreate as Personal
          for (const genItem of generalItems) {
            try {
              const price =
                typeof genItem.unit_price === "string"
                  ? parseFloat(genItem.unit_price)
                  : genItem.unit_price || 0;

              // Delete General item (set quantity to 0)
              await updateCartItemQuantity(genItem.id, 0);

              // Recreate as Personal
              await addProductToCart(
                {
                  id: genItem.product_id,
                  price,
                  name: genItem.product?.name || "Product",
                  description: genItem.product?.description,
                },
                genItem.quantity,
                false, // is_general = false -> Personal
              );
            } catch (err) {
              console.error("[AUTO-ASSIGN] Error converting item:", err);
            }
          }

          // Refresh cart to get updated items
          await refetchCart();
          notify.success({ message: "Productos asignados automáticamente" });
        }
      }

      if (!group?.payment_type_id) {
        throw new Error(`El grupo no tiene un método de pago configurado.`);
      }

      // CRITICAL: Operate ONLY on the Group Cart.
      // 1. Link Cart to Group (Backend needs to know group_id from cart to find consumptions)
      await GroupService.updateCartGroup(cart.id, groupId);
      // 2. Set Payment Type
      await GroupService.updateCartPaymentType(cart.id, group.payment_type_id);

      // --- SYNC CHECK: Force refresh ---
      await refetchCart(); // Ensure cart totals are fresh

      // ONLY check sync/assignment for Consumption Mode (Manual Assignment)
      if (isConsumptionMode) {
        // FALLBACK: Auto-assign unassigned items to Admin (CurrentUser)
        // Check for any unassigned items (General items)
        for (const item of cart.items) {
          // We can check if it has NO user_id (General)
          if (!item.user_id) {
            const missing = item.quantity;
            if (missing > 0) {
              console.log(
                `[Auto-Assign] Assigning ${missing} of ${item.product_id} to Admin`,
              );
              // Move General -> Personal (Admin)
              // 1. Decrease General
              await updateProductQuantity(item.product_id, 0, undefined);
              // 2. Increase Personal (Admin)
              await updateProductQuantity(
                item.product_id,
                (getProductAssignments(item.product_id).personalQty || 0) +
                  missing,
                user?.id,
              );
              // Note: Better to use addToCart for creating personal item if it doesn't exist?
              // updateProductQuantity handles update. If row doesn't exist?
              // GroupService.updateItemQuantityByProduct calls PUT. If row missing?
              // Repository findByProduct needs to find it.
              // If I have 0 personal items, I must CREATE one.
              // So reliable way:
              // 1. Decrease General
              // 2. Add to Cart (Personal) for +missing quantity
              await updateProductQuantity(item.product_id, 0, undefined); // Remove General

              await addProductToCart(
                { id: item.product_id } as any,
                missing,
                false, // is_general = false -> Personal
              );
            }
          }
        }

        await refetchCart();
        // Check if fully assigned
        const stillUnassigned = cart.items.some((i) => !i.user_id); // If any general item remains
        if (stillUnassigned) {
          console.warn("Still have unassigned items after fallback.");
        }
      }

      // Retry logic for 409 / Race conditions
      let attempts = 0;
      const maxAttempts = 2;
      let result = null;

      while (attempts < maxAttempts) {
        try {
          // REMOVED DELAY as requested
          // const delay = attempts === 0 ? 1000 : 2000;
          // await new Promise((resolve) => setTimeout(resolve, delay));

          result = await OrderService.createOrder({
            cart_id: cart.id,
            payment_type_id: group.payment_type_id,
          });
          break; // Success
        } catch (err: any) {
          attempts++;
          console.warn(`Order attempt ${attempts} failed:`, err);

          if (attempts >= maxAttempts) throw err;

          // On retry, try to force sync again
          try {
            await refetchCart();
            // Just hit the summary endpoint to wake up backend cache?
            await GroupService.getSummaryConsumptions(groupId);
          } catch (e) {
            /* ignore sync errors on retry */
          }
        }
      }

      if (result) {
        setCheckoutModalVisible(false);
        await refetchCart();
        notify.success({
          message: "¡Orden Creada!",
        });
        clearCart();
        // Switch to History tab so user sees their new order
        setActiveTab("history");
      }
    } catch (error: any) {
      console.error(error);
      notify.error({ message: error.message || "Error al procesar la orden" });
    } finally {
      setProcessingOrder(false);
    }
  };

  // --- RENDERERS ---

  const renderCategoryItem = ({
    item,
  }: {
    item: Category | { id: string; name: string };
  }) => (
    <TouchableOpacity
      onPress={() => setSelectedCategory(item.id)}
      className={`mr-2 px-4 py-2 rounded-full border ${
        selectedCategory === item.id
          ? "bg-orange-500 border-orange-500"
          : "bg-white border-gray-200"
      }`}
    >
      <Text
        className={`font-semibold text-xs ${
          selectedCategory === item.id ? "text-white" : "text-gray-600"
        }`}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: Product }) => {
    const price =
      typeof item.price === "number" ? item.price : parseFloat(item.price);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        className="bg-white rounded-2xl mb-4 overflow-hidden border border-gray-100 shadow-sm"
        style={{ width: ITEM_WIDTH, elevation: 2 }}
        onPress={() => handleQuickAdd(item)}
      >
        <View className="h-40 bg-gray-50 relative">
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              className="w-full h-full"
              resizeMode="contain"
            />
          ) : (
            <View className="w-full h-full items-center justify-center bg-gray-100">
              <ShoppingBag size={32} color="#CBD5E1" />
            </View>
          )}

          <TouchableOpacity
            onPress={() => handleQuickAdd(item)}
            className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-sm border border-gray-100"
          >
            <Plus size={16} color="#F88D2A" />
          </TouchableOpacity>
        </View>

        <View className="p-3">
          <Text
            numberOfLines={1}
            className="font-bold text-gray-800 text-sm mb-1"
          >
            {item.name}
          </Text>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-orange-600 font-extrabold text-base">
              ${price.toFixed(0)}
            </Text>
            <Text className="text-gray-400 text-[10px] font-bold">USD</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderOrderCard = ({ item }: { item: any }) => {
    const statusInfo =
      ORDER_STATUSES[item.status as keyof typeof ORDER_STATUSES] ||
      ORDER_STATUSES.pending;

    // Formatting Date
    const dateObj = new Date(item.created_at);
    // const day = dateObj.getDate();
    // const month = dateObj.toLocaleDateString("es-AR", { month: "short" });
    const fullDate = dateObj.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Item Handling
    const hasItems = item.items && item.items.length > 0;
    const itemCount = hasItems ? item.items.length : 0;

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedOrder(item);
          setDetailsModalVisible(true);
        }}
        activeOpacity={0.9}
        className="bg-white rounded-3xl mb-5 shadow-sm border border-gray-100 overflow-hidden"
        style={{ elevation: 4 }}
      >
        {/* Color Bar */}
        <View
          className="h-1.5 w-full"
          style={{ backgroundColor: statusInfo.color }}
        />

        <View className="p-5">
          {/* Top Row: Order Badge & Status */}
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <View className="flex-row items-center gap-2 mb-1">
                <View className="bg-gray-100 px-2 py-1 rounded-md">
                  <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Orden
                  </Text>
                </View>
                <Text className="text-xs text-gray-400 capitalize font-medium">
                  {fullDate}
                </Text>
              </View>
              <Text className="text-2xl font-black text-gray-900 tracking-tight">
                #
                {item.order_number || (item.id && item.id.slice(0, 6)) || "???"}
              </Text>
            </View>

            <View className="items-end">
              {/* Status Pill */}
              <View
                className="px-3 py-1.5 rounded-full flex-row items-center gap-1.5 border"
                style={{
                  backgroundColor: `${statusInfo.color}10`,
                  borderColor: `${statusInfo.color}20`,
                }}
              >
                <Feather
                  name={statusInfo.icon as any}
                  size={11}
                  color={statusInfo.color}
                />
                <Text
                  className="text-[10px] font-bold uppercase tracking-wide"
                  style={{ color: statusInfo.color }}
                >
                  {statusInfo.label}
                </Text>
              </View>
            </View>
          </View>

          {/* Middle Row: Price */}
          <View className="mb-4">
            <Text className="text-sm text-gray-400 font-medium mb-0.5">
              Total
            </Text>
            <Text className="text-3xl font-black text-gray-900 leading-tight">
              {formatCurrency(item.total_amount)}
            </Text>
          </View>

          <View className="h-[1px] bg-gray-50 w-full mb-3" />

          {/* Footer: Items Preview or Info */}
          <View className="flex-row items-center justify-between">
            {hasItems ? (
              <View className="flex-row items-center gap-2">
                <View className="flex-row pl-2">
                  {item.items.slice(0, 3).map((prod: any, idx: number) => (
                    <View
                      key={idx}
                      className="-ml-2 w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm"
                    >
                      {prod.product?.image_url ? (
                        <Image
                          source={{ uri: prod.product.image_url }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-full h-full items-center justify-center">
                          <ShoppingBag size={10} color="#CBD5E1" />
                        </View>
                      )}
                    </View>
                  ))}
                  {itemCount > 3 && (
                    <View className="-ml-2 w-8 h-8 rounded-full border-2 border-white bg-gray-100 items-center justify-center">
                      <Text className="text-[9px] font-bold text-gray-600">
                        +{itemCount - 3}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-xs text-gray-500 font-medium ml-1">
                  {itemCount} {itemCount === 1 ? "producto" : "productos"}
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-2 opacity-60">
                <ShoppingBag size={16} color="#6B7280" />
                <Text className="text-xs text-gray-500 font-medium italic">
                  Ver detalles de productos
                </Text>
              </View>
            )}

            <View className="w-9 h-9 rounded-full bg-gray-50 flex-row items-center justify-center border border-gray-100">
              <Feather name="chevron-right" size={18} color="#9CA3AF" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <CustomLoader />
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-white"
      style={
        Platform.OS === "web"
          ? ({
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              height: "100%",
              overflow: "hidden",
            } as any)
          : { flex: 1 }
      }
    >
      {/* 1. Header Tabs (Fixed Top) */}
      <View className="bg-white px-4 pt-2 border-b border-gray-100 flex-row z-10">
        <TouchableOpacity
          onPress={() => setActiveTab("catalog")}
          className={`mr-6 pb-3 ${activeTab === "catalog" ? "border-b-2 border-orange-500" : ""}`}
        >
          <Text
            className={`font-bold text-base ${activeTab === "catalog" ? "text-orange-500" : "text-gray-400"}`}
          >
            Catálogo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("history")}
          className={`mr-6 pb-3 ${activeTab === "history" ? "border-b-2 border-orange-500" : ""}`}
        >
          <Text
            className={`font-bold text-base ${activeTab === "history" ? "text-orange-500" : "text-gray-400"}`}
          >
            Mis Órdenes
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT AREA */}
      {activeTab === "catalog" ? (
        <>
          {/* CATALOG HEADER - SEARCH */}
          <View className="bg-white">
            <View className="px-4 py-3">
              <View className="flex-row items-center bg-gray-100 rounded-xl px-3 h-11">
                <Search size={18} color="#9CA3AF" />
                <TextInput
                  placeholder="Buscar bebidas, snacks..."
                  className="flex-1 ml-2 font-medium text-gray-700 h-full"
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            {/* Categories */}
            <FlatList
              data={[{ id: "all", name: "Todos" }, ...categories]}
              renderItem={renderCategoryItem}
              keyExtractor={(item: any) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 12,
              }}
            />
          </View>

          {/* PRODUCT GRID */}
          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            numColumns={2}
            keyExtractor={(item) => item.id}
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingTop: 16,
              paddingHorizontal: 16,
              paddingBottom: 150,
            }}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            showsVerticalScrollIndicator={true}
            ListEmptyComponent={
              <View className="items-center justify-center mt-20 opacity-50">
                <ShoppingBag size={48} color="#9CA3AF" />
                <Text className="text-gray-500 font-medium mt-4">
                  No se encontraron productos.
                </Text>
              </View>
            }
          />

          {/* FLOATING CART (Only on Catalog) */}
          {cart && cart.items.length > 0 && (
            <View className="absolute bottom-6 left-4 right-4 z-20">
              <TouchableOpacity
                onPress={() => setCheckoutModalVisible(true)}
                className="bg-gray-900 rounded-2xl p-4 flex-row items-center justify-between shadow-xl shadow-black/20"
                activeOpacity={0.9}
              >
                <View className="flex-row items-center gap-3">
                  <View className="bg-white/20 rounded-full w-10 h-10 items-center justify-center border border-white/10">
                    <Text className="text-white font-bold">
                      {getTotalItems()}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                      Total
                    </Text>
                    <Text className="text-white font-bold text-lg">
                      ${getTotalPrice().toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-2 bg-white px-4 py-2 rounded-xl">
                  <Text className="text-gray-900 font-bold text-sm">
                    Ver Carrito
                  </Text>
                  <ArrowRight size={16} color="black" />
                </View>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : (
        // HISTORY CONTENT
        <View className="flex-1 bg-gray-50">
          {loadingOrders && !orders.length ? (
            <View className="flex-1 items-center justify-center">
              <CustomLoader />
            </View>
          ) : (
            <FlatList
              data={orders}
              renderItem={renderOrderCard}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
              refreshing={loadingOrders}
              onRefresh={loadOrders}
              ListEmptyComponent={
                <View className="items-center justify-center mt-20">
                  <ShoppingBag size={48} color="#D1D5DB" />
                  <Text className="text-gray-400 mt-4 font-medium text-center">
                    No hay historial de órdenes para este grupo.
                  </Text>
                </View>
              }
            />
          )}
        </View>
      )}

      {/* Checkout/Cart Modal (Shared) */}
      <OrderDetailsModal
        visible={detailsModalVisible}
        order={selectedOrder}
        onClose={() => setDetailsModalVisible(false)}
      />
      <Modal
        visible={checkoutModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCheckoutModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[90%] w-full flex-col">
            <View className="p-4 border-b border-gray-100 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-900">
                Resumen de Compra
              </Text>
              <TouchableOpacity
                onPress={() => setCheckoutModalVisible(false)}
                className="bg-gray-100 p-2 rounded-full"
              >
                <X size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView
              className="p-4 flex-1"
              showsVerticalScrollIndicator={false}
            >
              {isConsumptionMode && (
                <View className="bg-blue-50 p-3 rounded-xl mb-4 flex-row gap-2 border border-blue-100">
                  <Feather
                    name="info"
                    size={16}
                    color="#2563EB"
                    className="mt-0.5"
                  />
                  <Text className="text-blue-700 text-xs flex-1 font-medium">
                    Modo Consumo: Debes asignar cada producto a quien lo
                    consumirá para confirmar la orden.
                  </Text>
                </View>
              )}

              <View className="mb-6">
                {groupedItems.map((item) => {
                  const assignments = getProductAssignments(item.product_id);
                  const missing = item.quantity - assignments.count;

                  // Use the first valid product info available
                  const productInfo =
                    item.product ||
                    products.find((p) => p.id === item.product_id);

                  return (
                    <View
                      key={item.product_id}
                      className="py-4 border-b border-gray-50 bg-white"
                    >
                      {/* Item Row */}
                      <View className="flex-row items-center mb-3">
                        <View className="w-16 h-16 bg-gray-100 rounded-lg mr-3 overflow-hidden border border-gray-100">
                          {productInfo?.image_url && (
                            <Image
                              source={{ uri: productInfo.image_url }}
                              className="w-full h-full"
                              resizeMode="contain"
                            />
                          )}
                        </View>
                        <View className="flex-1">
                          <Text className="font-semibold text-gray-800 text-sm mb-1">
                            {productInfo?.name}
                          </Text>
                          <Text className="text-orange-600 font-bold text-sm">
                            $
                            {(
                              Number(item.unit_price || 0) * item.quantity
                            ).toFixed(2)}
                          </Text>
                        </View>

                        {/* Qty Controls */}
                        <View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200 h-8">
                          <TouchableOpacity
                            onPress={() =>
                              // Decrease: We need to decide WHAT to decrease.
                              // Logic: Decrease General first, then Personal?
                              // Or simply decrease 'General' if available, else notify?
                              // Current logic in updateCartItemQuantity targets SPECIFIC id.
                              // Since we are grouped, we can't easily use updateCartItemQuantity on "item.id" because "item" is synthetic.

                              // BETTER APPROACH for Grouped Row:
                              // If I click Minus:
                              // 1. Try to remove from My Personal Assignment first? Or General First?
                              // Usually General is "unassigned". So remove General first.
                              // If General is 0, remove my personal?

                              // Simplified: Just use updateProductQuantity logic (product-based).
                              // If I reduce quantity:
                              //  - Check General Qty. If > 0, reduce General.
                              //  - Else, check My Personal. If > 0, reduce Personal.
                              //  - Else, show error "Cannot remove others' items".
                              handleGroupedQuantityChange(item.product_id, -1)
                            }
                            className="w-8 h-full items-center justify-center border-r border-gray-200"
                          >
                            <Minus size={14} color="#6B7280" />
                          </TouchableOpacity>
                          <Text className="font-bold text-gray-900 w-8 text-center text-xs">
                            {item.quantity}
                          </Text>
                          <TouchableOpacity
                            onPress={() =>
                              // Increase: Just add to General?
                              handleGroupedQuantityChange(item.product_id, 1)
                            }
                            className="w-8 h-full items-center justify-center border-l border-gray-200"
                          >
                            <Plus size={14} color="#6B7280" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* ASSIGNMENT SECTION (Only Consumption Mode) */}
                      {isConsumptionMode && (
                        <View className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <View className="flex-row justify-between mb-2">
                            <Text className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                              Consumidores
                            </Text>
                            <Text
                              className={`text-xs font-bold ${missing > 0 ? "text-red-500" : "text-green-600"}`}
                            >
                              {assignments.count} / {item.quantity}
                            </Text>
                          </View>

                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="flex-row"
                          >
                            {/* Assigned Members Avatars */}
                            {assignments.userIds.map((uid, idx) => {
                              const mem = members.find(
                                (m) => (m.user_id || m.user?.id) === uid,
                              );
                              const avatar =
                                mem?.user?.profile_picture_url ||
                                mem?.user?.avatar_url;
                              const initials = (mem?.user?.name || "??")
                                .slice(0, 2)
                                .toUpperCase();

                              const isMe = uid === user?.id;

                              return (
                                <TouchableOpacity
                                  key={`${uid}-${idx}`}
                                  disabled={!isMe}
                                  onPress={() =>
                                    isMe && handleUnassignSelf(item.product_id)
                                  }
                                  className="mr-3 mt-2 relative"
                                >
                                  <View
                                    className={`w-10 h-10 rounded-full bg-white border items-center justify-center overflow-hidden ${isMe ? "border-orange-500" : "border-gray-200"}`}
                                  >
                                    {avatar ? (
                                      <Image
                                        source={{ uri: avatar }}
                                        className="w-full h-full"
                                      />
                                    ) : (
                                      <Text className="text-[10px] font-bold text-gray-500">
                                        {initials}
                                      </Text>
                                    )}
                                  </View>
                                  {isMe && (
                                    <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center border border-white elevation-2">
                                      <X size={12} color="white" />
                                    </View>
                                  )}
                                </TouchableOpacity>
                              );
                            })}

                            {/* Add Button - Show Self to allow quick add if needed, or maybe just +/- controls above suffice? 
                                Actually, sticking to Self-Service means I only see ME here mostly if I assigned myself.
                                But if I want to assign myself from this list? 
                                Let's show "Assign Me" button if I am missing.
                            */}
                            {missing > 0 &&
                              user?.id &&
                              !assignments.userIds.includes(user.id) && (
                                <TouchableOpacity
                                  onPress={() =>
                                    handleAssignSelf(item.product_id)
                                  }
                                  className={`mr-2 w-10 h-10 rounded-full bg-white border border-dashed border-orange-400 items-center justify-center mt-3 overflow-hidden`}
                                >
                                  {user?.profile_picture_url ? (
                                    <Image
                                      source={{
                                        uri: user.profile_picture_url,
                                      }}
                                      className="w-full h-full"
                                    />
                                  ) : (
                                    <View className="w-full h-full items-center justify-center bg-orange-50">
                                      <Text className="text-[10px] font-bold text-orange-600">
                                        {(user?.full_name || "U")
                                          .slice(0, 2)
                                          .toUpperCase()}
                                      </Text>
                                    </View>
                                  )}
                                  <View className="absolute -top-2 -right-1 bg-orange-500 rounded-full w-5 h-5 items-center justify-center border-2 border-white shadow-lg elevation-2 z-50">
                                    <Feather
                                      name="plus"
                                      size={10}
                                      color="white"
                                    />
                                  </View>
                                </TouchableOpacity>
                              )}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>

              <View className="bg-gray-50 p-4 rounded-xl mb-8">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-500 text-sm">Subtotal</Text>
                  <Text className="text-gray-900 font-semibold">
                    ${getTotalPrice().toFixed(2)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-900 font-bold text-lg">
                    Total a Pagar
                  </Text>
                  <Text className="text-orange-600 font-bold text-lg">
                    ${getTotalPrice().toFixed(2)}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View className="p-4 px-6 border-t border-gray-100 bg-white shadow-xl pt-2 pb-8">
              {isLeader ? (
                <TouchableOpacity
                  onPress={handleCheckout}
                  disabled={processingOrder || !isAssignmentComplete}
                  className={`w-full py-4 rounded-xl items-center flex-row justify-center gap-2 ${processingOrder || !isAssignmentComplete ? "bg-gray-300" : "bg-gray-900"}`}
                >
                  {processingOrder ? (
                    <Text className="text-gray-500 font-bold">
                      Procesando...
                    </Text>
                  ) : !isAssignmentComplete ? (
                    <Text className="text-gray-500 font-bold">
                      Asigna todos los productos
                    </Text>
                  ) : (
                    <>
                      <Text className="text-white font-bold text-lg">
                        Confirmar Orden
                      </Text>
                      <ArrowRight size={20} color="white" />
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                <View className="bg-yellow-50 p-3 rounded-lg flex-row items-center gap-2 border border-yellow-200">
                  <Feather name="info" size={18} color="#CA8A04" />
                  <Text className="text-yellow-700 text-xs font-semibold flex-1">
                    Solo el administrador del grupo puede confirmar la compra.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default GroupPurchaseScreen;
