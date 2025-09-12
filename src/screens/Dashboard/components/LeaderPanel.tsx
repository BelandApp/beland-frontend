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
import { styles, colors } from "../styles/DashboardsStyles";
import EditProfileModal from "./EditProfileModal";

interface User {
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

const LeaderPanel: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const {
    getAuthenticatedUser,
    updateAuthenticatedUser,
    loading: authUserLoading,
    error: authUserError,
  } = useAuthUser();

  const [leaderStats] = useState({
    teamName: "Equipo Alfa",
    teamSize: 15,
    totalProjects: 5,
  });

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

  const handleManageTeam = () => {
    console.log("Gestionar equipo");
  };

  const handleViewProjects = () => {
    console.log("Ver proyectos");
  };

  if (authUserLoading) {
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
              <Text style={styles.headerTitle}>Panel de Líder</Text>
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
            <Text style={styles.panelTitle}>Estadísticas del Equipo</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{leaderStats.teamSize}</Text>
                <Text style={styles.statLabel}>Miembros de equipo</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {leaderStats.totalProjects}
                </Text>
                <Text style={styles.statLabel}>Proyectos Totales</Text>
              </View>
            </View>
          </View>

          <View style={styles.panelContainer}>
            <Text style={styles.panelTitle}>Acciones Rápidas</Text>
            <TouchableOpacity
              style={[styles.button, authUserLoading && styles.buttonDisabled]}
              onPress={handleManageTeam}
              disabled={authUserLoading}>
              <Text style={styles.buttonText}>Gestionar Equipo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, authUserLoading && styles.buttonDisabled]}
              onPress={handleViewProjects}
              disabled={authUserLoading}>
              <Text style={styles.buttonText}>Ver Proyectos</Text>
            </TouchableOpacity>
          </View>

          {authUserError && (
            <Text style={styles.errorText}>{authUserError}</Text>
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

export default LeaderPanel;
