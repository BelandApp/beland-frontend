import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Switch,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import DashboardWrapper from "./components/DashboardWrapper";
import { adminApiService, AdminUser } from "src/services/AdminApiService";

const UsersManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [hasMorePages, setHasMorePages] = useState(false);

  // Filtros
  const [filterByRole, setFilterByRole] = useState<string>("");
  const [filterByStatus, setFilterByStatus] = useState<string>("");

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log("Starting to load users...");
      await loadUsers(1);
      console.log("Users loaded successfully");
    } catch (error: any) {
      console.error("Error loading initial data:", error);
      Alert.alert(
        "Error de Conexión",
        "No se pudieron cargar los usuarios. Verifica tu conexión a internet."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async (page: number = 1) => {
    try {
      console.log(`Loading users page ${page}...`);
      const response = await adminApiService.getUsers(page, 20);
      console.log("Users response:", response);

      if (page === 1) {
        setUsers(response.users || []);
      } else {
        setUsers((prev) => [...prev, ...(response.users || [])]);
      }

      setCurrentPage(page);
      setTotalUsers(response.total || 0);
      setHasMorePages(
        (response.users?.length || 0) === 20 &&
          page * 20 < (response.total || 0)
      );
    } catch (error: any) {
      console.error("Error loading users:", error);
      if (page === 1) {
        Alert.alert("Error", "No se pudieron cargar los usuarios");
        setUsers([]);
      }
    }
  };

  const handleToggleUserStatus = async (
    userId: string,
    currentStatus: boolean
  ) => {
    try {
      const newStatus = !currentStatus;
      console.log(
        `Toggling user ${userId} from ${currentStatus} to ${newStatus}`
      );

      const result = await adminApiService.blockUser(userId, newStatus);
      console.log("Toggle result:", result);

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, isBlocked: newStatus } : user
        )
      );

      Alert.alert(
        "Éxito",
        `Usuario ${newStatus ? "bloqueado" : "desbloqueado"} correctamente`
      );
    } catch (error: any) {
      console.error("Error toggling user status:", error);
      Alert.alert(
        "Error",
        `No se pudo ${
          !currentStatus ? "bloquear" : "desbloquear"
        } el usuario. Verifica tu conexión.`
      );
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers(1);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (hasMorePages && !loading) {
      loadUsers(currentPage + 1);
    }
  };

  const handleSearchByEmail = async () => {
    if (!searchText.trim()) {
      Alert.alert("Error", "Por favor ingresa un email para buscar");
      return;
    }

    try {
      setLoading(true);
      const user = await adminApiService.getUserByEmail(searchText.trim());
      setUsers([user]);
      setTotalUsers(1);
      setHasMorePages(false);
    } catch (error: any) {
      console.error("Error searching user:", error);
      Alert.alert("Error", "No se encontró un usuario con ese email");
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchText("");
    loadInitialData();
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      user.role_name.toLowerCase().includes(searchText.toLowerCase());

    const matchesRole = !filterByRole || user.role_name === filterByRole;
    const matchesStatus =
      !filterByStatus ||
      (filterByStatus === "active" && !user.isBlocked) ||
      (filterByStatus === "blocked" && user.isBlocked);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "#FF6B6B";
      case "superadmin":
        return "#9C27B0";
      case "user":
        return "#4CAF50";
      case "commerce":
        return "#FF9800";
      default:
        return "#666";
    }
  };

  const getStatusColor = (isBlocked: boolean) => {
    return isBlocked ? "#FF3B30" : "#34C759";
  };

  const renderUserCard = (user: AdminUser) => (
    <View key={user.id} style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userAvatarContainer}>
          {user.picture ? (
            <Image source={{ uri: user.picture }} style={styles.userAvatar} />
          ) : (
            <View style={styles.userAvatarPlaceholder}>
              <Text style={styles.userAvatarText}>
                {user.full_name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.full_name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          <View style={styles.userBadges}>
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: getRoleColor(user.role_name) },
              ]}
            >
              <Text style={styles.roleBadgeText}>{user.role_name}</Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(user.isBlocked) },
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {user.isBlocked ? "Bloqueado" : "Activo"}
              </Text>
            </View>
          </View>
        </View>

        <Switch
          value={!user.isBlocked}
          onValueChange={() => handleToggleUserStatus(user.id, user.isBlocked)}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={!user.isBlocked ? "#007AFF" : "#f4f3f4"}
        />
      </View>

      <View style={styles.userDetails}>
        <View style={styles.userDetailRow}>
          <Text style={styles.userDetailLabel}>📅 Registro:</Text>
          <Text style={styles.userDetailValue}>
            {formatDate(user.created_at)}
          </Text>
        </View>

        <View style={styles.userDetailRow}>
          <Text style={styles.userDetailLabel}>🔄 Última actualización:</Text>
          <Text style={styles.userDetailValue}>
            {formatDate(user.updated_at)}
          </Text>
        </View>

        <View style={styles.userDetailRow}>
          <Text style={styles.userDetailLabel}>🆔 ID:</Text>
          <Text style={styles.userDetailValue}>{user.id}</Text>
        </View>
      </View>
    </View>
  );

  const activeUsers = users.filter((user) => !user.isBlocked).length;
  const blockedUsers = users.filter((user) => user.isBlocked).length;
  const adminUsers = users.filter((user) =>
    user.role_name.toLowerCase().includes("admin")
  ).length;

  return (
    <DashboardWrapper title="Gestión de Usuarios" isLoading={loading}>
      <View style={styles.container}>
        {/* Header con estadísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalUsers}</Text>
            <Text style={styles.statLabel}>Total Usuarios</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#34C759" }]}>
              {activeUsers}
            </Text>
            <Text style={styles.statLabel}>Activos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#FF3B30" }]}>
              {blockedUsers}
            </Text>
            <Text style={styles.statLabel}>Bloqueados</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#FF6B6B" }]}>
              {adminUsers}
            </Text>
            <Text style={styles.statLabel}>Admins</Text>
          </View>
        </View>

        {/* Controles de búsqueda */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, email o rol..."
            value={searchText}
            onChangeText={setSearchText}
          />

          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearchByEmail}
          >
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>

          {searchText.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filtros */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                !filterByRole && styles.filterChipActive,
              ]}
              onPress={() => setFilterByRole("")}
            >
              <Text
                style={[
                  styles.filterChipText,
                  !filterByRole && styles.filterChipTextActive,
                ]}
              >
                Todos los roles
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                filterByRole === "user" && styles.filterChipActive,
              ]}
              onPress={() => setFilterByRole("user")}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterByRole === "user" && styles.filterChipTextActive,
                ]}
              >
                Usuarios
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                filterByRole === "admin" && styles.filterChipActive,
              ]}
              onPress={() => setFilterByRole("admin")}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterByRole === "admin" && styles.filterChipTextActive,
                ]}
              >
                Admins
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                filterByRole === "commerce" && styles.filterChipActive,
              ]}
              onPress={() => setFilterByRole("commerce")}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterByRole === "commerce" && styles.filterChipTextActive,
                ]}
              >
                Comercios
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                filterByStatus === "active" && styles.filterChipActive,
              ]}
              onPress={() =>
                setFilterByStatus(filterByStatus === "active" ? "" : "active")
              }
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterByStatus === "active" && styles.filterChipTextActive,
                ]}
              >
                Solo Activos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                filterByStatus === "blocked" && styles.filterChipActive,
              ]}
              onPress={() =>
                setFilterByStatus(filterByStatus === "blocked" ? "" : "blocked")
              }
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterByStatus === "blocked" && styles.filterChipTextActive,
                ]}
              >
                Solo Bloqueados
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Lista de usuarios */}
        <ScrollView
          style={styles.usersList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onMomentumScrollEnd={(event) => {
            const { layoutMeasurement, contentOffset, contentSize } =
              event.nativeEvent;
            const isCloseToBottom =
              layoutMeasurement.height + contentOffset.y >=
              contentSize.height - 100;
            if (isCloseToBottom && hasMorePages) {
              handleLoadMore();
            }
          }}
        >
          {filteredUsers.map(renderUserCard)}

          {hasMorePages && (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={handleLoadMore}
            >
              <Text style={styles.loadMoreText}>Cargar más usuarios...</Text>
            </TouchableOpacity>
          )}

          {filteredUsers.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {searchText
                  ? "No se encontraron usuarios"
                  : "No hay usuarios disponibles"}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </DashboardWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 3,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 15,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  searchButtonText: {
    fontSize: 16,
  },
  clearButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filterChip: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: "#007AFF",
  },
  filterChipText: {
    fontSize: 12,
    color: "#666",
  },
  filterChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  usersList: {
    flex: 1,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  userAvatarContainer: {
    marginRight: 15,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  userBadges: {
    flexDirection: "row",
    gap: 8,
  },
  roleBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  roleBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  userDetails: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 15,
  },
  userDetailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  userDetailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    width: 140,
  },
  userDetailValue: {
    fontSize: 12,
    color: "#555",
    flex: 1,
  },
  loadMoreButton: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  loadMoreText: {
    color: "#666",
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default UsersManagementScreen;
