// FileName: /EmpresaPanel.tsx
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

interface EmpresaPanelProps {
  user: AuthUser;
}

const EmpresaPanel: React.FC<EmpresaPanelProps> = ({ user }) => {
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
  const [employeesCount] = useState(120);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser>(user); // Estado para el usuario actual

  // Sincronizar currentUser si la prop 'user' cambia
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

  const handleManageEmployees = () => {
    window.alert(
      "Gestionar Empleados: Funcionalidad para gestionar empleados (pendiente de implementar)."
    );
  };

  const handlePurchaseBeCoins = () => {
    window.alert(
      "Comprar beCoins: Funcionalidad para comprar beCoins (pendiente de implementar)."
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

          <View style={styles.empresaBalanceCard}>
            <Text style={styles.empresaBalanceLabel}>beCoins Disponibles</Text>
            {resourcesLoading && beCoinsBalance === null ? (
              <ActivityIndicator size="large" color="#bfdbfe" />
            ) : (
              <Text style={styles.empresaBalanceValue}>
                {beCoinsBalance} BCD
              </Text>
            )}
          </View>

          <View style={styles.empresaStatCard}>
            <Text style={styles.title}>Empleados</Text>
            <Text style={styles.empresaStatValue}>{employeesCount}</Text>
            <Text style={styles.empresaStatLabel}>Total de empleados</Text>
          </View>

          <View style={{ gap: 12, marginBottom: 20 }}>
            <TouchableOpacity
              style={[styles.button, authUserLoading && styles.buttonDisabled]}
              onPress={handleManageEmployees}>
              <Text style={styles.textCenter}>Gestionar Empleados</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, authUserLoading && styles.buttonDisabled]}
              onPress={handlePurchaseBeCoins}>
              <Text style={styles.textCenter}>Comprar beCoins</Text>
            </TouchableOpacity>
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

export default EmpresaPanel;
