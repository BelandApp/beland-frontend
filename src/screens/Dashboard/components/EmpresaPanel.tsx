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

const EmpresaPanel: React.FC = () => {
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

  const [beCoinsBalance] = useState<number | null>(null);
  const [employeesCount] = useState(120);

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

  const handleManageEmployees = () => {
    console.log("Gestionar empleados");
  };

  const handlePurchaseBeCoins = () => {
    console.log("Comprar beCoins");
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
              <Text style={styles.headerTitle}>Panel de Empresa</Text>
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
            <Text style={styles.panelTitle}>Estadísticas de la Empresa</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{beCoinsBalance}</Text>
                <Text style={styles.statLabel}>Balance de beCoins</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{employeesCount}</Text>
                <Text style={styles.statLabel}>Total de empleados</Text>
              </View>
            </View>
          </View>

          <View style={styles.panelContainer}>
            <Text style={styles.panelTitle}>Acciones Rápidas</Text>
            <TouchableOpacity
              style={[styles.button, authUserLoading && styles.buttonDisabled]}
              onPress={handleManageEmployees}>
              <Text style={styles.buttonText}>Gestionar Empleados</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, authUserLoading && styles.buttonDisabled]}
              onPress={handlePurchaseBeCoins}>
              <Text style={styles.buttonText}>Comprar beCoins</Text>
            </TouchableOpacity>
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

export default EmpresaPanel;
