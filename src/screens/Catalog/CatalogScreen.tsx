import React, { useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  ActivityIndicator,
  FlatList,
  Platform,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { BeCoinsBalance } from "../../components/ui/BeCoinsBalance";

// Services
import { calculateResourcePrice } from "../../utils/priceHelpers";

// Hooks
import {
  useCatalogFilters,
  useCatalogModals,
  useCommunityResources,
  useProductGrouping,
  useCatalogCart,
  useCommunityCarousel,
  useCommunityPurchase,
} from "./hooks";
import { useProducts } from "../../hooks/useProducts";
import { useAuth } from "../../hooks/AuthContext";
import { useCustomAlert } from "../../hooks/useCustomAlert";

// Components
import { AppHeader } from "../../components/layout/AppHeader";
import { SearchBar, FilterPanel, ProductGrid } from "./components";
import { OrderDeliveryModal } from "./components/OrderDeliveryModal";
import { CustomAlert } from "../../components/ui/CustomAlert";
import { UserMenu } from "../../components/ui/UserMenu";
import CatalogCommunityCarouselWeb from "./components/CatalogCommunityCarousel.web";

// Styles
import { containerStyles, productStyles } from "./styles";
import {
  convertBeCoinsToUSD,
  formatUSDPrice,
  CURRENCY_CONFIG,
} from "../../constants/currency";

import { CartBottomSheet } from "./components/CartBottomSheet";
import { MaterialCommunityIcons } from "@expo/vector-icons";
// Purchase modal components from Community
import { PurchaseModal } from "../Community/components/PurchaseModal";
import { InsufficientBalanceModal } from "../Community/components";

export const CatalogScreen = () => {
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth();
  const { showAlert, alertConfig, hideAlert } = useCustomAlert();

  // Custom hooks
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

  const {
    showCart,
    addingProductId,
    showAuthAlert,
    cartProducts,
    isSyncing,
    handleAddProduct,
    openCart,
    closeCart,
    closeAuthAlert,
    loginWithAuth0,
  } = useCatalogCart();

  const {
    resources: communityResources,
    loading: communityLoading,
    error: communityError,
    refetch: loadCommunityResources,
  } = useCommunityResources();

  const {
    purchaseModalVisible,
    insufficientBalanceModalVisible,
    selectedCommunityResource,
    balance,
    openPurchaseModal,
    closePurchaseModal,
    closeInsufficientBalanceModal,
    handlePurchaseConfirm,
    handlePurchaseCancel,
    getRequiredAmount,
  } = useCommunityPurchase();

  const {
    communityListRef,
    communityScrollRef,
    communityCanLeft,
    communityCanRight,
    getCardWidth,
    updateCommunityNav,
    scrollCommunityLeft,
    scrollCommunityRight,
  } = useCommunityCarousel(communityResources);

  const isWeb = Platform.OS === "web";

  // Community carousel refs (from hook)
  const communityX = useRef(0);
  const communityContentWidth = useRef(0);
  const communityLayoutWidth = useRef(0);
  const itemWidthRef = useRef(0);
  const currentIndexRef = useRef(0);

  // Scroll community by direction
  const scrollCommunityBy = (dir: number) => {
    if (dir < 0) {
      scrollCommunityLeft();
    } else {
      scrollCommunityRight();
    }
  };

  // Handle community resource purchase
  const handleCommunityPurchasePress = (resource: any) => {
    handleCommunityResourcePress(resource);
  };

  const brands: string[] = [];

  const { products, loading, error, updateQuery } = useProducts({
    page: 1,
    category_id: undefined,
    name: searchText,
    sortBy: filters.sortBy || undefined,
    order: filters.order || undefined,
  });

  const { groupedProducts, displayGroups, allCategories } =
    useProductGrouping(products);

  const selectedCategoryId = useMemo(
    () => allCategories.find((cat) => cat.name === filters.categories[0])?.id,
    [allCategories, filters.categories]
  );

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

  // Update products query
  const lastProductsQueryRef = useRef<string | null>(null);
  useEffect(() => {
    const qString = JSON.stringify(productQuery);
    if (lastProductsQueryRef.current === qString) return;
    lastProductsQueryRef.current = qString;
    updateQuery(productQuery);
  }, [productQuery, updateQuery]);

  // Community section visibility logic
  const showCommunity = communityResources && communityResources.length > 0;

  // Handle community resource purchase
  const handleCommunityResourcePress = (resource: any) => {
    openPurchaseModal(resource);
  };

  // Handle community modal confirm
  const handleCommunityModalConfirm = async (qty: number) => {
    await handlePurchaseConfirm(qty);
  };

  // Handle community modal cancel
  const handleCommunityModalCancel = () => {
    handlePurchaseCancel();
  };

  // Refetch balance and community resources when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      // Refetch balance y recursos cuando el usuario se autentique
      (async () => {
        try {
          if (balance !== undefined) {
            // Balance is managed by useCommunityPurchase hook
          }
        } catch (e) {
          console.warn("No se pudo refrescar balance al autenticarse:", e);
        }

        try {
          // Forzar recarga de recursos de comunidad
          await loadCommunityResources();
        } catch (e) {
          console.warn(
            "No se pudo recargar recursos de comunidad al autenticarse:",
            e
          );
        }
      })();
    }
  }, [isAuthenticated, balance, loadCommunityResources]);

  // Componente local para la sección Comunidad en el Catálogo
  const CatalogCommunitySection: React.FC = () => {
    const formatBeCoins = (n: number) => {
      if (n === null || n === undefined) return "0 BeCoins";
      if (typeof n === "number") return `${n} BeCoins`;
      return String(n);
    };

    const ResourcePreviewCard: React.FC<{ resource: any }> = ({ resource }) => {
      const priceCalc = calculateResourcePrice(resource);
      const quantity =
        typeof resource.resource_quanity === "number"
          ? resource.resource_quanity
          : resource.resource_quantity || 0;

      const imageUri = resource.resource_img || null;

      return (
        <View style={productStyles.productCard}>
          <View style={productStyles.productImageContainer}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={productStyles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#F8F9FA",
                }}
              >
                <Text style={{ color: "#999", fontSize: 12 }}>Sin imagen</Text>
              </View>
            )}
          </View>

          <View style={{ flex: 1, width: "100%" }}>
            <Text style={productStyles.productBrand}>Mis Beneficios</Text>
            <Text style={productStyles.productName} numberOfLines={2}>
              {resource.resource_name}
            </Text>
            <Text style={productStyles.productCategory} numberOfLines={2}>
              {resource.resource_desc || ""}
            </Text>

            <View style={productStyles.productPriceRow}>
              <View style={{ flex: 1 }}>
                {(() => {
                  const usdFinal = convertBeCoinsToUSD(priceCalc.finalPrice);
                  const usdOriginal = convertBeCoinsToUSD(
                    priceCalc.originalPrice
                  );

                  return (
                    <>
                      {priceCalc.hasDiscount && (
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#999",
                            marginTop: 2,
                          }}
                        >
                          Precio original:
                        </Text>
                      )}

                      {priceCalc.hasDiscount && (
                        <Text
                          style={{
                            color: "#999",
                            fontSize: 12,
                            textDecorationLine: "line-through",
                            marginTop: 2,
                          }}
                        >
                          {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
                          {formatUSDPrice(usdOriginal)} c/u · (
                          {formatBeCoins(priceCalc.originalPrice)} c/u)
                        </Text>
                      )}

                      <Text style={productStyles.productPrice}>
                        {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
                        {formatUSDPrice(usdFinal)} c/u
                      </Text>

                      <Text style={productStyles.becoinsReference}>
                        ({formatBeCoins(priceCalc.finalPrice)} c/u)
                      </Text>
                    </>
                  );
                })()}

                <Text style={productStyles.becoinsReference}>
                  {quantity} unidades
                </Text>
              </View>
              <TouchableOpacity
                style={productStyles.addToCartButton}
                onPress={() => handleCommunityPurchasePress(resource)}
              >
                <Text style={productStyles.addToCartText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    };

    return (
      <View
        style={{
          marginVertical: 12,
          backgroundColor: "transparent",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
            paddingHorizontal: 4,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#333" }}>
            Mis Beneficios
          </Text>
        </View>

        {communityLoading ? (
          <ActivityIndicator color="#FF6B35" />
        ) : communityResources.length === 0 ? (
          <View style={{ padding: 24, alignItems: "center" }}>
            <Text style={{ color: "#666" }}>No hay recursos disponibles</Text>
          </View>
        ) : (
          <View>
            {isWeb ? (
              <CatalogCommunityCarouselWeb
                items={communityResources}
                renderItem={(item) => (
                  <View style={{ marginLeft: 8, marginRight: 8 }}>
                    <ResourcePreviewCard resource={item} />
                  </View>
                )}
              />
            ) : (
              <FlatList
                ref={(ref) => {
                  communityListRef.current = ref;
                }}
                horizontal
                data={communityResources}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <View
                    style={{ marginLeft: 16, marginRight: 8 }}
                    onLayout={(e) => {
                      const w = e.nativeEvent.layout.width || 0;

                      if (!itemWidthRef.current && w > 0)
                        itemWidthRef.current = w;
                    }}
                  >
                    <ResourcePreviewCard resource={item} />
                  </View>
                )}
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const x = e.nativeEvent.contentOffset.x || 0;
                  communityX.current = x;
                  const itemWidth = itemWidthRef.current || 0;
                  const gap = 24;
                  const full = itemWidth + gap;
                  if (full > 0) {
                    const idx = Math.round(x / full);
                    currentIndexRef.current = idx;
                  }
                  updateCommunityNav();
                }}
                scrollEventThrottle={50}
                onContentSizeChange={(w, h) => {
                  communityContentWidth.current = w || 0;
                  updateCommunityNav();
                }}
                onLayout={(e) => {
                  communityLayoutWidth.current =
                    e.nativeEvent.layout.width || 0;
                  updateCommunityNav();
                }}
                contentContainerStyle={{ paddingLeft: 8, paddingRight: 24 }}
              />
            )}

            {communityCanLeft && (
              <TouchableOpacity
                accessibilityLabel="Anterior comunidad"
                accessibilityRole="button"
                style={{
                  position: "absolute",
                  left: 4,
                  top: "40%",
                  zIndex: 10,
                  backgroundColor: "#FF6B35",
                  padding: 8,
                  borderRadius: 22,
                  elevation: 5,
                }}
                onPress={() => scrollCommunityBy(-1)}
              >
                <Text
                  style={{ fontSize: 18, color: "#fff", fontWeight: "700" }}
                >
                  ‹
                </Text>
              </TouchableOpacity>
            )}

            {communityCanRight && (
              <TouchableOpacity
                accessibilityLabel="Siguiente comunidad"
                accessibilityRole="button"
                style={{
                  position: "absolute",
                  right: 4,
                  top: "40%",
                  zIndex: 10,
                  backgroundColor: "#FF6B35",
                  padding: 8,
                  borderRadius: 22,
                  elevation: 5,
                }}
                onPress={() => scrollCommunityBy(1)}
              >
                <Text
                  style={{ fontSize: 18, color: "#fff", fontWeight: "700" }}
                >
                  ›
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      <AppHeader />
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
                showLockedBalance={true}
              />
              {isAuthenticated && (
                <TouchableOpacity
                  style={styles.headerCartBtn}
                  onPress={openCart}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name={isSyncing ? "sync" : "cart-variant"}
                    size={32}
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
              <UserMenu style={{ marginLeft: 12 }} />
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

          {showCommunity && <CatalogCommunitySection />}

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
            <View style={{ paddingVertical: 8 }}>
              {products && products.length > 0 ? (
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
                    </View>
                    <ProductGrid
                      products={g.items}
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
            onClose={closeCart}
            onNavigateToRecharge={() => {
              closeCart();
              (navigation as any).navigate("RechargeScreen");
            }}
            onCheckout={async () => {
              closeCart();

              if (cartProducts.length === 0) {
                Alert.alert(
                  "Carrito vacío",
                  "Agrega productos antes de continuar"
                );
                return;
              }

              try {
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
            (navigation as any).navigate("Orders");
          }}
        />

        <PurchaseModal
          visible={purchaseModalVisible}
          resource={selectedCommunityResource}
          userBalance={balance || 0}
          onConfirm={async (qty: number) => {
            await handleCommunityModalConfirm(qty);
          }}
          onCancel={handleCommunityModalCancel}
          onNavigateToRecharge={() => {
            closePurchaseModal();
            (navigation as any).navigate("RechargeScreen");
          }}
        />

        <InsufficientBalanceModal
          visible={insufficientBalanceModalVisible}
          userBalance={balance || 0}
          requiredAmount={
            selectedCommunityResource
              ? calculateResourcePrice(selectedCommunityResource).finalPrice
              : 0
          }
          onRecharge={() => {
            closeInsufficientBalanceModal();
            (navigation as any).navigate("RechargeScreen");
          }}
          onCancel={() => {
            closeInsufficientBalanceModal();
          }}
        />

        {/* Custom Alert para autenticación */}
        <CustomAlert
          visible={showAuthAlert}
          title="¡Inicia sesión para comprar!"
          message="Para agregar productos al carrito, necesitas tener una cuenta activa. Es rápido y seguro."
          type="info"
          onClose={closeAuthAlert}
          primaryButton={{
            text: "Iniciar sesión",
            onPress: () => {
              closeAuthAlert();
              loginWithAuth0();
            },
          }}
          secondaryButton={{
            text: "Más tarde",
            onPress: closeAuthAlert,
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
      </SafeAreaView>
    </>
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
