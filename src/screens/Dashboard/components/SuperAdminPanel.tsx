// FileName: /SuperAdminPanel.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useAdminUsers } from "src/hooks/useAdminUsers";
import { useAuthUser } from "src/hooks/useUser";
import { styles } from "../styles/DashboardsStyles";
import EditProfileModal from "./EditProfileModal";

interface AuthUser {
  full_name: string;
  email: string;
  picture?: string;
  phone?: number;
  country?: string;
  city?: string;
  username?: string;
  profile_picture_url?: string | null;
  address?: string;
}

interface UserItemProps {
  user: any;
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
  const [changingRole, setChangingRole] = useState(false);
  const roles = [
    "USER",
    "LEADER",
    "ADMIN",
    "SUPERADMIN",
    "COMMERCE",
    "FUNDATION",
  ];

  return (
    <View style={styles.userItemCard}>
      <Text style={styles.userItemText}>
        {user.email} ({user.role_name})
        {user.deleted_at && (
          <Text style={styles.userItemStatusText}>[DESACTIVADO]</Text>
        )}
        {user.isBlocked && (
          <Text style={styles.userItemStatusText}>[BLOQUEADO]</Text>
        )}
      </Text>
      <View style={styles.userItemButtonRow}>
        {!user.deleted_at ? (
          <TouchableOpacity
            style={[styles.userItemButton, styles.userItemButtonRed]}
            onPress={() => onSoftDeleteToggle(user.id, true)}>
            <Text style={styles.userItemButtonText}>Desactivar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.userItemButton, styles.userItemButtonGreen]}
            onPress={() => onSoftDeleteToggle(user.id, false)}>
            <Text style={styles.userItemButtonText}>Reactivar</Text>
          </TouchableOpacity>
        )}
        {!user.isBlocked ? (
          <TouchableOpacity
            style={[styles.userItemButton, styles.userItemButtonRed]}
            onPress={() => onBlockToggle(user.id, true)}>
            <Text style={styles.userItemButtonText}>Bloquear</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.userItemButton, styles.userItemButtonGreen]}
            onPress={() => onBlockToggle(user.id, false)}>
            <Text style={styles.userItemButtonText}>Desbloquear</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.userItemButton, styles.userItemButtonBlue]}
          onPress={() => setChangingRole(!changingRole)}>
          <Text style={styles.userItemButtonText}>
            {changingRole ? "Cancelar" : "Cambiar Rol"}
          </Text>
        </TouchableOpacity>
      </View>
      {changingRole && (
        <View style={styles.roleButtonsRow}>
          {roles.map(role => (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleButton,
                role === user.role_name && styles.roleButtonActive,
              ]}
              onPress={() => {
                onChangeRole(user.id, role);
                setChangingRole(false);
              }}>
              <Text
                style={
                  role === user.role_name
                    ? styles.roleButtonTextActive
                    : styles.roleButtonText
                }>
                {role}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

interface SuperAdminPanelProps {
  user: AuthUser;
}

const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ user }) => {
  const {
    getAllUsersAdmin,
    softDeleteUserByAdmin,
    reactivateUserByAdmin,
    updateBlockStatus,
    updateUserByAdmin,
    loading: adminLoading,
    error: adminError,
  } = useAdminUsers();

  const {
    updateAuthenticatedUser,
    loading: authUserLoading,
    error: authUserError,
  } = useAuthUser();

  const [usersList, setUsersList] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalUsers, setTotalUsers] = useState(0);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser>(user); // Estado para el usuario actual

  // Sincronizar currentUser si la prop 'user' cambia
  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const fetchUsers = async (pageNumber: number) => {
    try {
      const result = await getAllUsersAdmin({ page: pageNumber, limit });
      if (result) {
        setUsersList(result.users);
        setTotalUsers(result.total);
        setPage(pageNumber);
      }
    } catch {
      window.alert("Error: No se pudo cargar la lista de usuarios.");
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const handleBlockToggle = async (userId: string, block: boolean) => {
    const updatedUser = await updateBlockStatus(userId, { isBlocked: block });
    if (updatedUser) {
      window.alert(`Éxito: Estado de bloqueo actualizado para ${userId}.`);
      fetchUsers(page);
    } else {
      window.alert(
        `Error: Fallo al actualizar estado de bloqueo para ${userId}.`
      );
    }
  };

  const handleSoftDeleteToggle = async (
    userId: string,
    deactivate: boolean
  ) => {
    if (deactivate) {
      const success = await softDeleteUserByAdmin(userId);
      if (success) fetchUsers(page);
      else window.alert("Error al desactivar usuario.");
    } else {
      const reactivated = await reactivateUserByAdmin(userId);
      if (reactivated) fetchUsers(page);
      else window.alert("Error al reactivar usuario.");
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    const updatedUser = await updateUserByAdmin(userId, { role_name: newRole });
    if (updatedUser) {
      window.alert(`Éxito: Rol cambiado a ${newRole} para ${userId}.`);
      fetchUsers(page);
    } else {
      window.alert(`Error: No se pudo cambiar el rol para ${userId}.`);
    }
  };

  const handleEditProfile = () => {
    setShowEditProfileModal(true); // Abre el modal
  };

  const handleProfileUpdated = (updatedUserData: AuthUser) => {
    setCurrentUser(updatedUserData); // Actualiza el estado del usuario en el panel
    setShowEditProfileModal(false); // Cierra el modal
  };

  const totalPages = Math.ceil(totalUsers / limit);

  return (
    <View style={[styles.container, { padding: 24 }]}>
      {currentUser ? ( // Usar currentUser para renderizar
        <>
          <View style={styles.panelHeader}>
            <View style={styles.panelHeaderInfo}>
              <Text style={styles.panelHeaderGreeting}>
                ¡Hola, {currentUser.full_name.split(" ")[0]}!
              </Text>
              <Text style={styles.panelHeaderEmail}>{currentUser.email}</Text>
            </View>
            <Image
              source={{
                uri:
                  currentUser.profile_picture_url ||
                  currentUser.picture ||
                  `https://ui-avatars.com/api/?name=${currentUser.full_name}&background=random`,
              }}
              style={styles.panelHeaderImage}
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <TouchableOpacity
              style={[styles.button, authUserLoading && styles.buttonDisabled]}
              onPress={handleEditProfile}
              disabled={authUserLoading}>
              <Text style={styles.textCenter}>Editar Mi Perfil</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.userListContainer}>
            <Text style={styles.title}>Lista de Usuarios</Text>
            {adminLoading && (
              <ActivityIndicator
                style={{ marginVertical: 20 }}
                size="large"
                color="#2563eb"
              />
            )}
            {!adminLoading && usersList.length === 0 && (
              <Text style={styles.textCenter}>
                No hay usuarios para mostrar.
              </Text>
            )}
            {usersList.map(item => (
              <UserItem
                key={item.id}
                user={item}
                onBlockToggle={handleBlockToggle}
                onSoftDeleteToggle={handleSoftDeleteToggle}
                onChangeRole={handleChangeRole}
              />
            ))}
          </View>

          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[
                styles.paginationButton,
                (page <= 1 || adminLoading) && styles.paginationButtonDisabled,
              ]}
              disabled={page <= 1 || adminLoading}
              onPress={() => fetchUsers(page - 1)}>
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
              onPress={() => fetchUsers(page + 1)}>
              <Text style={styles.paginationButtonText}>Siguiente</Text>
            </TouchableOpacity>
          </View>

          {(adminError || authUserError) && (
            <Text style={styles.errorText}>{adminError || authUserError}</Text>
          )}

          {/* Modal de Edición de Perfil */}
          <EditProfileModal
            isVisible={showEditProfileModal}
            onClose={() => setShowEditProfileModal(false)}
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
    </View>
  );
};

export default SuperAdminPanel;
