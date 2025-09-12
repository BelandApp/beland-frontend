import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useAuthUser } from "src/hooks/useUser";
import { useUserResources } from "src/hooks/useUserResources";
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

const NoDataAvailable: React.FC<{ message?: string }> = ({
  message = "Próximamente",
}) => (
  <View style={styles.noDataContainer}>
    <Text style={styles.noDataIcon}>ℹ️</Text>
    <Text style={styles.noDataText}>{message}</Text>
  </View>
);

const UserPanel: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const {
    getAuthenticatedUser,
    updateAuthenticatedUser,
    loading: authUserLoading,
    error: authUserError,
  } = useAuthUser();
  const {
    userResources,
    loading: resourcesLoading,
    error: resourcesError,
  } = useUserResources();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getAuthenticatedUser();
      if (user) {
        setCurrentUser(user);
      }
    };
    fetchUser();
  }, [getAuthenticatedUser]);

  const handleProfileUpdated = (updatedUser: User) => {
    updateAuthenticatedUser(updatedUser);
  };

  if (authUserLoading || resourcesLoading) {
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
              <Text style={styles.headerTitle}>Panel de Usuario</Text>
              <Text style={styles.headerSubtitle}>
                Bienvenido, {currentUser.full_name}!
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
            <Text style={styles.panelTitle}>Mi Perfil</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{currentUser.email}</Text>
                <Text style={styles.statLabel}>Email</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {currentUser.country || "N/A"}
                </Text>
                <Text style={styles.statLabel}>País</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {currentUser.city || "N/A"}
                </Text>
                <Text style={styles.statLabel}>Ciudad</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {currentUser.phone || "N/A"}
                </Text>
                <Text style={styles.statLabel}>Teléfono</Text>
              </View>
            </View>
          </View>

          <View style={styles.panelContainer}>
            <Text style={styles.panelTitle}>Mi Actividad</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {userResources?.length || 0}
                </Text>
                <Text style={styles.statLabel}>Recursos disponibles</Text>
              </View>
              <View style={styles.statCard}>
                <NoDataAvailable message="Completadas" />
                <Text style={styles.statLabel}>Tareas Completadas</Text>
              </View>
            </View>
          </View>

          {(resourcesError || authUserError) && (
            <Text style={styles.errorText}>
              {resourcesError || authUserError}
            </Text>
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

export default UserPanel;
