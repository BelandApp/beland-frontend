import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useAdminUsers } from "src/hooks/useAdminUsers";
import { useAuthUser } from "src/hooks/useUser";
import { styles, colors } from "../styles/DashboardsStyles";
import EditProfileModal from "./EditProfileModal";

interface User {
  id: string;
  full_name: string;
  email: string;
  role_name: string;
  is_blocked: boolean;
  is_soft_deleted: boolean;
  picture?: string;
  phone?: number;
  country?: string;
  city?: string;
  username?: string;
  profile_picture_url?: string | null;
  address?: string;
}

interface UserItemProps {
  user: User;
  onBlockToggle: (userId: string, block: boolean) => void;
  onSoftDeleteToggle: (userId: string, deactivate: boolean) => void;
  onChangeRole: (userId: string, newRole: string) => void;
}

const UserItem: React.FC<UserItemProps> = ({
  user,
  onBlockToggle,
  onSoftDeleteToggle,
  onChangeRole,
}) => {
  const getStatusStyle = () => {
    if (user.is_blocked) {
      return { color: colors.danger };
    }
    if (user.is_soft_deleted) {
      return { color: colors.textSecondary };
    }
    return { color: colors.primary };
  };

  return (
    <View style={styles.userItem}>
      <Text style={styles.userName}>{user.full_name}</Text>
      <Text style={styles.userRole}>{user.role_name}</Text>
      <Text style={[styles.userStatus, getStatusStyle()]}>
        {user.is_blocked
          ? "Bloqueado"
          : user.is_soft_deleted
          ? "Inactivo"
          : "Activo"}
      </Text>
      <View style={styles.userActions}>
        <TouchableOpacity
          onPress={() => onBlockToggle(user.id, !user.is_blocked)}
          style={[styles.button, styles.buttonSecondary]}>
          <Text style={styles.buttonSecondaryText}>
            {user.is_blocked ? "Desbloquear" : "Bloquear"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onSoftDeleteToggle(user.id, !user.is_soft_deleted)}
          style={[styles.button, styles.buttonSecondary]}>
          <Text style={styles.buttonSecondaryText}>
            {user.is_soft_deleted ? "Activar" : "Inactivar"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onChangeRole(user.id, "USER")} // Placeholder
          style={[styles.button, styles.buttonSecondary]}>
          <Text style={styles.buttonSecondaryText}>Cambiar Rol</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const AdminPanel: React.FC = () => {
  const [page, setPage] = useState(1);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const {
    getAllUsersAdmin,
    loading: adminLoading,
    error: adminError,
  } = useAdminUsers();
  const {
    getAuthenticatedUser,
    updateAuthenticatedUser,
    loading: authUserLoading,
    error: authUserError,
  } = useAuthUser();

  useEffect(() => {
    const fetchAdminUsers = async () => {
      const data = await getAllUsersAdmin({ page, limit: 10 });
      if (data && data.users) {
        setAdminUsers(data.users);
        setTotalPages(data.totalPages);
      }
    };
    fetchAdminUsers();
  }, [page, getAllUsersAdmin]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = await getAuthenticatedUser();
      if (user) {
        setCurrentUser(user);
      }
    };
    fetchCurrentUser();
  }, [getAuthenticatedUser]);

  const handleProfileUpdated = (updatedUser: User) => {
    updateAuthenticatedUser(updatedUser);
    setCurrentUser(updatedUser);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  if (adminLoading || authUserLoading) {
    return (
      <ActivityIndicator
        size="large"
        color={colors.primary}
        style={{ flex: 1, justifyContent: "center" }}
      />
    );
  }

  return (
    <ScrollView style={styles.dashboardContainer}>
      {currentUser ? (
        <>
          <View style={styles.headerContainer}>
            <View>
              <Text style={styles.headerTitle}>Panel de Administrador</Text>
              <Text style={styles.headerSubtitle}>
                Gestión de usuarios y roles
              </Text>
            </View>
            <TouchableOpacity onPress={() => {}}>
              <Image
                source={{
                  uri: currentUser.profile_picture_url || currentUser.picture,
                }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.panelContainer}>
            <Text style={styles.panelTitle}>Lista de Usuarios</Text>
            <View style={styles.listContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 2 }]}>
                  Nombre
                </Text>
                <Text style={styles.tableHeaderText}>Rol</Text>
                <Text style={styles.tableHeaderText}>Estado</Text>
                <Text style={[styles.tableHeaderText, { flex: 2 }]}>
                  Acciones
                </Text>
              </View>
              {adminUsers.length > 0 ? (
                adminUsers.map(user => (
                  <UserItem
                    key={user.id}
                    user={user}
                    onBlockToggle={() => {}}
                    onSoftDeleteToggle={() => {}}
                    onChangeRole={() => {}}
                  />
                ))
              ) : (
                <Text style={styles.textCenter}>
                  No hay usuarios para mostrar.
                </Text>
              )}
            </View>
          </View>

          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[
                styles.paginationButton,
                page <= 1 && styles.paginationButtonDisabled,
              ]}
              disabled={page <= 1 || adminLoading}
              onPress={() => handlePageChange(page - 1)}>
              <Text style={styles.paginationButtonText}>Anterior</Text>
            </TouchableOpacity>
            <Text style={styles.paginationText}>
              Página {page} de {totalPages}
            </Text>
            <TouchableOpacity
              style={[
                styles.paginationButton,
                (page >= totalPages || adminLoading) &&
                  styles.paginationButtonDisabled,
              ]}
              disabled={page >= totalPages || adminLoading}
              onPress={() => handlePageChange(page + 1)}>
              <Text style={styles.paginationButtonText}>Siguiente</Text>
            </TouchableOpacity>
          </View>

          {(adminError || authUserError) && (
            <Text style={styles.errorText}>{adminError || authUserError}</Text>
          )}

          <EditProfileModal
            isVisible={false}
            onClose={() => {}}
            currentUser={currentUser}
            onProfileUpdated={handleProfileUpdated}
          />
        </>
      ) : (
        <View style={styles.noUserContainer}>
          <Text style={styles.noUserText}>
            No se pudieron cargar los datos del usuario.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default AdminPanel;
