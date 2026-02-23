import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  useWindowDimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ProductService } from "@/services/core";
import type {
  Product,
  ProductQuery,
  Category,
} from "@/services/ProductApiService";
import { ProductsTable } from "./components/products/ProductsTable";
import { ProductFormModal } from "./components/products/ProductFormModal";
import { ProductFilters } from "./components/products/ProductFilters";
import { useCustomNavigation, useNotify } from "@/hooks";
import { useResponsiveLayout } from "@/hooks";
import { Button, SearchBarInput, ThemedHeader } from "src/components";
import { colors } from "src/design-system";

export const ProductsManagementScreen: React.FC = () => {
  const notify = useNotify();

  // Estados principales
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const { navigate } = useCustomNavigation();
  // Filtros y paginación
  const [filters, setFilters] = useState<ProductQuery>({
    page: 1,
    limit: 10,
    sortBy: "created_at",
    order: "DESC",
  });

  // Filtros separados para el componente ProductFilters
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "date">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modal de formulario
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Búsqueda
  const [searchText, setSearchText] = useState("");

  // Flag para evitar cargar categorías múltiples veces
  const categoriesLoaded = useRef(false);

  const { isMobile } = useResponsiveLayout();

  // Cargar categorías solo una vez
  useEffect(() => {
    if (!categoriesLoaded.current) {
      categoriesLoaded.current = true;
      const loadCategories = async () => {
        try {
          const response = await ProductService.getCategories();
          setCategories(response.data || []);
        } catch (error) {
          console.error("Error loading categories:", error);
          setCategories([]);
        }
      };
      loadCategories();
    }
  }, []);

  // Cargar productos cuando cambian los filtros
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await ProductService.getProducts(filters);

        // Mapear categorías a los productos si no vienen del backend
        const productsWithCategories = response.data.map((product) => {
          if (!product.category && product.category_id) {
            const category = categories.find(
              (cat) => cat.id === product.category_id,
            );
            return { ...product, category };
          }
          return product;
        });

        setProducts(productsWithCategories);
        setTotalProducts(response.total);
      } catch (error) {
        console.error("Error fetching products:", error);
        // Usar notify directamente sin incluirlo en dependencias
        notify.error({ message: "Error al cargar productos" });
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, categories]);

  // Handlers
  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, name: searchText, page: 1 }));
  };

  const handleClearSearch = () => {
    setSearchText("");
    setFilters((prev) => ({ ...prev, name: undefined, page: 1 }));
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowFormModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowFormModal(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    notify.confirm({
      message: "¿Estás seguro de que deseas eliminar este producto?",
      onConfirm: async () => {
        try {
          await ProductService.deleteProduct(productId);
          notify.success({ message: "Producto eliminado exitosamente" });
          // Refrescar forzando un cambio en los filtros
          setFilters((prev) => ({ ...prev }));
        } catch (error) {
          console.error("Error deleting product:", error);
          notify.error({ message: "Error al eliminar producto" });
        }
      },
      onCancel: () => {
        // Opcional: acción al cancelar
      },
    });
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    setEditingProduct(null);
    // Refrescar forzando un cambio en los filtros
    setFilters((prev) => ({ ...prev }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setFilters((prev) => ({
      ...prev,
      category_id: categoryId || undefined,
      page: 1,
    }));
  };

  const handleSortChange = (
    newSortBy: "name" | "price" | "date",
    newSortOrder: "asc" | "desc",
  ) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);

    const sortByMapping = {
      name: "name",
      price: "price",
      date: "created_at",
    } as const;

    setFilters((prev) => ({
      ...prev,
      sortBy: sortByMapping[newSortBy],
      order: newSortOrder.toUpperCase() as "ASC" | "DESC",
      page: 1,
    }));
  };

  const handleResetFilters = () => {
    setSelectedCategory("");
    setSortBy("date");
    setSortOrder("desc");
    setFilters({
      page: 1,
      limit: 10,
      sortBy: "created_at",
      order: "DESC",
    });
  };

  const totalPages = Math.ceil(totalProducts / (filters.limit || 10));

  return (
    <View style={styles.container}>
      {/* Header */}
      <ThemedHeader
        title="Gestion de productos"
        canGoBack
        onBackPress={() => navigate("UserDashboardScreen")}
        subtitle={`${totalProducts} productos en total`}
        buttons={
          <Button
            title="Nuevo Producto"
            textStyle={{ color: "white" }}
            style={{
              elevation: 8,
              backgroundColor: colors.brand.green[500],
            }}
            onPress={handleCreateProduct}
            icon={
              <MaterialCommunityIcons
                name="plus"
                size={isMobile ? 18 : 20}
                color="#fff"
              />
            }
            variant={isMobile ? "onlyIcon" : "secondary"}
          />
        }
      />

      {/* Búsqueda */}
      {/* <View
        style={[
          styles.searchContainer,
          isMobile && styles.searchContainerMobile,
        ]}
      >
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color="#9ca3af"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre..."
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch}>
            <MaterialCommunityIcons
              name="close-circle"
              size={20}
              color="#9ca3af"
            />
          </TouchableOpacity>
        )}
      </View> */}
      <SearchBarInput
        searchQuery={searchText}
        onSearchChange={setSearchText}
        placeholder="Buscar por nombre..."
        styleContainer={{ marginTop: 4, marginHorizontal: 16 }}
      />
      {/* Filtros */}
      <ProductFilters
        categories={categories}
        selectedCategory={selectedCategory}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onCategoryChange={handleCategoryChange}
        onSortChange={handleSortChange}
        onReset={handleResetFilters}
      />

      {/* Contenido */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7DA244" />
          <Text style={styles.loadingText}>Cargando productos...</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="package-variant"
            size={64}
            color="#d1d5db"
          />
          <Text style={styles.emptyText}>No hay productos disponibles</Text>
          <Text style={styles.emptySubtext}>
            {filters.name
              ? "No se encontraron resultados para tu búsqueda"
              : "Crea tu primer producto para comenzar"}
          </Text>
        </View>
      ) : (
        <ProductsTable
          products={products}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          currentPage={filters.page || 1}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Modal de Formulario */}
      <ProductFormModal
        visible={showFormModal}
        product={editingProduct}
        onClose={() => {
          setShowFormModal(false);
          setEditingProduct(null);
        }}
        onSuccess={handleFormSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 6,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7DA244",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    padding: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
  // Estilos para móvil
  headerMobile: {
    padding: 12,
  },
  headerTopMobile: {
    flexDirection: "column",
    alignItems: "stretch",
    marginBottom: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  titleMobile: {
    fontSize: 20,
    marginBottom: 4,
  },
  subtitleMobile: {
    fontSize: 12,
    marginTop: 2,
  },
  createButtonMobile: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    alignSelf: "stretch",
    justifyContent: "center",
  },
  createButtonTextMobile: {
    fontSize: 13,
  },
  searchContainerMobile: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});

export default ProductsManagementScreen;
