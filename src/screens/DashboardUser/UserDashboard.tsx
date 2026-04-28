import React from "react";
import { useAuth, UserRole } from "src/context";
import SuperAdminPanel from "./components/panels/SuperAdminPanel";
import AdminPanel from "./components/panels/AdminPanel";
import LeaderPanel from "./components/panels/LeaderPanel";
import EmpresaPanel from "./components/panels/EmpresaPanel";
import { UserPanel } from "./components/panels";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Button } from "src/components";
import { useCustomNavigation } from "src/hooks";

export const UserDashboard: React.FC = () => {
  const { user, status, isAdmin } = useAuth();
  const { navigate } = useCustomNavigation();

  if (status === "loading") {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando datos del usuario...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          No se pudo cargar la información del usuario. Intente iniciar sesión
          nuevamente.
        </Text>
        <Button title="Loguearte" onPress={() => navigate("Login")} />
      </View>
    );
  }

  if (isAdmin()) {
    return <SuperAdminPanel />;
  }
  return <UserPanel />;

  // old architecture TODO eliminar cuando sea safe
  // switch (role) {
  //   case UserRole.SUPERADMIN:
  //     return <SuperAdminPanel />;
  //   case UserRole.ADMIN:
  //     return <AdminPanel />;
  //   case UserRole.LEADER:
  //     return <LeaderPanel />;
  //   case UserRole.EMPRESA:
  //     return <EmpresaPanel />;
  //   case UserRole.USER:
  //     return <UserPanel />;
  //   default:
  //     console.error("[UserDashboard] rol desconocido:", {
  //       role,
  //       user,
  //     });
  //     return (
  //       <View style={styles.container}>
  //         <Text style={styles.errorText}>
  //           No se reconoce tu rol. Contacta al soporte.
  //         </Text>
  //       </View>
  //     );
  // }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 18,
    color: "#E53E3E",
    textAlign: "center",
  },
});

export default UserDashboard;
