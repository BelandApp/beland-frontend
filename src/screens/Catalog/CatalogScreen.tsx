import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useLayoutEffect,
} from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { BeCoinsBalance } from "../../components/ui/BeCoinsBalance";
import * as Haptics from "expo-haptics";

// Hooks
import { useCatalogFilters, useCatalogModals } from "./hooks";
import { useProducts } from "../../hooks/useProducts";
import { useCartSync } from "../../hooks/useCartSync";
import { categoryService } from "../../services/categoryService";
import { ProductCardType } from "./components/ProductCard";
import { useAuth } from "../../hooks/AuthContext";
import { useCustomAlert } from "../../hooks/useCustomAlert";

// Components
import { AppHeader } from "../../components/layout/AppHeader";
import { SearchBar, FilterPanel, ProductGrid } from "./components";
import { OrderDeliveryModal } from "./components/OrderDeliveryModal";
import { CustomAlert } from "../../components/ui/CustomAlert";
import { UserMenu } from "../../components/ui/UserMenu";

// Styles
import { containerStyles, productStyles } from "./styles";

import { useCartStore } from "../../stores/useCartStore";
import { CartBottomSheet } from "./components/CartBottomSheet";
import { MaterialCommunityIcons } from "@expo/vector-icons";
// Community Main Component
import CatalogCommunitySection from "./mainComponents/CatalogCommunitySection";
import { useGroupedProducts } from "./mainHooks/useGroupedProducts";

