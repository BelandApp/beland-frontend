import React, {
  useEffect,
  useState,
} from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { BeCoinsBalance, CustomLoader } from "@components/shared";

// Hooks
import { useCatalogCart, useCatalogFilters, useCatalogModals } from "./hooks";
import { useCustomNavigation, useNotify } from "@/hooks";
import { ProductService } from "@/services";

// Components
import { FilterPanel, ProductGrid } from "./components";
import { OrderDeliveryModal } from "./components/OrderDeliveryModal";
import { SearchBarInput } from "@components/shared";
import { CartBottomSheet } from "./components/CartBottomSheet";
// Styles
import { containerStyles, productStyles } from "./styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemedHeader } from "@/components";
import { useFilteredProducts } from "./mainHooks/useFilteredProducts";
import { Category } from "src/types";

export const CatalogScreen = () => {
  const { navigate } = useCustomNavigation();
  const {
    handleAddProduct,
    cartProducts,
    isAuthenticated,
    isSyncing,
    openCart,
    closeCart,
    showCart,
    addingProductId,
  } = useCatalogCart();

  const {
    searchText,
    setSearchText,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
  } = useCatalogFilters();

  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  // TODO para el futuro sortear con marcas
  const [brands, setBrands] = useState<string[]>([]);
  const { displayGroups, loading, error, refreshProducts } = useFilteredProducts({
    filters,
    searchText,
    categories,
  });
  const { showDeliveryModal, openDeliveryModal, closeDeliveryModal } =
    useCatalogModals();

  const notify = useNotify();
  useEffect(() => {
    ProductService.getCategories()
      .then((res) => {
        setCategories(
          res.data.map((cat: Category) => ({ id: cat.id, name: cat.name }))
        );
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Header */}
      <ThemedHeader
        title="Catalogo"
        buttons={
          <>
            <BeCoinsBalance
              size="medium"
              variant="header"
              style={containerStyles.coinsContainer}
            />
            {isAuthenticated && (
              <TouchableOpacity
                style={styles.headerCartBtn}
                onPress={openCart}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={isSyncing ? "sync" : "cart-variant"}
                  size={25}
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
          </>
        }
      />

      {/* Content */}
      <ScrollView
        style={containerStyles.container}
        contentContainerStyle={containerStyles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshProducts} />
        }
      >
        <SearchBarInput
          searchQuery={searchText}
          onSearchChange={setSearchText}
          placeholder="Buscar Productos..."
        />

        {showFilters && (
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            categories={categories.map((cat) => cat.name)}
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
          <CustomLoader />
        ) : error ? (
          <Text style={{ color: "red", textAlign: "center", marginTop: 32 }}>
            Error al cargar los productos, vuelve a cargar la pantalla.
          </Text>
        ) : (
          // Revertido a grilla de productos (estilizada)
          <View style={{ paddingVertical: 0 }}>
            {displayGroups && displayGroups.length > 0 ? (
              // Renderizar una sección por categoría
              displayGroups.map((g) => (
                <View key={g.categoryId} style={{ marginBottom: 18 }}>
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
          onClose={closeCart}
          onNavigateToRecharge={() => {
            closeCart();
            navigate("RechargeScreen");
          }}
          onCheckout={async () => {
            closeCart();
            if (cartProducts.length === 0) {
              notify.error({ message: "El carrito esta vacio" });
              return;
            }
            try {
              openDeliveryModal();
            } catch (error) {
              console.error("Error en checkout:", error);
              notify.error({
                message:
                  "Hubo un problema al procesar tu carrito. Inténtalo de nuevo.",
              });
            }
          }}
        />
      )}

      <OrderDeliveryModal
        visible={showDeliveryModal}
        onClose={closeDeliveryModal}
        onCancel={openCart}
        onOrderCreated={() => {
          // Navigate to Orders tab to see the created order
          navigate("Orders", { screen: "OrdersList" });
        }}
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
    justifyContent: "center",
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
