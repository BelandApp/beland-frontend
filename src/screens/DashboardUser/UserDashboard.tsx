import React from "react";
import { useAuth } from "src/context";
import SuperAdminPanel from "./components/panels/SuperAdminPanel";
import AdminPanel from "./components/panels/AdminPanel";
import LeaderPanel from "./components/panels/LeaderPanel";
import EmpresaPanel from "./components/panels/EmpresaPanel";
import { UserPanel } from "./components/panels";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

export const UserDashboard: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
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
      </View>
    );
  }

  // Normalizar el rol: `user.role` puede ser string o un objeto { name }
  const rawRole =
    typeof (user as any).role === "string"
      ? (user as any).role
      : (user as any).role?.name ||
        (user as any).role?.role_name ||
        (user as any).role_name ||
        "USER";

  const role = rawRole.toString().toUpperCase();

  switch (role) {
    case "SUPERADMIN":
      return <SuperAdminPanel />;
    case "ADMIN":
      return <AdminPanel />;
    case "LEADER":
      return <LeaderPanel />;
    case "EMPRESA":
      return <EmpresaPanel />;
    case "USER":
      return <SuperAdminPanel />;
    default:
      console.error("[UserDashboard] rol desconocido:", {
        role,
        rawRole,
        user,
      });
      return (
        <View style={styles.container}>
          <Text style={styles.errorText}>
            No se reconoce tu rol. Contacta al soporte.
          </Text>
        </View>
      );
  }
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