export const CatalogScreen = () => {
  const navigation = useNavigation();
  const { canPerformAction, loginWithAuth0, isAuthenticated } = useAuth();
  const { showAlert, alertConfig, showCustomAlert, hideAlert } =
    useCustomAlert();

  const {
    addProduct: addProductToCart,
    addProductToServer,
    products: cartProducts,
  } = useCartStore();

  // Hook para sincronizar carrito con servidor
  const { isSyncing, syncError, performCartSync } = useCartSync();

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
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const [allCategories, setAllCategories] = useState<
    {
      id: string;
      name: string;
    }[]
  >([]);

  const selectedCategoryId = useMemo(
    () => allCategories.find((cat) => cat.name === filters.categories[0])?.id,
    [allCategories, filters.categories]
  );

  const brands: string[] = [];

  // Guardar el orden inicial de las categorías para evitar reordenamientos
  // cuando `allCategories` se carga posteriormente (evita flicker)
  const initialCategoryOrderRef = useRef<string[] | null>(null);

  const { products, loading, error, updateQuery } = useProducts({
    page: 1,
    category_id: undefined,
    name: searchText,
    sortBy: filters.sortBy || undefined,
    order: filters.order || undefined,
  });

  // Memoize product query to avoid triggering updateQuery with equivalent objects
  const productQuery = useMemo(() => {
    return {
      page: 1,
      limit: 12,
      name: searchText,
      category_id: selectedCategoryId || undefined,
      sortBy: filters.sortBy || undefined,
      order: filters.order || undefined,
    };
  }, [searchText, selectedCategoryId, filters.sortBy, filters.order]);

  // Agrupar productos por categoría para renderizar secciones separadas
  // Ahora agrupamos por `category_id` (si existe) y resolvemos el nombre usando `allCategories`.
  // Fallback: usar `product.category` (string) si no hay `category_id`, o 'Sin categoría'.
  const groupedProducts = useGroupedProducts(products, allCategories);

  const displayGroups = useMemo(() => {
    if (groupedProducts && groupedProducts.length > 0) {
      return groupedProducts.map((g) => ({
        category: g.category_name,
        products: g.products,
      }));
    }

    if (products && products.length > 0) {
      return [
        {
          category: "Todos",
          products: products as ProductCardType[],
        },
      ];
    }

    return [] as { category: string; products: ProductCardType[] }[];
  }, [groupedProducts, products]);

  const lastProductsQueryRef = useRef<string | null>(null);
  useEffect(() => {
    const qString = JSON.stringify(productQuery);
    if (lastProductsQueryRef.current === qString) return;
    lastProductsQueryRef.current = qString;
    updateQuery(productQuery);
  }, [productQuery]);

  useLayoutEffect(() => {
    // Cargar categorías al montar el componente para tener los nombres listos
    // antes del primer render y así evitar flicker y mostrar nombres humanos
    // en lugar de ids si es posible.
    (async () => {
      try {
        const categories = await categoryService.getCategories();
        setAllCategories(
          categories.map((cat) => ({ id: cat.id, name: cat.name }))
        );
      } catch (e: any) {
        console.error("[CATEGORIAS] Error al cargar categorías:", e);
        // No hacemos fallback inmediato aquí: si falla el servicio, intentamos
        // rellenar nombres más tarde a partir de los productos disponibles.
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si las categorías no vinieron del servicio, generar un fallback a partir
  // del campo `product.category` cuando los productos estén disponibles.
  useLayoutEffect(() => {
    if (allCategories && allCategories.length > 0) return;
    if (!products || products.length === 0) return;

    const cats = Array.from(
      new Set((products || []).map((p) => (p as any).category).filter(Boolean))
    ).map((name) => ({ id: String(name), name: String(name) }));

    if (cats.length > 0) setAllCategories(cats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  const handleAddProduct = async (product: ProductCardType) => {
    if (!canPerformAction) {
      setShowAuthAlert(true);
      return;
    }
  };

  return (
    <>
      {/* Header */}
      <View style={containerStyles.headerContainer}>
        <View style={containerStyles.headerRow}>
          <View style={containerStyles.headerLeft}>
            <Text style={containerStyles.headerTitle}>Catálogo</Text>
            {Platform.OS === "web" && (
              <Text style={containerStyles.headerSubtitle}>
                Productos disponibles para entrega
              </Text>
            )}
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 4,
            }}
          >
            <BeCoinsBalance
              size="small"
              variant="header"
              style={containerStyles.coinsContainer}
            />
            {isAuthenticated && (
              <TouchableOpacity
                style={styles.headerCartBtn}
                onPress={() => setShowCart(true)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={isSyncing ? "sync" : "cart-variant"}
                  size={24}
                  color={isSyncing ? "#FFA500" : "#FF6B35"}
                  style={[
                    styles.headerCartIcon,
                    isSyncing && styles.syncingIcon,
                  ]}
                />
                {cartProducts.length > 0 && !isSyncing && (
                  <View style={styles.headerBadge}>
                    <Text style={styles.headerBadgeText}>
                      {cartProducts.length}
                    </Text>
                  </View>
                )}
                {isSyncing && (
                  <View style={styles.syncIndicator}>
                    <Text style={styles.syncText}>⟳</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            <UserMenu />
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

        {/* Sección Comunidad integrada dentro del Catálogo
            Mostrar solo si hay recursos o si está cargando (para evitar mostrar
            un título vacío cuando no existan beneficios). */}
        <CatalogCommunitySection />

        {/* Productos - título y separación para mayor coherencia visual */}
        <View
          style={{
            width: "100%",
            paddingHorizontal: 8,
            marginTop: 8,
            marginBottom: 4,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 8,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#333" }}>
              Productos
            </Text>
            {/* Puedes mantener un botón 'Ver más' aquí si se desea */}
          </View>
          <View style={{ height: 8 }} />
        </View>

        {loading ? (
          <Text style={{ textAlign: "center", marginTop: 32 }}>
            Cargando productos...
          </Text>
        ) : error ? (
          <Text style={{ color: "red", textAlign: "center", marginTop: 32 }}>
            {error}
          </Text>
        ) : (
          // Revertido a grilla de productos (estilizada)
          <View style={{ paddingVertical: 8 }}>
            {products && products.length > 0 ? (
              // Renderizar una sección por categoría
              displayGroups.map((g) => (
                <View key={g.category} style={{ marginBottom: 18 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingHorizontal: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: "#333",
                      }}
                    >
                      {g.category}
                    </Text>
                    {/* opcional: botón 'Ver todo' para categoría */}
                  </View>
                  <ProductGrid
                    products={g.products}
                    onAddToCart={handleAddProduct}
                    addingProductId={addingProductId}
                  />
                </View>
              ))
            ) : (
              <View style={productStyles.emptyState}>
                <Text style={productStyles.emptyStateText}>
                  No se encontraron productos
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {isAuthenticated && (
        <CartBottomSheet
          visible={showCart}
          onClose={() => setShowCart(false)}
          onNavigateToRecharge={() => {
            setShowCart(false);
            (navigation as any).navigate("RechargeScreen");
          }}
          onCheckout={async () => {
            setShowCart(false);

            if (cartProducts.length === 0) {
              Alert.alert(
                "Carrito vacío",
                "Agrega productos antes de continuar"
              );
              return;
            }

            try {
              // Mostrar loading si es necesario

              // Aquí es donde ahora procesamos el carrito al backend
              // Pero por ahora, como aún no tienes la pantalla de direcciones,
              // vamos a usar el modal de delivery existente
              const firstProduct = cartProducts[0];
              const fullProduct = products.find(
                (p) => p.id === firstProduct.id
              );

              if (fullProduct) {
                openDeliveryModal(fullProduct);
              } else {
                Alert.alert(
                  "Producto no disponible",
                  "El producto seleccionado ya no está disponible en el catálogo.",
                  [{ text: "OK" }]
                );
              }
            } catch (error) {
              console.error("Error en checkout:", error);
              Alert.alert(
                "Error",
                "Hubo un problema al procesar tu carrito. Inténtalo de nuevo.",
                [{ text: "OK" }]
              );
            }
          }}
        />
      )}

      <OrderDeliveryModal
        visible={showDeliveryModal}
        onClose={closeDeliveryModal}
        onOrderCreated={(orderId: string) => {
          // Navigate to Orders tab to see the created order
          (navigation as any).navigate("Orders");
        }}
      />

      {/* Custom Alert para autenticación */}
      <CustomAlert
        visible={showAuthAlert}
        title="¡Inicia sesión para comprar!"
        message="Para agregar productos al carrito, necesitas tener una cuenta activa. Es rápido y seguro."
        type="info"
        onClose={() => setShowAuthAlert(false)}
        primaryButton={{
          text: "Iniciar sesión",
          onPress: () => {
            setShowAuthAlert(false);
            loginWithAuth0();
          },
        }}
        secondaryButton={{
          text: "Más tarde",
          onPress: () => setShowAuthAlert(false),
        }}
      />

      {/* Alert del hook useCustomAlert para otros mensajes */}
      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={hideAlert}
      />
    </>
  );
};

const styles = StyleSheet.create({
  headerCartBtn: {
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
  syncingIcon: {
    transform: [{ rotate: "45deg" }],
  },
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
  syncIndicator: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#FFA500",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
    zIndex: 2,
  },
  syncText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 11,
    textAlign: "center",
  },
});
