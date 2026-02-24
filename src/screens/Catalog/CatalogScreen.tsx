import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";

// Hooks
import {
  useCatalogCart,
  useCatalogFilters,
  useCatalogModals,
  useFilteredProducts,
  useCatalogTabs,
} from "./hooks";
import { useCustomNavigation, useNotify, useCategories } from "@/hooks";
// Components
import {
  BeCoinsBalance,
  CustomLoader,
  SearchBarInput,
} from "@components/shared";
import { ThemedHeader } from "@/components";
import { ProductGrid } from "./components";
import { OrderDeliveryModal } from "./components/OrderDeliveryModal";
import { CartBottomSheet } from "./components/CartBottomSheet";
import { buildCatalogTabs, CatalogTabs } from "./components/catalogTab";
// Styles
import { containerStyles } from "./styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pagination } from "src/components/shared/pagination/Pagination";

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
  const notify = useNotify();
  const { searchText, setSearchText, filters, setFilters } =
    useCatalogFilters();
  const { categories } = useCategories();
  const { products, loading, refresh, error, pagination } = useFilteredProducts(
    {
      filters,
      searchText,
      categories,
    },
  );

  const tabs = buildCatalogTabs(categories);

  const { activeTab, toggleTab } = useCatalogTabs(setFilters);
  const { showDeliveryModal, openDeliveryModal, closeDeliveryModal } =
    useCatalogModals();
  // ScrollTop when page changes
  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [pagination.page]);

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

            <TouchableOpacity
              style={styles.headerCartBtn}
              onPress={openCart}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={isSyncing ? "sync" : "cart-variant"}
                size={25}
                color={isSyncing ? "#FFA500" : "#FF6B35"}
                style={[styles.headerCartIcon, isSyncing && styles.syncingIcon]}
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
          </>
        }
      />

      {/* Content */}
      <ScrollView
        ref={scrollRef}
        style={containerStyles.container}
        contentContainerStyle={containerStyles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
      >
        <SearchBarInput
          searchQuery={searchText}
          onSearchChange={setSearchText}
          placeholder="Buscar Productos..."
        />

        <CatalogTabs tabs={tabs} activeTab={activeTab} onPress={toggleTab} />

        {loading ? (
          <CustomLoader />
        ) : error ? (
          <Text style={{ color: "red", textAlign: "center", marginTop: 32 }}>
            Error al cargar los productos
          </Text>
        ) : (
          <>
            <ProductGrid
              products={products}
              onAddToCart={handleAddProduct}
              addingProductId={addingProductId}
            />
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPrev={pagination.prev}
              onNext={pagination.next}
            />
          </>
        )}
      </ScrollView>

      <CartBottomSheet
        visible={showCart}
        onClose={closeCart}
        onNavigateToRecharge={() => {
          closeCart();
          navigate("RechargeScreen");
        }}
        onCheckout={async () => {
          if (!isAuthenticated) {
            notify.confirm({
              message: "Para comprar debes estar logueado! Te ayudo? ",
              onConfirm: () => navigate("Login"),
            });
            return;
          }
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
