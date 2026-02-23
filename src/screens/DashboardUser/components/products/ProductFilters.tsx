import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { Category } from "@/services/ProductApiService";
import { useResponsiveLayout } from "@/hooks";

export interface ProductFiltersProps {
  categories: Category[];
  selectedCategory: string;
  sortBy: "name" | "price" | "date";
  sortOrder: "asc" | "desc";
  onCategoryChange: (categoryId: string) => void;
  onSortChange: (
    sortBy: "name" | "price" | "date",
    sortOrder: "asc" | "desc",
  ) => void;
  onReset: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  selectedCategory,
  sortBy,
  sortOrder,
  onCategoryChange,
  onSortChange,
  onReset,
}) => {
  const hasActiveFilters = selectedCategory;
  const { isMobile } = useResponsiveLayout();

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      {/* Categorías */}
      <View style={[styles.section, isMobile && styles.sectionMobile]}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="shape"
            size={isMobile ? 16 : 18}
            color="#7DA244"
          />
          <Text
            style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}
          >
            Categorías
          </Text>
        </View>
        {isMobile ? (
          // Vista compacta en móvil - Grid de 2 columnas
          <View style={styles.categoriesGridMobile}>
            <TouchableOpacity
              style={[
                styles.categoryChipMobile,
                !selectedCategory && styles.categoryChipActive,
              ]}
              onPress={() => onCategoryChange("")}
            >
              <Text
                style={[
                  styles.categoryChipTextMobile,
                  !selectedCategory && styles.categoryChipTextActive,
                ]}
              >
                Todas
              </Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChipMobile,
                  selectedCategory === category.id && styles.categoryChipActive,
                ]}
                onPress={() => onCategoryChange(category.id)}
              >
                <Text
                  style={[
                    styles.categoryChipTextMobile,
                    selectedCategory === category.id &&
                      styles.categoryChipTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          // Vista horizontal en desktop
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesScrollContent}
          >
            <View style={styles.categoriesContainer}>
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  !selectedCategory && styles.categoryChipActive,
                ]}
                onPress={() => onCategoryChange("")}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    !selectedCategory && styles.categoryChipTextActive,
                  ]}
                >
                  Todas
                </Text>
              </TouchableOpacity>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.id &&
                      styles.categoryChipActive,
                  ]}
                  onPress={() => onCategoryChange(category.id)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === category.id &&
                        styles.categoryChipTextActive,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Ordenar por */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="sort" size={18} color="#7DA244" />
          <Text style={styles.sectionTitle}>Ordenar por</Text>
        </View>
        <View
          style={[styles.sortOptions, isMobile && styles.sortOptionsMobile]}
        >
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === "name" && styles.sortButtonActive,
              isMobile && styles.sortButtonMobile,
            ]}
            onPress={() =>
              onSortChange(
                "name",
                sortBy === "name" && sortOrder === "asc" ? "desc" : "asc",
              )
            }
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === "name" && styles.sortButtonTextActive,
              ]}
            >
              Nombre
            </Text>
            {sortBy === "name" && (
              <MaterialCommunityIcons
                name={sortOrder === "asc" ? "arrow-up" : "arrow-down"}
                size={16}
                color="#fff"
                style={{ marginLeft: 4 }}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === "price" && styles.sortButtonActive,
              styles.sortButtonMiddle,
              isMobile && styles.sortButtonMobile,
            ]}
            onPress={() =>
              onSortChange(
                "price",
                sortBy === "price" && sortOrder === "asc" ? "desc" : "asc",
              )
            }
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === "price" && styles.sortButtonTextActive,
              ]}
            >
              Precio
            </Text>
            {sortBy === "price" && (
              <MaterialCommunityIcons
                name={sortOrder === "asc" ? "arrow-up" : "arrow-down"}
                size={16}
                color="#fff"
                style={{ marginLeft: 4 }}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === "date" && styles.sortButtonActive,
              styles.sortButtonMiddle,
              isMobile && styles.sortButtonMobile,
            ]}
            onPress={() =>
              onSortChange(
                "date",
                sortBy === "date" && sortOrder === "asc" ? "desc" : "asc",
              )
            }
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === "date" && styles.sortButtonTextActive,
              ]}
            >
              Fecha
            </Text>
            {sortBy === "date" && (
              <MaterialCommunityIcons
                name={sortOrder === "asc" ? "arrow-up" : "arrow-down"}
                size={16}
                color="#fff"
                style={{ marginLeft: 4 }}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Botón Resetear */}
      {hasActiveFilters && (
        <TouchableOpacity style={styles.resetButton} onPress={onReset}>
          <MaterialCommunityIcons name="refresh" size={18} color="#7DA244" />
          <Text style={styles.resetButtonText}>Resetear Filtros</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 8,
    letterSpacing: -0.2,
  },
  categoriesScroll: {
    marginHorizontal: -4,
  },
  categoriesScrollContent: {
    paddingHorizontal: 4,
    paddingRight: 16,
  },
  categoriesContainer: {
    flexDirection: "row",
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    marginHorizontal: 4,
  },
  categoryChipActive: {
    backgroundColor: "#7DA244",
  },
  categoryChipText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  categoryChipTextActive: {
    color: "#fff",
  },
  priceInputsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceInputContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  priceInput: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: "#111827",
  },
  priceSeparator: {
    width: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  priceLine: {
    width: 12,
    height: 1,
    backgroundColor: "#d1d5db",
  },
  sortOptions: {
    flexDirection: "row",
  },
  sortButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  sortButtonMiddle: {
    marginLeft: 8,
  },
  sortButtonActive: {
    backgroundColor: "#7DA244",
  },
  sortButtonText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  sortButtonTextActive: {
    color: "#fff",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#7DA244",
  },
  resetButtonText: {
    fontSize: 13,
    color: "#7DA244",
    fontWeight: "600",
    marginLeft: 8,
  },
  // Estilos para móvil
  containerMobile: {
    padding: 12,
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 12,
  },
  sectionMobile: {
    marginBottom: 16,
  },
  sectionTitleMobile: {
    fontSize: 13,
  },
  categoriesGridMobile: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  categoryChipMobile: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
    margin: 4,
    minWidth: "46%",
    maxWidth: "48%",
    alignItems: "center",
  },
  categoryChipTextMobile: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "500",
  },
  sortOptionsMobile: {
    flexWrap: "wrap",
  },
  sortButtonMobile: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
});
