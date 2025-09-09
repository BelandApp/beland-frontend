// FileName: /LeaderPanel.tsx
import React, { useState, useEffect } from "react"; // Añadido useEffect
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
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

interface LeaderPanelProps {
  user: AuthUser;
}

const LeaderPanel: React.FC<LeaderPanelProps> = ({ user }) => {
  const {
    updateAuthenticatedUser,
    loading: authUserLoading,
    error: authUserError,
  } = useAuthUser();

  const [leaderStats] = useState({
    teamName: "Equipo Alfa",
    teamSize: 15,
    totalProjects: 5,
  });
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser>(user); // Estado para el usuario actual

  // Sincronizar currentUser si la prop 'user' cambia
  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const handleManageTeam = () => {
    window.alert(
      "Gestionar Equipo: Funcionalidad para gestionar miembros del equipo (pendiente de implementar)."
    );
  };

  const handleViewProjects = () => {
    window.alert(
      "Ver Proyectos: Funcionalidad para ver el estado de los proyectos (pendiente de implementar)."
    );
  };

  const handleEditProfile = () => {
    setShowEditProfileModal(true); // Abre el modal
  };

  const handleProfileUpdated = (updatedUserData: AuthUser) => {
    setCurrentUser(updatedUserData); // Actualiza el estado del usuario en el panel
    setShowEditProfileModal(false); // Cierra el modal
  };

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

          <View style={styles.card}>
            <Text style={styles.title}>Estadísticas del Equipo</Text>
            <View style={styles.leaderStatsRow}>
              <View style={styles.leaderStatCard}>
                <Text style={styles.leaderStatValue}>
                  {leaderStats.teamSize}
                </Text>
                <Text style={styles.leaderStatLabel}>
                  Miembros en el Equipo
                </Text>
              </View>
              <View style={styles.leaderStatCard}>
                <Text style={styles.leaderStatValue}>
                  {leaderStats.totalProjects}
                </Text>
                <Text style={styles.leaderStatLabel}>Proyectos Totales</Text>
              </View>
            </View>
          </View>

          <View style={{ gap: 12, marginBottom: 20 }}>
            <TouchableOpacity
              style={[styles.button, authUserLoading && styles.buttonDisabled]}
              onPress={handleManageTeam}
              disabled={authUserLoading}>
              <Text style={styles.textCenter}>Gestionar Equipo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, authUserLoading && styles.buttonDisabled]}
              onPress={handleViewProjects}
              disabled={authUserLoading}>
              <Text style={styles.textCenter}>Ver Proyectos</Text>
            </TouchableOpacity>
          </View>

          {authUserError && (
            <Text style={styles.errorText}>{authUserError}</Text>
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

export default LeaderPanel;
