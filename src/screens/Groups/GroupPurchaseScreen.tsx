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
import { CartService } from "@/services/cart/CartApiService";
import { Product, Category } from "src/types";
import { useGroupMemberConsumptions } from "src/screens/Groups/hooks/useGroupMemberConsumptions";
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

export const GroupPurchaseScreen: React.FC<GroupPurchaseScreenProps> = ({
  groupId,
}) => {
  const { user } = useAuth();
  const notify = useNotify();
  const navigation = useNavigation<any>();

  // Data State
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [group, setGroup] = useState<any>(null);

  // UI State
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);

  // Hooks
  const {
    cart,
    addProductToCart,
    updateProductQuantity,
    getTotalPrice,
    getTotalItems,
    clearCart,
  } = useGroupPurchaseCart(groupId);

  const { summary: consumptionSummary, suggestProduct } =
    useGroupMemberConsumptions(groupId);

  // --- Initial Data Loading ---
  useEffect(() => {
    if (groupId) {
      loadInitialData();
    }
  }, [groupId]);

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

  // --- Filtering ---
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

  // --- Cart Actions ---
  const handleQuickAdd = async (product: Product) => {
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
    );
    if (success) notify.success({ message: "Agregado al carrito" });
  };

  // --- Checkout Logic ---
  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) return;

    setProcessingOrder(true);
    try {
      console.log("[Checkout] Group Object:", {
        id: group?.id,
        payment_type_id: group?.payment_type_id,
        full_group_keys: group ? Object.keys(group) : "null",
      });

      if (!group?.payment_type_id) {
        throw new Error(
          `El grupo no tiene un método de pago configurado. (ID: ${group?.id})`,
        );
      }

      // Check if payment type is valid in the system
      try {
        const validPaymentTypes = await GroupService.getPaymentTypes();
        const isValid = validPaymentTypes.some(
          (pt: any) => pt.id === group.payment_type_id,
        );
        console.log(
          `[Checkout] Is payment type ${group.payment_type_id} valid? ${isValid}`,
        );

        if (!isValid) {
          console.warn(
            "[Checkout] The group's payment type ID seems invalid or inactive!",
          );
          // We could throw here, or try to proceed. Let's throw to be clear.
          throw new Error(
            "El método de pago del grupo no es válido o no está activo.",
          );
        }
      } catch (validationErr) {
        console.error("Validation error:", validationErr);
        throw validationErr;
      }

      // 1. Asegurar que el carrito está asignado al grupo
      await CartService.setCartGroup(groupId);

      // 2. Asignar el tipo de pago del grupo
      console.log("[Checkout] Setting payment type:", group.payment_type_id);
      await CartService.setPaymentType(group.payment_type_id);

      // --- Verify cart state ---
      const updatedCart = await CartService.getCart();
      console.log("[Checkout] Verified Cart State:", {
        id: updatedCart.id,
        payment_type_id: updatedCart.payment_type_id,
        payment_type: updatedCart.payment_type,
      });

      if (!updatedCart.payment_type && !updatedCart.payment_type_id) {
        throw new Error(
          "Error crítico: El método de pago no se guardó en el carrito.",
        );
      }
      // -------------------------

      // 3. Crear la orden
      const result = await OrderService.createOrder({
        cart_id: cart.id,
        payment_type_id: group.payment_type_id,
        payment_type_code: group.payment_type?.code, // Pass the code as well
      });

      if (result) {
        setCheckoutModalVisible(false);
        notify.success({
          message: "¡Orden Creada!",
        });
        clearCart();
      }
    } catch (error: any) {
      console.error(error);
      notify.error({ message: error.message || "Error al procesar la orden" });
    } finally {
      setProcessingOrder(false);
    }
  };

  // --- Renderers ---

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
    // Check if product is suggested
    const suggestion = consumptionSummary.find((s) => s.product_id === item.id);
    const suggestionCount = suggestion?.total_consumers || 0;
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

          {/* Suggestion Badge */}
          {suggestionCount > 0 && (
            <View className="absolute top-2 left-2 bg-red-500 rounded-full px-2 py-0.5 flex-row items-center gap-1">
              <Heart size={10} color="white" fill="white" />
              <Text className="text-white text-[10px] font-bold">
                {suggestionCount}
              </Text>
            </View>
          )}

          {/* Add Button Overlay */}
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
          <Text
            numberOfLines={2}
            className="text-gray-400 text-xs h-8 mb-2 leading-4"
          >
            {item.description || "Sin descripción disponible"}
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

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <CustomLoader />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* 1. Header (Simple & Clean) */}
      <View className="bg-white px-4 py-3 pb-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Catálogo</Text>
        <Text className="text-gray-500 text-sm">
          Abastece tu evento con los mejores productos.
        </Text>

        {/* Search Bar */}
        <View className="mt-4 flex-row items-center bg-gray-100 rounded-xl px-3 h-11 border border-transparent focus:border-orange-500">
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

      {/* 2. Categories Filter */}
      <View className="bg-white py-3 border-b border-gray-50">
        <FlatList
          data={[{ id: "all", name: "Todos" }, ...categories]}
          renderItem={renderCategoryItem}
          keyExtractor={(item: any) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      {/* 3. Product Grid */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        numColumns={2}
        keyExtractor={(item) => item.id}
        /* Ensure FlatList fills the remaining space */
        style={{ flex: 1 }}
        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: 16,
        }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20 opacity-50">
            <ShoppingBag size={48} color="#9CA3AF" />
            <Text className="text-gray-500 font-medium mt-4">
              No se encontraron productos.
            </Text>
          </View>
        }
      />

      {/* 4. Floating Cart Bar */}
      {cart && cart.items.length > 0 && (
        <View className="absolute bottom-6 left-4 right-4 z-20">
          <TouchableOpacity
            onPress={() => setCheckoutModalVisible(true)}
            className="bg-gray-900 rounded-2xl p-4 flex-row items-center justify-between shadow-xl shadow-black/20"
            activeOpacity={0.9}
          >
            <View className="flex-row items-center gap-3">
              <View className="bg-white/20 rounded-full w-10 h-10 items-center justify-center border border-white/10">
                <Text className="text-white font-bold">{getTotalItems()}</Text>
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

      {/* 5. Checkout / Cart Modal */}
      <Modal
        visible={checkoutModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCheckoutModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[90%] w-full">
            {/* Modal Header */}
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

            <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
              {/* Cart Items */}
              <View className="mb-6">
                {cart?.items.map((item) => (
                  <View
                    key={item.id}
                    className="flex-row items-center py-3 border-b border-gray-50"
                  >
                    {/* Image */}
                    <View className="w-16 h-16 bg-gray-100 rounded-lg mr-3 overflow-hidden">
                      {item.product?.image_url ? (
                        <Image
                          source={{ uri: item.product.image_url }}
                          className="w-full h-full"
                          resizeMode="contain"
                        />
                      ) : null}
                    </View>

                    <View className="flex-1">
                      <Text className="font-semibold text-gray-800 text-sm mb-1">
                        {item.product?.name}
                      </Text>
                      <Text className="text-orange-600 font-bold text-sm">
                        ${Number(item.total_price).toFixed(2)}
                      </Text>
                    </View>

                    {/* Qty Controls */}
                    <View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200">
                      <TouchableOpacity
                        onPress={() =>
                          updateProductQuantity(
                            item.id,
                            Math.max(0, item.quantity - 1),
                          )
                        }
                        className="p-2"
                      >
                        <Minus size={14} color="#6B7280" />
                      </TouchableOpacity>
                      <Text className="font-bold text-gray-900 w-6 text-center">
                        {item.quantity}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          updateProductQuantity(item.id, item.quantity + 1)
                        }
                        className="p-2"
                      >
                        <Plus size={14} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>

              {/* Summary */}
              <View className="bg-gray-50 p-4 rounded-xl mb-8">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-500 text-sm">Subtotal</Text>
                  <Text className="text-gray-900 font-semibold">
                    ${getTotalPrice().toFixed(2)}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-4 pb-4 border-b border-gray-200">
                  <Text className="text-gray-500 text-sm">
                    Cargo de servicio
                  </Text>
                  <Text className="text-gray-900 font-semibold">$0.00</Text>
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

            {/* Footer Actions */}
            <View className="p-4 px-6 border-t border-gray-100 bg-white shadow-xl pt-2 pb-8">
              {isLeader ? (
                <TouchableOpacity
                  onPress={handleCheckout}
                  disabled={processingOrder}
                  className={`w-full py-4 rounded-xl items-center flex-row justify-center gap-2 ${processingOrder ? "bg-gray-300" : "bg-gray-900"}`}
                >
                  {processingOrder ? (
                    <Text className="text-gray-500 font-bold">
                      Procesando...
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
