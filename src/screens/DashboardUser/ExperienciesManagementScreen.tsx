import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ProductsTable } from "./components/products/ProductsTable";
import { ProductFormModal } from "./components/products/ProductFormModal";
import { ProductFilters } from "./components/products/ProductFilters";
import { useCustomNavigation, useNotify } from "@/hooks";
import { useResponsiveLayout } from "@/hooks";
import {
  Button,
  CustomLoader,
  SearchBarInput,
  ThemedHeader,
} from "src/components";
import { colors } from "src/design-system";
import { ExperienceFormModal } from "./components/products/ExperienceFormModal";
import { Experience } from "src/types";
import { ExperienceService } from "src/services/experience/ExperienceApiService";
import { ExperienceQuery } from "src/types/Experiences";
import { ExperienceTable } from "./components/experience/ExperecienceTable";

export const ExperiencesManagementScreen: React.FC = () => {
  const notify = useNotify();

  // Estados principales
  const [experiences, setExperiences] = useState<Experience[]>([]);

  const [loading, setLoading] = useState(true);
  const [totalExperiences, setTotalExperiences] = useState(0);
  const { navigate } = useCustomNavigation();

  // Modal de formulario
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(
    null,
  );

  // Búsqueda
  const [searchText, setSearchText] = useState("");

  const { isMobile } = useResponsiveLayout();

  // Cargar productos cuando cambian los filtros
  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoading(true);
        const response = await ExperienceService.getExperiences(filters);
        console.log("REspuesta", response);
        setExperiences(response.data);
        setTotalExperiences(response.total);
      } catch (error) {
        console.error("Error fetching products:", error);
        // Usar notify directamente sin incluirlo en dependencias
        notify.error({ message: "Error al cargar experiencias" });
      } finally {
        setLoading(false);
      }
    };
    fetchExperiences();
  }, []);

  const [filters, setFilters] = useState<ExperienceQuery>({
    page: 1,
    limit: 10,
    sortBy: "created_at",
    order: "DESC",
  });

  // Handlers
  //   TODO WHEN BACKENDS ACCEPTS
  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, name: searchText, page: 1 }));
  };

  const handleCreateExperience = () => {
    setEditingExperience(null);
    setShowFormModal(true);
  };

  const handleEditExperience = (experience: Experience) => {
    setEditingExperience(experience);
    setShowFormModal(true);
  };

  const handleDeleteExperience = async (experienceId: string) => {
    notify.confirm({
      message: "¿Estás seguro de que deseas eliminar esta experiencia?",
      onConfirm: async () => {
        try {
          await ExperienceService.deleteExperience(experienceId);
          notify.success({ message: "Experiencia eliminada exitosamente" });
          // Refrescar forzando un cambio en los filtros
          setFilters((prev) => ({ ...prev }));
        } catch (error) {
          console.error("Error deleting product:", error);
          notify.error({ message: "Error al eliminar la experiencia" });
        }
      },
      onCancel: () => {
        // Opcional: acción al cancelar
      },
    });
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    setEditingExperience(null);
    // Refrescar forzando un cambio en los filtros
    setFilters((prev) => ({ ...prev }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const totalPages = Math.ceil(totalExperiences / (filters.limit || 10));
  return (
    <View style={styles.container}>
      {/* Header */}
      <ThemedHeader
        title="Gestión de experiencias"
        canGoBack
        onBackPress={() =>
          navigate("UserDashboardScreen", { screen: "Dashboard" })
        }
        subtitle={`${totalExperiences} experiencias en total`}
        buttons={
          <Button
            title="Experiencia"
            textStyle={{ color: "white" }}
            style={{
              elevation: 8,
              backgroundColor: colors.brand.green[500],
            }}
            onPress={handleCreateExperience}
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
      <SearchBarInput
        searchQuery={searchText}
        onSearchChange={setSearchText}
        placeholder="Buscar por nombre..."
        styleContainer={{ marginTop: 4, marginHorizontal: 16 }}
      />

      {/* Contenido */}
      {loading ? (
        <CustomLoader title="Cargando Experiencias" />
      ) : experiences.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="package-variant"
            size={64}
            color="#d1d5db"
          />
          <Text style={styles.emptyText}>No hay experiencias disponibles</Text>
          <Text style={styles.emptySubtext}>
            {filters.name
              ? "No se encontraron resultados para tu búsqueda"
              : "Crea tu primer experiencia para comenzar"}
          </Text>
        </View>
      ) : (
        <ExperienceTable
          experiences={experiences}
          onEdit={handleEditExperience}
          onDelete={handleDeleteExperience}
          currentPage={filters.page || 1}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Modal de Formulario experiencia */}
      <ExperienceFormModal
        visible={showFormModal}
        experience={editingExperience}
        onClose={() => {
          setShowFormModal(false);
          setEditingExperience(null);
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

export default ExperiencesManagementScreen;
