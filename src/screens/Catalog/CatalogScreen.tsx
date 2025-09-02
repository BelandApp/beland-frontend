import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StyleSheet,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BeCoinsBalance } from "../../components/ui/BeCoinsBalance";
import * as Haptics from "expo-haptics";

// Hooks
import { useCatalogFilters, useCatalogModals } from "./hooks";
import { useProducts } from "../../hooks/useProducts";
import { categoryService } from "../../services/categoryService";
import { ProductCardType } from "./components/ProductCard";

// Components
import { SearchBar, FilterPanel, ProductGrid } from "./components";
import { OrderDeliveryModal } from "./components/OrderDeliveryModal";

// Styles
import { containerStyles } from "./styles";

import { useCartStore } from "../../stores/useCartStore";
import { CartBottomSheet } from "./components/CartBottomSheet";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const CatalogScreen = () => {
  const navigation = useNavigation();

  const { addProduct: addProductToCart, products: cartProducts } =
    useCartStore();

  const {
    searchText,
    setSearchText,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
  } = useCatalogFilters();

  const { showDeliveryModal, openDeliveryModal, closeDeliveryModal } =
    useCatalogModals();

  const [showCart, setShowCart] = useState(false);
  const [allCategories, setAllCategories] = useState<
    { id: string; name: string }[]
  >([]);

  const selectedCategoryId = allCategories.find(
    (cat) => cat.name === filters.categories[0]
  )?.id;

  const brands: string[] = [];

  const { products, loading, error, updateQuery } = useProducts({
    page: 1,
    category_id: undefined,
    name: searchText,
    sortBy: filters.sortBy || undefined,
    order: filters.order || undefined,
  });

  useEffect(() => {
    const query = {
      page: 1,
      limit: 12,
      name: searchText,
      category_id: selectedCategoryId || undefined,
      sortBy: filters.sortBy || undefined,
      order: filters.order || undefined,
    };

    updateQuery(query);
  }, [filters, searchText, selectedCategoryId]);

  useEffect(() => {
    (async () => {
      try {
        const categories = await categoryService.getCategories();
        setAllCategories(
          categories.map((cat) => ({ id: cat.id, name: cat.name }))
        );
      } catch (e: any) {
        console.error("[CATEGORIAS] Error al cargar categorías:", e);
        const cats = Array.from(
          new Set((products || []).map((p) => p.category).filter(Boolean))
        ).map((name) => ({ id: String(name), name: String(name) }));
        setAllCategories(cats);
      }
    })();
  }, [products]);

  const handleAddProduct = (product: ProductCardType) => {
    if ("image_url" in product) {
      addProductToCart({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: 1,
        image: product.image_url,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <SafeAreaView style={containerStyles.container}>
      {/* Header */}
      <View style={containerStyles.headerContainer}>
        <View style={containerStyles.headerRow}>
          <View style={containerStyles.headerLeft}>
            <View style={containerStyles.headerTitles}>
              <Text style={containerStyles.headerTitle}>Catálogo</Text>
              <Text style={containerStyles.headerSubtitle}>
                Productos disponibles para entrega
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <BeCoinsBalance
              size="medium"
              variant="header"
              style={containerStyles.coinsContainer}
            />
            <TouchableOpacity
              style={styles.headerCartBtn}
              onPress={() => setShowCart(true)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="cart-variant"
                size={32}
                color="#FF6B35"
                style={styles.headerCartIcon}
              />
              {cartProducts.length > 0 && (
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>
                    {cartProducts.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={containerStyles.container}
        contentContainerStyle={containerStyles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <SearchBar searchQuery={searchText} onSearchChange={setSearchText} />

        {showFilters && (
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            categories={allCategories.map((cat) => cat.name)}
            brands={brands}
          />
        )}

        <TouchableOpacity
          style={{ marginBottom: 16, alignSelf: "flex-end" }}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={{ color: "#FF6B35", fontWeight: "600" }}>
            {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          </Text>
        </TouchableOpacity>

        {loading ? (
          <Text style={{ textAlign: "center", marginTop: 32 }}>
            Cargando productos...
          </Text>
        ) : error ? (
          <Text style={{ color: "red", textAlign: "center", marginTop: 32 }}>
            {error}
          </Text>
        ) : (
          <ProductGrid products={products} onAddToCart={handleAddProduct} />
        )}
      </ScrollView>

      <CartBottomSheet
        visible={showCart}
        onClose={() => setShowCart(false)}
        onCheckout={() => {
          setShowCart(false);
          if (cartProducts.length > 0) {
            const cartProd = cartProducts[0];
            const fullProduct = products.find((p) => p.id === cartProd.id);
            if (fullProduct) {
              openDeliveryModal(fullProduct);
            } else {
              Alert.alert(
                "Producto no disponible",
                "El producto seleccionado ya no está disponible en el catálogo. Por favor, actualiza la lista de productos.",
                [{ text: "OK" }]
              );
            }
          }
        }}
      />

      <OrderDeliveryModal
        visible={showDeliveryModal}
        onClose={closeDeliveryModal}
        onOrderCreated={(orderId: string) => {
          // Navigate to Orders tab to see the created order
          console.log("Order created:", orderId);
          (navigation as any).navigate("Orders");
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerCartBtn: {
    marginLeft: 12,
    padding: 6,
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FF6B35",
    elevation: 2,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  headerCartIcon: {},
  headerBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#FF6B35",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
    zIndex: 2,
  },
  headerBadgeText: { color: "#fff", fontWeight: "bold", fontSize: 11 },
});
