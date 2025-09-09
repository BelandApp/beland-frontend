// FileName: /UserPanel.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useAuthUser } from "src/hooks/useUser";
import { useUserResources } from "src/hooks/useUserDashResources";
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

const NoDataAvailable: React.FC<{ message?: string }> = ({
  message = "Próximamente",
}) => (
  <View style={styles.noDataContainer}>
    <Text style={styles.noDataIcon}>ℹ️</Text>
    <Text style={styles.noDataText}>{message}</Text>
  </View>
);

interface UserPanelProps {
  user: AuthUser;
}

const UserPanel: React.FC<UserPanelProps> = ({ user }) => {
  const {
    getResources,
    getTotalAvailableResource,
    loading: resourcesLoading,
    error: resourcesError,
  } = useUserResources();

  const {
    updateAuthenticatedUser,
    loading: authUserLoading,
    error: authUserError,
  } = useAuthUser();

  const [beCoinsBalance, setBeCoinsBalance] = useState<number | null>(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser>(user); // Estado para el usuario actual

  // Sincronizar currentUser si la prop 'user' cambia (ej. al recargar la sesión)
  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  useEffect(() => {
    const fetchBeCoinsBalance = async () => {
      try {
        const allResources = await getResources();
        const beCoinsResource = allResources?.find(
          (r: any) => r.name.toLowerCase() === "becoins"
        );

        if (!beCoinsResource) {
          window.alert("Error: No se encontró el recurso beCoins.");
          setBeCoinsBalance(0);
          return;
        }

        const balanceData = await getTotalAvailableResource(beCoinsResource.id);
        setBeCoinsBalance(balanceData?.total_available ?? 0);
      } catch (err) {
        window.alert("Error: No se pudo cargar el balance de beCoins.");
        setBeCoinsBalance(0);
      }
    };
    fetchBeCoinsBalance();
  }, [getResources, getTotalAvailableResource]);

  const handleViewTasks = () => {
    window.alert("Ver Tareas: Funcionalidad no disponible por ahora.");
  };

  const handleRedeemBeCoins = () => {
    window.alert("Redimir beCoins: Funcionalidad no disponible por ahora.");
  };

  const handleEditProfile = () => {
    setShowEditProfileModal(true); // Abre el modal
  };

  const handleProfileUpdated = (updatedUserData: AuthUser) => {
    setCurrentUser(updatedUserData); // Actualiza el estado del usuario en el panel
    setShowEditProfileModal(false); // Cierra el modal
  };

  return (
    <View style={styles.container}>
      {currentUser ? ( // Usar currentUser para renderizar
        <>
          <View style={styles.userPanelHeader}>
            <View style={styles.userPanelHeaderRow}>
              <Text style={styles.userPanelHeaderText}>Billetera</Text>
              <View style={styles.userPanelIcons}>
                <Image
                  source={{ uri: "/path/to/bell.svg" }}
                  style={styles.userPanelIcon}
                />
                <Image
                  source={{
                    uri:
                      currentUser.profile_picture_url ||
                      currentUser.picture ||
                      `https://ui-avatars.com/api/?name=${currentUser.full_name}&background=random`,
                  }}
                  style={styles.userProfileImageLarge}
                />
              </View>
            </View>

            <View style={styles.userPanelBalanceCard}>
              <View style={styles.userPanelBalanceTextContainer}>
                <Text style={styles.userPanelBalanceLabel}>Disponible</Text>
                {resourcesLoading && beCoinsBalance === null ? (
                  <ActivityIndicator size="small" color="#9ca3af" />
                ) : (
                  <Text style={styles.userPanelBalanceValue}>
                    {beCoinsBalance} BCD
                  </Text>
                )}
              </View>
              <Image
                source={{
                  uri:
                    currentUser.profile_picture_url ||
                    currentUser.picture ||
                    `https://ui-avatars.com/api/?name=${currentUser.full_name}&background=random`,
                }}
                style={styles.userProfileImageSmall}
              />
            </View>

            <View style={styles.userPanelActionsRow}>
              <TouchableOpacity
                style={styles.userPanelActionButton}
                onPress={handleViewTasks}>
                <View style={styles.userPanelActionButtonIconContainer}>
                  <Text style={styles.noDataIcon}>📝</Text>
                </View>
                <Text style={styles.userPanelActionButtonText}>Ver Tareas</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.userPanelActionButton}
                onPress={handleRedeemBeCoins}>
                <View style={styles.userPanelActionButtonIconContainer}>
                  <Text style={styles.noDataIcon}>🎁</Text>
                </View>
                <Text style={styles.userPanelActionButtonText}>Redimir</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.userPanelActionButton}
                onPress={handleEditProfile}>
                <View style={styles.userPanelActionButtonIconContainer}>
                  <Text style={styles.noDataIcon}>✏️</Text>
                </View>
                <Text style={styles.userPanelActionButtonText}>
                  Editar Perfil
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.userPanelActivitySection}>
            <Text style={styles.userPanelActivityTitle}>Mi Actividad</Text>
            <View style={styles.userPanelActivityCards}>
              <View style={styles.userPanelActivityCard}>
                <NoDataAvailable message="Nivel" />
                <Text style={styles.userPanelCardLabel}>Nivel Actual</Text>
              </View>
              <View style={styles.userPanelActivityCard}>
                <NoDataAvailable message="Completadas" />
                <Text style={styles.userPanelCardLabel}>
                  Tareas Completadas
                </Text>
              </View>
            </View>
          </View>

          {(resourcesError || authUserError) && (
            <Text style={styles.errorText}>
              {resourcesError || authUserError}
            </Text>
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

export default UserPanel;
