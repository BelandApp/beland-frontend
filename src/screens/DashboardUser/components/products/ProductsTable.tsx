import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { Product } from "@/services/ProductApiService";
import { useResponsiveLayout } from "@/hooks";

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const formatPrice = (price: number) => {
    if (price == null || isNaN(price)) return "$0.00";
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const { isMobile } = useResponsiveLayout();

  // Vista tipo Card para móvil
  const MobileCard = ({ product }: { product: Product }) => (
    <View style={styles.mobileCard}>
      <View style={styles.mobileCardHeader}>
        <View style={styles.mobileCardImageContainer}>
          {product.image_url ? (
            <Image
              source={{ uri: product.image_url }}
              style={styles.mobileCardImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.mobileCardImagePlaceholder}>
              <MaterialCommunityIcons
                name="image-off"
                size={20}
                color="#9ca3af"
              />
            </View>
          )}
        </View>
        <View style={styles.mobileCardInfo}>
          <Text style={styles.mobileCardTitle} numberOfLines={2}>
            {product.name}
          </Text>
          {product.description && (
            <Text style={styles.mobileCardDescription} numberOfLines={1}>
              {product.description}
            </Text>
          )}
          <Text style={styles.mobileCardCategory}>
            {product.category && product.category.name
              ? product.category.name
              : "Sin categoría"}
          </Text>
        </View>
        <Text
          className={`${product.stock === 0 ? "text-red-500" : " text-gray-600"}`}
        >
          {product.stock === 0 ? "Sin stock" : product.stock}
        </Text>
      </View>
      <View style={styles.mobileCardActions}>
        <TouchableOpacity
          style={styles.mobileActionButton}
          onPress={() => onEdit(product)}
        >
          <MaterialCommunityIcons name="pencil" size={18} color="#3b82f6" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mobileActionButton, styles.mobileDeleteButton]}
          onPress={() => onDelete(product.id)}
        >
          <MaterialCommunityIcons name="delete" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Vista de tabla para desktop
  const TableContent = () => (
    <View style={isMobile ? styles.tableMobile : styles.table}>
      {/* Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.imageCol]}>IMAGEN</Text>
        <Text style={[styles.headerCell, styles.nameCol]}>NOMBRE</Text>
        <Text style={[styles.headerCell, styles.categoryCol]}>CATEGORÍA</Text>
        <Text style={[styles.headerCell, styles.priceCol]}>PRECIO USD</Text>
        <Text style={[styles.headerCell, styles.priceCol]}>PRECIO BECOINS</Text>
        <Text style={[styles.headerCell, styles.stockCol]}>STOCK</Text>
        <Text style={[styles.headerCell, styles.dateCol]}>CREADO</Text>
        <Text style={[styles.headerCell, styles.actionsCol]}>ACCIONES</Text>
      </View>

      {/* Rows */}
      {products.map((product) => (
        <View key={product.id} style={styles.tableRow}>
          {/* Imagen */}
          <View style={[styles.cell, styles.imageCol]}>
            {product.image_url ? (
              <Image
                source={{ uri: product.image_url }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <MaterialCommunityIcons
                  name="image-off"
                  size={20}
                  color="#9ca3af"
                />
              </View>
            )}
          </View>

          {/* Nombre */}
          <View style={[styles.cell, styles.nameCol]}>
            <Text style={styles.productName} numberOfLines={2}>
              {product.name}
            </Text>
            {product.description && (
              <Text style={styles.productDescription} numberOfLines={1}>
                {product.description}
              </Text>
            )}
          </View>

          {/* Categoría */}
          <View style={[styles.cell, styles.categoryCol]}>
            <Text style={styles.categoryText}>
              {product.category && product.category.name
                ? product.category.name
                : "Sin categoría"}
            </Text>
          </View>

          {/* Precio USD */}
          <View style={[styles.cell, styles.priceCol]}>
            <Text style={styles.priceText}>{formatPrice(product.price)}</Text>
          </View>

          {/* Precio BeCoins */}
          <View style={[styles.cell, styles.priceCol]}>
            <Text style={styles.becoinsText}>
              {product.price_becoin != null && !isNaN(product.price_becoin)
                ? `${product.price_becoin.toFixed(2)} BC`
                : "-"}
            </Text>
          </View>

          {/* Stock */}
          <View style={[styles.cell, styles.stockCol]}>
            <View
              style={[
                styles.stockBadge,
                (product.inventory_count || 0) > 0
                  ? styles.stockInStock
                  : styles.stockOutOfStock,
              ]}
            >
              <Text
                style={[
                  styles.stockText,
                  (product.inventory_count || 0) > 0
                    ? styles.stockTextInStock
                    : styles.stockTextOutOfStock,
                ]}
              >
                {product.stock || 0}
              </Text>
            </View>
          </View>

          {/* Fecha */}
          <View style={[styles.cell, styles.dateCol]}>
            <Text style={styles.dateText}>
              {formatDate(product.created_at)}
            </Text>
          </View>

          {/* Acciones */}
          <View style={[styles.cell, styles.actionsCol]}>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onEdit(product)}
              >
                <MaterialCommunityIcons
                  name="pencil"
                  size={18}
                  color="#3b82f6"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => onDelete(product.id)}
              >
                <MaterialCommunityIcons
                  name="delete"
                  size={18}
                  color="#ef4444"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {isMobile ? (
        <View>
          {products.map((product) => (
            <MobileCard key={product.id} product={product} />
          ))}
        </View>
      ) : (
        <TableContent />
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[
              styles.paginationButton,
              currentPage === 1 && styles.paginationButtonDisabled,
            ]}
            onPress={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={20}
              color={currentPage === 1 ? "#d1d5db" : "#6b7280"}
            />
          </TouchableOpacity>

          <Text style={styles.paginationText}>
            Página {currentPage} de {totalPages}
          </Text>

          <TouchableOpacity
            style={[
              styles.paginationButton,
              currentPage === totalPages && styles.paginationButtonDisabled,
            ]}
            onPress={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={currentPage === totalPages ? "#d1d5db" : "#6b7280"}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  table: {
    width: "100%",
  },
  tableMobile: {
    minWidth: 900,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderBottomWidth: 2,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerCell: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    textTransform: "uppercase",
  },
  cell: {
    justifyContent: "center",
  },
  imageCol: {
    width: 80,
    marginRight: 8,
  },
  nameCol: {
    flex: 2.5,
    paddingRight: 12,
    minWidth: 200,
  },
  categoryCol: {
    flex: 1.2,
    paddingRight: 12,
    minWidth: 100,
  },
  priceCol: {
    flex: 1.2,
    paddingRight: 12,
    minWidth: 100,
  },
  stockCol: {
    flex: 0.8,
    alignItems: "center",
    paddingRight: 12,
    minWidth: 70,
  },
  dateCol: {
    flex: 1.2,
    paddingRight: 12,
    minWidth: 100,
  },
  actionsCol: {
    flex: 1,
    minWidth: 90,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
    lineHeight: 20,
  },
  productDescription: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 16,
  },
  categoryText: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    lineHeight: 20,
  },
  becoinsText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#7DA244",
    lineHeight: 18,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  stockInStock: {
    backgroundColor: "#d1fae5",
  },
  stockOutOfStock: {
    backgroundColor: "#fee2e2",
  },
  stockText: {
    fontSize: 12,
    fontWeight: "600",
  },
  stockTextInStock: {
    color: "#065f46",
  },
  stockTextOutOfStock: {
    color: "#991b1b",
  },
  dateText: {
    fontSize: 13,
    color: "#6b7280",
  },
  actions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
  },
  deleteButton: {
    marginLeft: 8,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fafafa",
  },
  paginationButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  paginationButtonDisabled: {
    opacity: 0.4,
    backgroundColor: "#f9fafb",
  },
  paginationText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
    marginHorizontal: 20,
  },
  // Estilos para vista móvil
  mobileCard: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    padding: 12,
  },
  mobileCardHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  mobileCardImageContainer: {
    marginRight: 12,
  },
  mobileCardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  mobileCardImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  mobileCardInfo: {
    flex: 1,
    justifyContent: "center",
  },
  mobileCardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
    lineHeight: 20,
  },
  mobileCardDescription: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
    lineHeight: 16,
  },
  mobileCardCategory: {
    fontSize: 12,
    color: "#7DA244",
    fontWeight: "500",
  },
  mobileCardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  mobileActionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
    marginLeft: 8,
  },
  mobileDeleteButton: {
    backgroundColor: "#fee2e2",
  },
});
