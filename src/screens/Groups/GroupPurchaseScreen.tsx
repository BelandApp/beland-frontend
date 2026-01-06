import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  ActivityIndicator,
  Platform,
  Dimensions,
  Modal,
  Image,
} from "react-native";
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Search,
  Heart,
  Lightbulb,
} from "lucide-react-native";
import { useAuth } from "src/context/AuthContext";
import { GroupMember, GroupService } from "@/services/GroupApiService";
import { Product } from "src/types";
import { ProductService } from "@/services/ProductApiService";
import { useGroupMemberConsumptions } from "src/screens/Groups/hooks/useGroupMemberConsumptions";
import { useGroupPurchaseCart } from "src/screens/Groups/hooks/useGroupPurchaseCart";
import { useNotify } from "src/hooks/notification/useNotify";
import { CustomLoader } from "@/components/shared/loader/Loader";

type GroupPurchaseParams = { groupId: string };

interface GroupPurchaseScreenProps {
  groupId: string;
}

export const GroupPurchaseScreen: React.FC<GroupPurchaseScreenProps> = ({
  groupId,
}) => {
  const { user } = useAuth();

  const notify = useNotify();

  // Función auxiliar para convertir a número
  const toNumber = (value: any): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string") return parseFloat(value) || 0;
    return 0;
  };

  const windowHeight = Dimensions.get("window").height;
  const listHeight = Math.max(420, windowHeight - 220);

  // State
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [suggestionsModalVisible, setSuggestionsModalVisible] = useState(false);

  // Hook personalizado para manejar el carrito del grupo
  const {
    cart,
    loading: cartLoading,
    addProductToCart,
    removeProductFromCart,
    updateProductQuantity,
    getTotalPrice,
    getTotalItems,
  } = useGroupPurchaseCart(groupId);

  // Hook para manejar las sugerencias de consumición
  const {
    summary: consumptionSummary,
    consumptions,
    loading: consumptionsLoading,
    suggestProduct,
    removeConsumption,
  } = useGroupMemberConsumptions(groupId);

  // Cargar grupo, miembros y productos
  useEffect(() => {
    fetchGroupData();
    fetchProducts();
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      const groupData = await GroupService.getGroup(groupId);
      setGroup(groupData);

      const membersData = await GroupService.getGroupMembers(groupId);
      setMembers(membersData);
    } catch (error) {
      console.error("Error fetching group data:", error);
      notify.error({ message: "No se pudo cargar el grupo" });
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await ProductService.getProducts({});
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      notify.error({ message: "No se pudieron cargar los productos" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProductToCart = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setProductModalVisible(true);
  };

  const confirmAddToCart = async () => {
    if (selectedProduct && quantity > 0) {
      const success = await addProductToCart(
        {
          id: selectedProduct.id,
          name: selectedProduct.name,
          price: toNumber(selectedProduct.price),
          image_url: selectedProduct.image_url,
          description: selectedProduct.description,
        },
        quantity
      );
      if (success) {
        notify.success({
          message: `${selectedProduct.name} agregado al carrito`,
        });
        setProductModalVisible(false);
        setQuantity(1);
      }
    }
  };

  const handleRemoveProduct = async (cartItemId: string) => {
    const success = await removeProductFromCart(cartItemId);
    if (success) {
      notify.success({ message: "Producto removido del carrito" });
    }
  };

  const handleQuickAdd = async (product: Product) => {
    const success = await addProductToCart(
      {
        id: product.id,
        name: product.name,
        price: toNumber(product.price),
        image_url: product.image_url,
        description: product.description,
      },
      1
    );
    if (success) {
      notify.success({ message: "Producto agregado al carrito" });
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isGroupLeader = user?.id === group?.user_id;

  if (loading || !group) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <CustomLoader />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View className="px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <ShoppingCart size={24} color="#FF6B35" />
            <Text className="text-xl font-bold ml-2">Compra en Grupo</Text>
          </View>

          <View className="flex-row items-center gap-2">
            {/* Suggestions Button */}
            {consumptionSummary && consumptionSummary.length > 0 && (
              <TouchableOpacity
                onPress={() => setSuggestionsModalVisible(true)}
                className="bg-red-100 px-3 py-1 rounded-full flex-row items-center gap-1"
              >
                <Heart size={16} color="#ef4444" fill="#ef4444" />
                <Text className="text-red-600 font-semibold text-xs">
                  {(() => {
                    const total = consumptionSummary.reduce(
                      (sum, item) => sum + (Number(item?.total_consumers) || 0),
                      0
                    );
                    return total;
                  })()}
                </Text>
              </TouchableOpacity>
            )}

            {/* Cart Button */}
            <TouchableOpacity
              onPress={() => setCartModalVisible(true)}
              className="bg-orange-100 px-3 py-1 rounded-full flex-row items-center gap-2"
            >
              <ShoppingCart size={18} color="#FF6B35" />
              <Text className="text-orange-600 font-semibold">
                {getTotalItems()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Meta Grupal Section */}
        {group && (
          <View className="mb-4">
            <View className="py-3 px-4 bg-orange-50 rounded-lg border border-orange-200 mb-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-gray-600 mb-1">
                    META GRUPAL
                  </Text>
                  <View className="flex-row items-baseline gap-1">
                    <Text className="text-2xl font-bold text-orange-600">
                      ${getTotalPrice().toFixed(2)}
                    </Text>
                    <Text className="text-xs text-gray-600">USD</Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-1 ml-4">
                  {members.slice(0, 3).map((member) => (
                    <View
                      key={member.id}
                      className="w-7 h-7 rounded-full bg-orange-300 justify-center items-center"
                    >
                      <Text className="text-xs font-bold text-white">
                        {member.user?.name?.charAt(0) || "U"}
                      </Text>
                    </View>
                  ))}
                  {members.length > 3 && (
                    <View className="w-7 h-7 rounded-full bg-gray-300 justify-center items-center ml-1">
                      <Text className="text-xs font-bold text-white">
                        +{members.length - 3}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <Search size={18} color="#666" />
          <TextInput
            placeholder="Buscar productos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
            className="flex-1 ml-2 text-sm"
          />
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={Platform.OS === "web" ? { height: listHeight } : { flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 py-4">
          {/* Products Grid */}
          <View className="mb-6">
            <Text className="text-lg font-bold mb-4">
              Productos Disponibles
            </Text>
            {filteredProducts.length > 0 ? (
              <View className="flex-row flex-wrap justify-between">
                {filteredProducts.map((product) => {
                  // Obtener sugerencias para este producto
                  const productSuggestions = consumptionSummary.filter(
                    (s) => s.product_id === product.id
                  );
                  const suggestionCount =
                    productSuggestions.length > 0
                      ? productSuggestions[0].total_consumers
                      : 0;

                  // Obtener usuarios que sugirieron este producto
                  const suggestedByUsers =
                    productSuggestions.length > 0
                      ? productSuggestions[0].users?.slice(0, 3) || []
                      : [];

                  const membersSuggestedBy = suggestedByUsers
                    .map((userId) => members.find((m) => m.user_id === userId))
                    .filter(Boolean);

                  return (
                    <TouchableOpacity
                      key={product.id}
                      onPress={() => handleAddProductToCart(product)}
                      className="w-[48%] mb-4 bg-white rounded-lg border border-gray-200 overflow-hidden"
                      style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 3,
                        elevation: 3,
                      }}
                    >
                      {/* Product Image Container */}
                      <View className="h-44 bg-gradient-to-b from-gray-100 to-gray-50 justify-center items-center overflow-hidden relative">
                        {product.image_url ? (
                          <Image
                            source={{ uri: product.image_url }}
                            style={{ width: "100%", height: "100%" }}
                            resizeMode="contain"
                          />
                        ) : (
                          <View className="flex-1 w-full justify-center items-center bg-gray-100">
                            <Text className="text-gray-400 text-center px-2 text-xs">
                              Sin imagen
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Product Info */}
                      <View className="p-3">
                        <Text className="font-semibold text-sm mb-1 truncate">
                          {product.name}
                        </Text>
                        <Text className="text-gray-600 text-xs mb-2 line-clamp-2">
                          {product.description || "Sin descripción"}
                        </Text>

                        {/* Suggested by Users - Show avatars */}
                        {suggestionCount > 0 && (
                          <View className="mb-3 pb-3 border-b border-gray-100">
                            <View className="flex-row items-center gap-2 mb-2">
                              <Heart size={14} color="#ef4444" fill="#ef4444" />
                              <View className="flex-row items-center gap-1">
                                {membersSuggestedBy.map((member) => (
                                  <View
                                    key={member?.id}
                                    className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 justify-center items-center border-2 border-white shadow-sm"
                                  >
                                    <Text className="text-xs font-bold text-white">
                                      {member?.user?.name?.charAt(0) || "U"}
                                    </Text>
                                  </View>
                                ))}
                                {suggestionCount > 3 && (
                                  <View className="w-6 h-6 rounded-full bg-gray-400 justify-center items-center border-2 border-white shadow-sm">
                                    <Text className="text-xs font-bold text-white">
                                      +{suggestionCount - 3}
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </View>
                            {/* Product suggested by text */}
                            {membersSuggestedBy.length > 0 && (
                              <Text className="text-xs text-gray-600">
                                Producto sugerido por{" "}
                                <Text className="font-semibold">
                                  {membersSuggestedBy
                                    .map((m) => m?.user?.name)
                                    .join(", ")}
                                </Text>
                              </Text>
                            )}
                          </View>
                        )}

                        {/* Price and Actions */}
                        <View className="flex-row items-center justify-between">
                          <View className="flex-col">
                            <Text className="text-orange-600 font-bold text-base">
                              ${toNumber(product.price).toFixed(2)}
                            </Text>
                            <Text className="text-gray-500 text-xs">USD</Text>
                          </View>
                          <View className="flex-row items-center gap-2">
                            {/* Suggest Button - Heart Icon */}
                            <TouchableOpacity
                              onPress={() => {
                                suggestProduct(product.id);
                              }}
                              className="p-2 bg-red-50 rounded-lg"
                            >
                              <Heart size={16} color="#ef4444" fill="#ef4444" />
                            </TouchableOpacity>
                            {/* Add to Cart Button */}
                            <TouchableOpacity
                              onPress={() => handleQuickAdd(product)}
                              className="p-2 bg-orange-100 rounded-lg"
                            >
                              <Plus size={16} color="#FF6B35" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View className="py-8 justify-center items-center">
                <Text className="text-gray-400">
                  No se encontraron productos
                </Text>
              </View>
            )}
          </View>

          {/* Group Members Section */}
          {!isGroupLeader && (
            <View className="mt-6 pt-6 border-t border-gray-200 pb-4">
              <Text className="text-lg font-bold mb-4">Miembros del Grupo</Text>
              {members && members.length > 0 ? (
                members.map((member) => (
                  <View
                    key={member.id}
                    className="flex-row items-center p-3 bg-gray-50 rounded-lg mb-2"
                  >
                    <View className="w-10 h-10 rounded-full bg-orange-200 justify-center items-center mr-3">
                      <Text className="font-bold text-orange-600">
                        {member.user?.name?.charAt(0) || "U"}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold">
                        {member.user?.name || "Usuario"}
                      </Text>
                      <Text className="text-gray-600 text-xs">
                        {member.role === "LEADER" ? "Administrador" : "Miembro"}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text className="text-gray-400">
                  No hay miembros en el grupo
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Product Selection Modal */}
      <Modal
        visible={productModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setProductModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setProductModalVisible(false)}
              className="absolute top-4 right-4 z-10"
            >
              <X size={24} color="#666" />
            </TouchableOpacity>

            {/* Product Details */}
            {selectedProduct && (
              <View className="mt-6">
                <Text className="text-2xl font-bold mb-2">
                  {selectedProduct.name}
                </Text>
                <Text className="text-gray-600 mb-4">
                  {selectedProduct.description}
                </Text>

                <View className="bg-orange-50 p-4 rounded-lg mb-4 border border-orange-200">
                  <Text className="text-gray-600 text-sm">Precio unitario</Text>
                  <View className="flex-row items-baseline gap-2">
                    <Text className="text-3xl font-bold text-orange-600">
                      ${toNumber(selectedProduct.price).toFixed(2)}
                    </Text>
                    <Text className="text-base font-semibold text-gray-600">
                      USD
                    </Text>
                  </View>
                </View>

                {/* Quantity Selector */}
                <Text className="font-semibold mb-3">Cantidad</Text>
                <View className="flex-row items-center bg-gray-100 rounded-lg p-2 mb-6">
                  <TouchableOpacity
                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2"
                  >
                    <Minus size={20} color="#FF6B35" />
                  </TouchableOpacity>

                  <TextInput
                    value={String(quantity)}
                    onChangeText={(val) => {
                      const num = parseInt(val) || 1;
                      setQuantity(Math.max(1, num));
                    }}
                    keyboardType="number-pad"
                    className="flex-1 text-center text-lg font-bold"
                  />

                  <TouchableOpacity
                    onPress={() => setQuantity(quantity + 1)}
                    className="p-2"
                  >
                    <Plus size={20} color="#FF6B35" />
                  </TouchableOpacity>
                </View>

                {/* Add to Cart Button */}
                <TouchableOpacity
                  onPress={confirmAddToCart}
                  className="bg-orange-600 py-4 rounded-lg justify-center items-center"
                >
                  <Text className="text-white font-bold text-lg">
                    Agregar al Carrito
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Shopping Cart Modal */}
      <Modal
        visible={cartModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCartModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[85%]">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold">Carrito del Grupo</Text>
              <TouchableOpacity onPress={() => setCartModalVisible(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Cart Content */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="flex-1 mb-4"
            >
              {cartLoading ? (
                <CustomLoader />
              ) : cart && cart.items.length > 0 ? (
                <View>
                  {cart.items.map((item: any) => {
                    return (
                      <View
                        key={item.id}
                        className="mb-3 p-3 bg-gray-50 rounded-lg overflow-hidden border-l-4 border-orange-400"
                      >
                        {/* Product Info with Image */}
                        <View className="flex-row gap-3 mb-3">
                          {/* Product Image */}
                          <View className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden justify-center items-center">
                            {item.product?.image_url ? (
                              <Image
                                source={{ uri: item.product.image_url }}
                                style={{ width: "100%", height: "100%" }}
                                resizeMode="contain"
                              />
                            ) : (
                              <Text className="text-gray-400 text-xs text-center px-1">
                                Sin imagen
                              </Text>
                            )}
                          </View>

                          {/* Product Details */}
                          <View className="flex-1">
                            <Text className="font-semibold text-sm">
                              {item.product?.name || "Producto"}
                            </Text>
                            <Text className="text-gray-600 text-xs mt-1">
                              ${toNumber(item.product?.price).toFixed(2)} USD
                            </Text>
                            <Text className="text-orange-600 font-bold text-sm mt-1">
                              ${toNumber(item.total_price).toFixed(2)}
                            </Text>
                          </View>
                        </View>

                        {/* Quantity Controls */}
                        <View className="flex-row items-center justify-between">
                          <Text className="text-xs font-medium text-gray-600">
                            Cantidad: {item.quantity}
                          </Text>

                          {isGroupLeader && (
                            <View className="flex-row items-center gap-1">
                              <TouchableOpacity
                                onPress={() =>
                                  updateProductQuantity(
                                    item.id,
                                    Math.max(0, item.quantity - 1)
                                  )
                                }
                                className="p-1 bg-gray-200 rounded"
                              >
                                <Minus size={12} color="#FF6B35" />
                              </TouchableOpacity>

                              <Text className="mx-1 font-semibold text-xs w-5 text-center">
                                {item.quantity}
                              </Text>

                              <TouchableOpacity
                                onPress={() =>
                                  updateProductQuantity(
                                    item.id,
                                    item.quantity + 1
                                  )
                                }
                                className="p-1 bg-gray-200 rounded"
                              >
                                <Plus size={12} color="#FF6B35" />
                              </TouchableOpacity>

                              <TouchableOpacity
                                onPress={() => handleRemoveProduct(item.id)}
                                className="ml-2 p-1 bg-red-100 rounded"
                              >
                                <X size={12} color="#EF4444" />
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}

                  {/* Cart Summary */}
                  <View className="mt-4 pt-4 border-t border-gray-200">
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-600 font-medium">
                        Subtotal (USD):
                      </Text>
                      <Text className="font-semibold">
                        ${getTotalPrice().toFixed(2)}
                      </Text>
                    </View>
                    <View className="flex-row justify-between mb-4">
                      <Text className="text-gray-600 font-medium">
                        Envío (USD):
                      </Text>
                      <Text className="font-semibold">
                        ${toNumber(cart?.delivery_cost || 0).toFixed(2)}
                      </Text>
                    </View>
                    <View className="flex-row justify-between bg-orange-50 p-3 rounded-lg border border-orange-200">
                      <Text className="font-bold text-lg">Total (USD):</Text>
                      <Text className="font-bold text-orange-600 text-lg">
                        $
                        {(
                          getTotalPrice() + toNumber(cart?.delivery_cost || 0)
                        ).toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  {/* Proceed Button */}
                  {isGroupLeader && (
                    <TouchableOpacity className="mt-4 bg-orange-600 py-3 rounded-lg justify-center items-center">
                      <Text className="text-white font-bold">
                        Proceder al Pago
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View className="py-8 justify-center items-center">
                  <ShoppingCart size={48} color="#ddd" />
                  <Text className="text-gray-400 mt-2">
                    El carrito está vacío
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setCartModalVisible(false)}
              className="bg-gray-100 py-3 rounded-lg justify-center items-center mt-2"
            >
              <Text className="text-gray-700 font-semibold">Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Suggestions Modal */}
      <Modal
        visible={suggestionsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSuggestionsModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[90%]">
            {/* Header with Gradient Background */}
            <View className=" px-6 py-6 pt-8 rounded-t-3xl flex-row items-center justify-between">
              <View className="flex-row items-center gap-3 flex-1">
                <View className="p-2.5 bg-white/20 rounded-full">
                  <Heart size={24} color="#ef4444" fill="#ef4444" />
                </View>
                <View>
                  <Text className="text-3xl font-bold text-black">
                    Sugerencias
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setSuggestionsModalVisible(false)}
                className="p-2 border-2 border-red-500 bg-white/30 hover:bg-white/40 rounded-lg active:bg-white/50"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={28} color="#ef4444" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Content Area */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="flex-1 px-5 py-5"
            >
              {consumptionSummary && consumptionSummary.length > 0 ? (
                <View className="gap-3">
                  {consumptionSummary.map((suggestion) => {
                    const suggestedByUsers = suggestion.users || [];
                    const suggestedByMembers = suggestedByUsers
                      .map((userId) =>
                        members.find((m) => m.user_id === userId)
                      )
                      .filter(Boolean);

                    return (
                      <View
                        key={suggestion.product_id}
                        className="rounded-2xl overflow-hidden"
                        style={{
                          backgroundColor: "#fff",
                          shadowColor: "#ef4444",
                          shadowOffset: { width: 0, height: 3 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                      >
                        {/* Product Header with Icon and Small Image */}
                        <View className="bg-gradient-to-br from-red-50 to-orange-50 px-5 py-3">
                          <View className="flex-row items-center gap-3 mb-3">
                            {/* Small Product Image */}
                            <View className="w-14 h-14 bg-gray-100 rounded-lg justify-center items-center flex-shrink-0 overflow-hidden">
                              {suggestion.product_image_url ? (
                                <Image
                                  source={{ uri: suggestion.product_image_url }}
                                  style={{ width: "100%", height: "100%" }}
                                  resizeMode="contain"
                                />
                              ) : (
                                <Heart size={18} color="#ddd" />
                              )}
                            </View>
                            <View className="flex-1">
                              <View className="flex-row items-center justify-between">
                                <Text
                                  className="text-base font-bold text-gray-900 flex-1"
                                  numberOfLines={2}
                                >
                                  {suggestion.product_name?.trim() ||
                                    "Producto"}
                                </Text>
                                <View className="bg-red-600 px-3 py-1.5 rounded-lg ml-2">
                                  <Text className="text-sm font-bold text-white">
                                    {suggestion.total_consumers || 0}
                                  </Text>
                                </View>
                              </View>
                              <Text className="text-xs text-gray-500 mt-1">
                                Producto sugerido
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Members List Section */}
                        <View className="py-3 px-5">
                          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                            Quién sugirió
                          </Text>
                          <View className="gap-2">
                            {suggestedByMembers.map((member) => {
                              // Solo mostrar botón de eliminar si el usuario actual fue quien lo sugirió
                              const isMyConsumption =
                                member?.user_id === user?.id;

                              return (
                                <View
                                  key={member?.id}
                                  className="flex-row items-center gap-3 p-3 bg-gray-50 rounded-lg justify-between"
                                >
                                  <View className="flex-row items-center gap-3 flex-1">
                                    <View className="w-9 h-9 rounded-full bg-gradient-to-br from-red-400 to-red-600 justify-center items-center border-2 border-red-100">
                                      <Text className="text-xs font-bold text-white">
                                        {member?.user?.name?.charAt(0) || "U"}
                                      </Text>
                                    </View>
                                    <View className="flex-1">
                                      <Text className="text-sm font-semibold text-gray-900">
                                        {member?.user?.name || "Usuario"}
                                      </Text>
                                      <View className="flex-row items-center gap-2 mt-0.5">
                                        <View
                                          className={`px-2 py-0.5 rounded-md ${
                                            member?.role === "LEADER"
                                              ? "bg-purple-100"
                                              : "bg-blue-100"
                                          }`}
                                        >
                                          <Text
                                            className={`text-xs font-semibold ${
                                              member?.role === "LEADER"
                                                ? "text-purple-700"
                                                : "text-blue-700"
                                            }`}
                                          >
                                            {member?.role === "LEADER"
                                              ? "Admin"
                                              : "Miembro"}
                                          </Text>
                                        </View>
                                      </View>
                                    </View>
                                  </View>
                                  <View className="flex-row items-center gap-2">
                                    <Heart
                                      size={16}
                                      color="#ef4444"
                                      fill="#ef4444"
                                    />
                                    {isMyConsumption && (
                                      <TouchableOpacity
                                        onPress={() => {
                                          // Si es mi sugerencia, buscar su consumptionId
                                          const myConsumptionId =
                                            consumptions?.find(
                                              (c) =>
                                                c.product_id ===
                                                suggestion.product_id
                                            )?.id;

                                          if (myConsumptionId) {
                                            removeConsumption(myConsumptionId);
                                          }
                                        }}
                                        className="ml-1 p-1.5 bg-red-100 rounded-md active:bg-red-200"
                                      >
                                        <X
                                          size={14}
                                          color="#ef4444"
                                          strokeWidth={2.5}
                                        />
                                      </TouchableOpacity>
                                    )}
                                  </View>
                                </View>
                              );
                            })}
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View className="py-16 justify-center items-center">
                  <View className="p-6 bg-red-50 rounded-full mb-4">
                    <Heart size={64} color="#fee2e2" />
                  </View>
                  <Text className="text-lg font-bold text-gray-800 text-center mb-2">
                    Sin sugerencias aún
                  </Text>
                  <Text className="text-gray-500 text-sm text-center px-6">
                    Cuando los miembros sugieran productos aparecerán en este
                    listado
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Bottom Action Button */}
            <View className="px-5 py-5 border-t border-gray-100">
              <TouchableOpacity
                onPress={() => setSuggestionsModalVisible(false)}
                className="bg-gradient-to-r from-red-500 to-red-600 py-4 rounded-xl justify-center items-center active:opacity-90"
              >
                <Text className="text-black font-bold text-lg">Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
